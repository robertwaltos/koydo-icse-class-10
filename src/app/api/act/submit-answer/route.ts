import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";

async function md5(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("MD5", encoder.encode(text));
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { question_id, selected_option, attempt_id, domain } = await req.json() as {
    question_id: string; selected_option: number; attempt_id?: string; domain?: string;
  };

  const [{ data: question }, { data: exam }] = await Promise.all([
    supabase.from("testing_question_bank")
      .select("options, correct_answer_hash, explanation").eq("id", question_id).single(),
    supabase.from("testing_exams").select("id").eq("exam_code", EXAM_CONFIG.slug).maybeSingle(),
  ]);

  if (!question) return Response.json({ error: "Question not found" }, { status: 404 });

  // Resolve correct_option_index via MD5 hash matching
  const options = (question.options as string[]) ?? [];
  let correct_option_index = 0;
  for (let i = 0; i < options.length; i++) {
    if (await md5(options[i]) === question.correct_answer_hash) {
      correct_option_index = i;
      break;
    }
  }

  const isCorrect = selected_option === correct_option_index;

  if (attempt_id) {
    await supabase.from("testing_attempt_answers").insert({
      attempt_id, question_id, selected_option, is_correct: isCorrect, user_id: user.id,
    });
  } else {
    const { data: attempt } = await supabase.from("testing_exam_attempts").insert({
      user_id: user.id, exam_id: exam?.id ?? null, domain: domain ?? null,
      score: isCorrect ? 1 : 0, started_at: new Date().toISOString(), completed_at: new Date().toISOString(),
    }).select("id").single();
    if (attempt) {
      await supabase.from("testing_attempt_answers").insert({
        attempt_id: attempt.id, question_id, selected_option, is_correct: isCorrect, user_id: user.id,
      });
    }
  }

  return Response.json({ correct: isCorrect, correct_option: correct_option_index, explanation: question.explanation });
}
