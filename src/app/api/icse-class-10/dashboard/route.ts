import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const EXAM_ID = "icse-class-10";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { count: totalQuestions } = await supabase
    .from("testing_question_bank")
    .select("*", { count: "exact", head: true })
    .eq("exam_id", EXAM_ID);

  if (!user) {
    return NextResponse.json({
      examId: EXAM_ID,
      slug: EXAM_ID,
      stats: { totalQuestions: totalQuestions ?? 0, completedQuestions: 0, averageScore: 0 },
      recentAttempts: [],
    });
  }

  const { data: attempts } = await supabase
    .from("testing_exam_attempts")
    .select("id, score, max_score, started_at, completed_at")
    .eq("user_id", user.id)
    .eq("exam_id", EXAM_ID)
    .order("started_at", { ascending: false })
    .limit(5);

  const { count: completedQuestions } = await supabase
    .from("testing_attempt_answers")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const avgScore = attempts?.length
    ? attempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / attempts.length
    : 0;

  return NextResponse.json({
    examId: EXAM_ID,
    slug: EXAM_ID,
    stats: {
      totalQuestions: totalQuestions ?? 0,
      completedQuestions: completedQuestions ?? 0,
      averageScore: Math.round(avgScore * 10) / 10,
    },
    recentAttempts: attempts ?? [],
  });
}
