import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";
import { CONTENT_MANIFEST } from "@/lib/act/content/manifest";
import { PerformanceInsights } from "@/components/learn/PerformanceInsights";
import { ScorePredictor } from "@/components/learn/ScorePredictor";
import { WeakAreasDrill } from "@/components/learn/WeakAreasDrill";
import { ScoreTrend } from "@/components/learn/ScoreTrend";

export const metadata: Metadata = { title: `Progress — ${EXAM_CONFIG.name}` };

export default async function ProgressPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Resolve exam UUID
  const { data: exam } = await supabase.from("testing_exams")
    .select("id").eq("exam_code", EXAM_CONFIG.slug).maybeSingle();

  const { data: attempts } = exam
    ? await supabase
        .from("testing_exam_attempts")
        .select("id, score, domain, started_at, completed_at, domain_breakdown")
        .eq("user_id", user!.id)
        .eq("exam_id", exam.id)
        .order("started_at", { ascending: false })
        .limit(100)
    : { data: null };

  const domainStats: Record<string, { attempts: number; best: number; avg: number }> = {};
  for (const a of attempts ?? []) {
    // Use domain_breakdown JSON if available (richer than per-row score)
    const breakdown = a.domain_breakdown as Record<string, { score: number; max: number }> | null;
    if (breakdown) {
      for (const [domain, s] of Object.entries(breakdown)) {
        if (!s.max) continue;
        const pct = Math.round((s.score / s.max) * 100);
        if (!domainStats[domain]) domainStats[domain] = { attempts: 0, best: 0, avg: 0 };
        domainStats[domain].attempts++;
        domainStats[domain].best = Math.max(domainStats[domain].best, pct);
        domainStats[domain].avg = Math.round(
          (domainStats[domain].avg * (domainStats[domain].attempts - 1) + pct) / domainStats[domain].attempts,
        );
      }
    }
  }

  const weakDomains = Object.entries(domainStats)
    .filter(([, s]) => s.avg < 65 && s.attempts >= 1)
    .sort(([, a], [, b]) => a.avg - b.avg)
    .map(([d]) => d);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/learn" className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Study Hub</Link>
      <h1 className="text-2xl font-bold mb-2">My Progress</h1>
      <p className="text-sm text-[var(--muted)] mb-8">Performance across all {EXAM_CONFIG.name} subjects.</p>

      {/* Score trend — server-rendered sparkline */}
      <ScoreTrend attempts={attempts ?? []} />

      {/* Score predictor — server-rendered from attempt history */}
      <ScorePredictor domainStats={domainStats} />

      {/* Live insights panel — uses client-side answer history */}
      <div className="mb-10">
        <PerformanceInsights />
      </div>

      {/* Targeted drill for weak domains */}
      {weakDomains.length > 0 && (
        <WeakAreasDrill weakDomains={weakDomains} examSlug={EXAM_CONFIG.slug} />
      )}

      {/* Per-topic cards */}
      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        {CONTENT_MANIFEST.topics.map((topic) => {
          const stats = domainStats[topic.domain];
          return (
            <div key={topic.id} className="koydo-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xl"
                  style={{ background: `${topic.color}20` }}>{topic.icon}</span>
                <h3 className="font-semibold text-sm">{topic.title}</h3>
              </div>
              {stats ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
                      <span>Best score</span>
                      <span className="font-medium text-[var(--foreground)]">{stats.best}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--card-border)]">
                      <div className="h-2 rounded-full bg-[var(--accent)] transition-all" style={{ width: `${stats.best}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Avg: <span className="text-[var(--foreground)] font-medium">{stats.avg}%</span></span>
                    <span className="text-[var(--muted)]">{stats.attempts} session{stats.attempts !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-[var(--muted)] mb-3">No practice yet</p>
                  <Link href={`/learn/practice?domain=${topic.domain}&mode=quiz`}
                    className="text-xs text-[var(--accent)] hover:underline">Start practicing →</Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(attempts?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-4">Recent Sessions</h2>
          <div className="space-y-2">
            {(attempts ?? []).slice(0, 20).map((a) => (
              <div key={a.id} className="koydo-card flex items-center gap-4 p-3">
                <span className="text-sm capitalize flex-1">{a.domain?.replace(/_/g, " ") ?? "Mixed"}</span>
                <span className="text-xs text-[var(--muted)]">{a.started_at ? new Date(a.started_at).toLocaleDateString() : ""}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
