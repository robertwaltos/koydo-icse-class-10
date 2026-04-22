import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";
import { CONTENT_MANIFEST } from "@/lib/act/content/manifest";
import { AdaptiveQuiz } from "@/components/learn/AdaptiveQuiz";
import { SpeedRound } from "@/components/learn/SpeedRound";

export const metadata: Metadata = { title: `Practice — ${EXAM_CONFIG.name}` };

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ domain?: string; mode?: string }> }) {
  const { domain, mode } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const topic = domain && domain !== "all"
    ? CONTENT_MANIFEST.topics.find((t) => t.domain === domain)
    : null;

  const today = new Date().toISOString().split("T")[0];
  const { count: usedToday } = await supabase
    .from("testing_exam_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .gte("started_at", today);

  const freeRemaining = EXAM_CONFIG.freemiumGate.dailyQuestions - (usedToday ?? 0);

  // Active quiz or speed session
  if (mode === "quiz" || mode === "speed") {
    return (
      <div className="min-h-screen">
        <div className="border-b border-[var(--card-border)] px-4 py-3 flex items-center justify-between">
          <Link href="/learn/practice" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Back</Link>
          <span className="text-sm font-medium">{topic?.title ?? "Mixed Practice"}</span>
          <span className="text-xs text-[var(--muted)]">{freeRemaining} free left</span>
        </div>
        <div className="mx-auto max-w-2xl px-4 py-6">
          {mode === "speed" ? <SpeedRound domain={domain} /> : <AdaptiveQuiz domain={domain} />}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/learn" className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Study Hub</Link>

      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-1">{topic ? topic.title : EXAM_CONFIG.name} Practice</h1>
          <p className="text-sm text-[var(--muted)]">Adaptive difficulty · Instant AI explanations · Weakness detection</p>
        </div>
        <div className="text-right text-xs text-[var(--muted)]">
          <p className="font-medium text-[var(--foreground)]">{freeRemaining}</p>
          <p>free questions today</p>
        </div>
      </div>

      {topic ? (
        <div className="koydo-card p-8 text-center">
          <span className="text-5xl mb-4 block">{topic.icon}</span>
          <h2 className="font-bold text-xl mb-1">{topic.title}</h2>
          <p className="text-sm text-[var(--muted)] mb-6">
            {topic.minQuestionCount.toLocaleString()} questions · Adaptive difficulty · Time tracking
          </p>
          <div className="grid grid-cols-3 gap-3 text-xs text-[var(--muted)] mb-8">
            <div className="koydo-card p-3"><p className="font-bold text-base text-[var(--foreground)]">Foundational</p><p>Easy warm-up</p></div>
            <div className="koydo-card p-3 border-[var(--accent)]"><p className="font-bold text-base text-[var(--accent)]">Standard</p><p>Exam level</p></div>
            <div className="koydo-card p-3"><p className="font-bold text-base text-[var(--foreground)]">Advanced</p><p>Top tier</p></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/learn/practice?domain=${domain}&mode=quiz`} className="koydo-btn-primary block py-3 text-center text-sm">
              Adaptive Session →
            </Link>
            <Link href={`/learn/practice?domain=${domain}&mode=speed`}
              className="rounded-full border border-[var(--card-border)] block py-3 text-center text-sm font-semibold hover:border-[var(--accent)] transition">
              ⚡ Speed Round
            </Link>
          </div>
          <Link href="/learn/practice" className="mt-3 block text-sm text-[var(--muted)] hover:text-[var(--foreground)] text-center">
            Choose different subject
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
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
          </div>
          <Link href="/learn/practice?domain=all&mode=quiz"
            className="koydo-card flex items-center gap-3 p-4 hover:border-[var(--accent)] transition col-span-full w-full">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xl bg-[var(--accent-light)]">🎲</span>
            <div>
              <p className="text-sm font-medium">Mixed Practice</p>
              <p className="text-xs text-[var(--muted)]">Adaptive questions across all subjects</p>
            </div>
          </Link>
        </>
      )}
    </div>
  );
}
