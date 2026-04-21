import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";
import { CONTENT_MANIFEST } from "@/lib/act/content/manifest";

export const metadata: Metadata = { title: `Study Roadmap — ${EXAM_CONFIG.name}` };

export default async function RoadmapPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: entitlement } = await supabase
    .from("microapp_user_entitlements")
    .select("status")
    .eq("user_id", user!.id)
    .eq("app_id", `koydo_${EXAM_CONFIG.slug}`)
    .maybeSingle();
  const isPremium = (entitlement as { status: string } | null)?.status === "active";

  if (!isPremium) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <span className="text-6xl mb-4 block">🗺️</span>
        <h1 className="text-2xl font-bold mb-3">Study Roadmap — Premium</h1>
        <p className="text-[var(--muted)] mb-8">Your personalised 30-day {EXAM_CONFIG.name} study plan. AI-generated based on your current scores, target date, and weak areas.</p>
        <Link href={`https://koydo.app/pricing?exam=${EXAM_CONFIG.slug}&cadence=annual`} className="koydo-btn-primary text-base px-8 py-3">Unlock Premium</Link>
      </div>
    );
  }

  const weeks = [
    { week: 1, title: "Foundation", tasks: CONTENT_MANIFEST.topics.slice(0, 2).map((t) => ({ topic: t.title, icon: t.icon, done: false })) },
    { week: 2, title: "Core Skills", tasks: CONTENT_MANIFEST.topics.slice(2, 4).map((t) => ({ topic: t.title, icon: t.icon, done: false })) },
    { week: 3, title: "Mixed Practice", tasks: [{ topic: "Full Mixed Practice Session", icon: "⚡", done: false }, { topic: "Timed Section Drills", icon: "⏱", done: false }] },
    { week: 4, title: "Mock Exams", tasks: [{ topic: "Full Mock Exam #1", icon: "📋", done: false }, { topic: "Score Analysis + Weak Area Drill", icon: "📊", done: false }, { topic: "Full Mock Exam #2", icon: "📋", done: false }] },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/learn" className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Study Hub</Link>
      <h1 className="text-2xl font-bold mb-2">Your 30-Day Roadmap</h1>
      <p className="text-sm text-[var(--muted)] mb-8">AI-personalised study plan for {EXAM_CONFIG.name}. Update your target date to regenerate.</p>
      <div className="space-y-6">
        {weeks.map((w) => (
          <div key={w.week} className="koydo-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">W{w.week}</span>
              <h3 className="font-semibold">{w.title}</h3>
            </div>
            <div className="space-y-2">
              {w.tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] p-3">
                  <input type="checkbox" className="h-4 w-4 accent-[var(--accent)]" defaultChecked={task.done} />
                  <span className="text-base">{task.icon}</span>
                  <span className="text-sm">{task.topic}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
