import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";
import { CONTENT_MANIFEST } from "@/lib/act/content/manifest";

export const metadata: Metadata = { title: `Practice — ${EXAM_CONFIG.name}` };

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ domain?: string }> }) {
  const { domain } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const topic = domain ? CONTENT_MANIFEST.topics.find((t) => t.domain === domain) : null;
  const today = new Date().toISOString().split("T")[0];
  const { count: usedToday } = await supabase
    .from("testing_exam_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .gte("started_at", today);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/learn" className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Study Hub</Link>
      <h1 className="text-2xl font-bold mb-2">{topic ? topic.title : EXAM_CONFIG.name} Practice</h1>
      <p className="text-sm text-[var(--muted)] mb-8">Adaptive questions powered by AI — focuses on your weakest areas.</p>

      {/* Domain selector */}
      {!topic && (
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          {CONTENT_MANIFEST.topics.map((t) => (
            <Link key={t.id} href={`/learn/practice?domain=${t.domain}`}
              className="koydo-card flex items-center gap-3 p-4 hover:border-[var(--accent)] transition">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xl" style={{ background: `${t.color}20` }}>{t.icon}</span>
              <div>
                <p className="text-sm font-medium">{t.title}</p>
                <p className="text-xs text-[var(--muted)]">{t.minQuestionCount.toLocaleString()} questions</p>
              </div>
            </Link>
          ))}
          <Link href="/learn/practice?domain=all"
            className="koydo-card flex items-center gap-3 p-4 hover:border-[var(--accent)] transition col-span-full">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xl bg-[var(--accent-light)]">🎲</span>
            <div><p className="text-sm font-medium">Mixed Practice</p><p className="text-xs text-[var(--muted)]">Random questions across all subjects</p></div>
          </Link>
        </div>
      )}

      {topic && (
        <div className="koydo-card p-8 text-center">
          <span className="text-5xl mb-4 block">{topic.icon}</span>
          <h2 className="font-bold text-xl mb-2">{topic.title} Practice</h2>
          <p className="text-sm text-[var(--muted)] mb-6">{topic.minQuestionCount.toLocaleString()} questions available · Adaptive difficulty · Instant AI explanations</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="koydo-btn-primary">Start Practice Session</button>
            <Link href="/learn/practice" className="koydo-btn-ghost text-sm py-2 px-6">Choose Different Subject</Link>
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">{EXAM_CONFIG.freemiumGate.dailyQuestions - (usedToday ?? 0)} free questions remaining today</p>
        </div>
      )}
    </div>
  );
}
