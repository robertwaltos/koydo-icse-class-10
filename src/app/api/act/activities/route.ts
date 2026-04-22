import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";

// Maps exam categories to activity subjects in activity_library
const CATEGORY_SUBJECT_MAP: Record<string, string[]> = {
  us_standardized:     ["math", "language_arts", "science", "history"],
  uk_exams:            ["math", "science", "language_arts", "history"],
  graduate:            ["math", "language_arts", "history"],
  medical:             ["science"],
  english_proficiency: ["language_arts"],
  language:            ["language_arts"],
  professional:        ["math", "history"],
  ap_exams:            ["math", "science", "language_arts", "history"],
  default:             ["math", "language_arts", "science"],
};

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "12"), 24);

  const category = EXAM_CONFIG.category ?? "default";
  const subjects = CATEGORY_SUBJECT_MAP[category] ?? CATEGORY_SUBJECT_MAP.default;

  let query = supabase
    .from("activity_library")
    .select("id, title, description, subject, activity_type, difficulty_level, estimated_minutes, thumbnail_url, is_featured")
    .eq("is_active", true)
    .in("subject", subjects)
    .limit(limit);

  // If domain filter specified, try to match by subject
  if (domain) {
    const domainLower = domain.toLowerCase();
    const matchedSubject =
      domainLower.includes("math") ? "math" :
      domainLower.includes("english") || domainLower.includes("reading") || domainLower.includes("writing") ? "language_arts" :
      domainLower.includes("science") ? "science" :
      domainLower.includes("history") ? "history" :
      null;

    if (matchedSubject) query = query.eq("subject", matchedSubject);
  }

  const { data: activities, error } = await query.order("is_featured", { ascending: false });
  if (error) return NextResponse.json({ activities: [] });

  return NextResponse.json({ activities });
}
