import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";
import { CONTENT_MANIFEST } from "@/lib/act/content/manifest";
import { getCrossSellApps } from "@/lib/act/cross-sell";
import { MeridianPanel } from "@/components/meridian/MeridianPanel";
import { CrossSellBanner } from "@/components/freemium/CrossSellBanner";
import { DailyLimitBanner } from "@/components/paywall/PremiumGate";
import { DailyGoal } from "@/components/learn/DailyGoal";

export const metadata: Metadata = {
  title: `Study Hub — ${EXAM_CONFIG.name}`,
  description: `Your personalised ${EXAM_CONFIG.name} study dashboard. Practice questions, mock exams, flashcards, and AI tutor.`,
};

async function getDailyQuestionsUsed(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase
    .from("ai_explain_usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("usage_date", today);
  return count ?? 0;
}

export default async function LearnPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Resolve exam UUID (exam_id in testing_exam_attempts is a UUID FK)
  const { data: examRow } = await supabase.from("testing_exams")
    .select("id").eq("exam_code", EXAM_CONFIG.slug).maybeSingle();

  const [dailyUsed, attemptsResult, conceptsResult, entitlementResult] = await Promise.all([
    getDailyQuestionsUsed(user.id),
    examRow
      ? supabase
          .from("testing_exam_attempts")
          .select("id, score, domain, completed_at")
          .eq("user_id", user.id)
          .eq("exam_id", examRow.id)
          .order("completed_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] }),
    supabase
      .from("meridian_concepts")
      .select("id, slug, canonical_name, short_description, quality_tier, domain_code")
      .in("quality_tier", ["silver", "gold"])
      .limit(6),
    supabase
      .from("microapp_user_entitlements")
      .select("status, expires_at")
      .eq("user_id", user.id)
      .eq("app_id", `koydo_${EXAM_CONFIG.slug}`)
      .maybeSingle(),
  ]);

  const attempts = (attemptsResult.data ?? []) as Array<{
    id: string; score: number | null; domain: string | null; completed_at: string | null;
  }>;
  const concepts = (conceptsResult.data ?? []) as Array<{
    id: string; slug: string; canonical_name: string; short_description: string | null; quality_tier: string | null; domain_code: string | null;
  }>;
  const isPremium = (entitlementResult.data as { status: string } | null)?.status === "active";
  const crossSellApps = getCrossSellApps("admissions");

  const domainScores: Record<string, { total: number; count: number }> = {};
  for (const a of attempts) {
    if (a.domain && a.score !== null) {
      if (!domainScores[a.domain]) domainScores[a.domain] = { total: 0, count: 0 };
      domainScores[a.domain].total += a.score;
      domainScores[a.domain].count += 1;
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">{EXAM_CONFIG.name} Study Hub</h1>
        <p className="text-sm text-[var(--muted)]">
          {isPremium ? "Premium access active." : `${EXAM_CONFIG.freemiumGate.dailyQuestions - dailyUsed} free questions remaining today.`}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          {!isPremium && <DailyLimitBanner used={dailyUsed} limit={EXAM_CONFIG.freemiumGate.dailyQuestions} isPremium={false} />}

          <section>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Today&apos;s Activities</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ActivityCard href="/learn/practice"     icon="⚡" title="Adaptive Practice" desc="AI-selected questions targeting your weak spots" badge="Free"    color="#3B82F6" />
              <ActivityCard href="/learn/mock-exam"    icon="📋" title="Full Mock Exam"    desc={`Timed ${EXAM_CONFIG.name} format with full scoring`}             badge={isPremium ? "Unlimited" : "Premium"} locked={!isPremium} color="#8B5CF6" />
              <ActivityCard href="/learn/flashcards"   icon="🗃️" title="Flashcards"       desc="Spaced repetition for key concepts"              badge="Free"    color="#10B981" />
              <ActivityCard href="/learn/knowledge-graph" icon="🔮" title="Knowledge Graph" desc="Explore interconnected Meridian concepts"       badge="Free"    color="#F59E0B" />
              <ActivityCard href="/learn/roadmap"      icon="🗺️" title="Study Roadmap"    desc="Personalised 30-day study plan"                  badge={isPremium ? "Active" : "Premium"} locked={!isPremium} color="#EF4444" />
              <ActivityCard href="/learn/essay"         icon="✍️" title="Essay Practice"    desc="Write and get AI-scored on the official rubric"  badge={isPremium ? "Unlimited" : "Premium"} locked={!isPremium} color="#F97316" />
              <ActivityCard href="/study-rooms"        icon="👥" title="Study Rooms"       desc="Live collaborative sessions with peers"          badge={isPremium ? "Join" : "Premium"} locked={!isPremium} color="#EC4899" />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Subjects</h2>
              <Link href="/learn/progress" className="text-xs text-[var(--accent)] hover:underline">Full progress →</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {CONTENT_MANIFEST.topics.map((topic) => {
                const scores = domainScores[topic.domain];
                const avg = scores ? Math.round(scores.total / scores.count) : null;
                return (
                  <Link key={topic.id} href={`/learn/practice?domain=${topic.domain}`}
                    className="koydo-card flex items-center gap-4 p-4 transition hover:border-[var(--accent)] hover:-translate-y-0.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: `${topic.color}20` }}>{topic.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--foreground)] text-sm">{topic.title}</p>
                      <p className="text-xs text-[var(--muted)]">{topic.minQuestionCount.toLocaleString()} questions</p>
                    </div>
                    {avg !== null
                      ? <span className="text-sm font-bold" style={{ color: avg >= 70 ? "var(--success)" : "var(--warning)" }}>{avg}%</span>
                      : <span className="text-xs text-[var(--muted)]">Start →</span>}
                  </Link>
                );
              })}
            </div>
          </section>

          {attempts.length > 0 && (
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Recent Activity</h2>
              <div className="space-y-2">
                {attempts.slice(0, 5).map((a) => (
                  <div key={a.id} className="koydo-card flex items-center gap-4 p-3">
                    <span className="text-base">📊</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm capitalize text-[var(--foreground)]">{a.domain?.replace(/_/g, " ") ?? "Practice"}</p>
                      <p className="text-xs text-[var(--muted)]">{a.completed_at ? new Date(a.completed_at).toLocaleDateString() : "In progress"}</p>
                    </div>
                    {a.score !== null && (
                      <span className="text-sm font-semibold">{a.score}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {!isPremium && (
            <div className="rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">Unlock Premium</p>
              <p className="font-bold text-lg mb-1">Go unlimited</p>
              <p className="text-xs opacity-80 mb-4">Mock exams · AI tutor · Score prediction · Study rooms</p>
              <Link href={`https://koydo.app/pricing?exam=${EXAM_CONFIG.slug}&cadence=annual`}
                className="block rounded-full bg-white py-2 text-center text-sm font-semibold text-[var(--accent)] hover:bg-zinc-100 transition">
                Upgrade — $9.99/mo
              </Link>
            </div>
          )}

          <DailyGoal />
          <MeridianPanel concepts={concepts} examSlug={EXAM_CONFIG.slug} />
          <CrossSellBanner apps={crossSellApps} compact />

          <div className="koydo-card p-4">
            <p className="text-sm font-semibold mb-1">📱 Get the App</p>
            <p className="text-xs text-[var(--muted)] mb-3">Offline mode, native push reminders, 120fps UI.</p>
            <div className="flex gap-2">
              <a href="https://apps.apple.com/app/id6739452395" target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg border border-[var(--card-border)] py-2 text-center text-xs font-medium hover:bg-[var(--card)]">App Store</a>
              <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg border border-[var(--card-border)] py-2 text-center text-xs font-medium hover:bg-[var(--card)]">Google Play</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ActivityCard({ href, icon, title, desc, badge, color, locked = false }:
  { href: string; icon: string; title: string; desc: string; badge: string; color: string; locked?: boolean }) {
  return (
    <Link href={locked ? "/pricing" : href}
      className={["koydo-card flex flex-col gap-3 p-4 transition",
        locked ? "opacity-70 hover:border-[var(--gold)]" : "hover:border-[var(--accent)] hover:-translate-y-0.5"].join(" ")}>
      <div className="flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xl" style={{ background: `${color}20` }}>{locked ? "🔒" : icon}</span>
        <span className={["rounded-full px-2 py-0.5 text-xs font-medium", badge === "Premium" ? "premium-badge" : "bg-[var(--accent-light)] text-[var(--accent)]"].join(" ")}>{badge}</span>
      </div>
      <div>
        <p className="text-sm font-semibold mb-0.5">{title}</p>
        <p className="text-xs text-[var(--muted)] leading-snug">{desc}</p>
      </div>
    </Link>
  );
}
