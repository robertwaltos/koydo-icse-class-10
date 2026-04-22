import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";

const FREE_DAILY_QUESTIONS = 10;

async function md5(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const difficulty = searchParams.get("difficulty");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);

  const { data: exam } = await supabase.from("testing_exams")
    .select("id").eq("exam_code", EXAM_CONFIG.slug).maybeSingle();
  if (!exam) return Response.json({ questions: [] });

  const { data: entitlement } = await supabase
    .from("microapp_user_entitlements").select("status")
    .eq("user_id", user.id).eq("app_id", `koydo_${EXAM_CONFIG.slug}`).maybeSingle();
  const isPremium = (entitlement as { status: string } | null)?.status === "active";

  if (!isPremium) {
    const today = new Date().toISOString().slice(0, 10);
    const { count } = await supabase.from("testing_exam_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id).eq("exam_id", exam.id).gte("started_at", today);
    if ((count ?? 0) >= FREE_DAILY_QUESTIONS) {
      return Response.json({ error: "daily_limit", limit: FREE_DAILY_QUESTIONS }, { status: 429 });
    }
  }

  let query = supabase.from("testing_question_bank")
    .select("id, question_text, options, correct_answer_hash, explanation, domain, difficulty")
    .eq("exam_id", exam.id)
    .eq("visible", true);

  if (domain && domain !== "all") query = query.eq("domain", domain);
  if (difficulty === "easy") query = query.lte("difficulty", 0.35);
  else if (difficulty === "medium") query = query.gte("difficulty", 0.36).lte("difficulty", 0.65);
  else if (difficulty === "hard") query = query.gte("difficulty", 0.66);

  const { data: rawQuestions, error } = await query.limit(limit).order("random()");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const questions = await Promise.all(
    (rawQuestions ?? []).map(async (q) => {
      const options = (q.options as string[]) ?? [];
      let correct_option_index = 0;
      for (let i = 0; i < options.length; i++) {
        const hash = await md5(options[i]);
        if (hash === q.correct_answer_hash) {
          correct_option_index = i;
          break;
        }
      }
      const numDiff = typeof q.difficulty === "number" ? q.difficulty : parseFloat(q.difficulty ?? "0.5");
      const diffLabel = numDiff <= 0.35 ? "easy" : numDiff >= 0.66 ? "hard" : "medium";
      return {
        id: q.id,
        question_text: q.question_text,
        options,
        correct_option_index,
        explanation: q.explanation ?? "",
        domain: q.domain ?? "",
        difficulty: diffLabel,
      };
    })
  );

  return Response.json({ questions });
}
