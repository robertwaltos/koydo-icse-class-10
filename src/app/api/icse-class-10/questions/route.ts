import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const EXAM_ID = "icse-class-10";
const FREE_DAILY_LIMIT = 10;

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);

  let query = supabase
    .from("testing_question_bank")
    .select("id, question_text, question_type, difficulty, domain, options, correct_answer, explanation")
    .eq("exam_id", EXAM_ID)
    .limit(limit);

  if (domain) query = query.eq("domain", domain);

  const { data: questions, error } = await query;

  if (error) {
    return NextResponse.json(
      { examId: EXAM_ID, questions: [], error: error.message },
      { status: 500 },
    );
  }

  let remaining = FREE_DAILY_LIMIT;

  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .limit(1)
      .maybeSingle();

    if (sub) {
      remaining = -1; // unlimited
    } else {
      const today = new Date().toISOString().slice(0, 10);
      const { count } = await supabase
        .from("testing_attempt_answers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00Z`);
      remaining = Math.max(0, FREE_DAILY_LIMIT - (count ?? 0));
    }
  }

  return NextResponse.json({
    examId: EXAM_ID,
    questions: questions ?? [],
    dailyLimit: FREE_DAILY_LIMIT,
    remaining,
  });
}
