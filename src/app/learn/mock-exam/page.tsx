import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";
import { MockExamSession } from "@/components/learn/MockExamSession";

export const metadata: Metadata = { title: `Mock Exam — ${EXAM_CONFIG.name}` };

export default async function MockExamPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
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
        <span className="text-6xl mb-4 block">📋</span>
        <h1 className="text-2xl font-bold mb-3">Full Mock Exams — Premium</h1>
        <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">
          Timed, full-length {EXAM_CONFIG.name} practice tests with complete scoring,
          section breakdowns, and estimated score prediction.
        </p>
        <Link href={`https://koydo.app/pricing?exam=${EXAM_CONFIG.slug}&cadence=annual`}
          className="koydo-btn-primary text-base px-8 py-3">Unlock Premium →</Link>
        <p className="mt-4 text-sm text-[var(--muted)]">
          or <Link href="/pricing" className="text-[var(--accent)] hover:underline">compare plans</Link>
        </p>
      </div>
    );
  }

  if (mode === "exam") {
    return <MockExamSession />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/learn" className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Study Hub</Link>
      <h1 className="text-2xl font-bold mb-2">Mock Exams</h1>
      <p className="text-sm text-[var(--muted)] mb-8">Timed, full-format practice tests that mirror the real {EXAM_CONFIG.name}.</p>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        {[
          { title: "Full Test", desc: "All 4 sections", detail: "215 questions · 3h 35m", icon: "📋", href: "/learn/mock-exam?mode=exam" },
          { title: "English Only", desc: "75 questions · 45 min", detail: "Grammar, usage, rhetorical skills", icon: "✍️", href: "/learn/mock-exam?mode=exam&section=english" },
          { title: "Mathematics Only", desc: "60 questions · 60 min", detail: "Pre-Algebra through Trigonometry", icon: "📐", href: "/learn/mock-exam?mode=exam&section=math" },
          { title: "Science Only", desc: "40 questions · 35 min", detail: "Data representation, research summaries", icon: "🔬", href: "/learn/mock-exam?mode=exam&section=science" },
        ].map((t) => (
          <Link key={t.title} href={t.href}
            className="koydo-card text-left p-5 hover:border-[var(--accent)] transition hover:-translate-y-0.5 block">
            <span className="text-2xl mb-3 block">{t.icon}</span>
            <h3 className="font-semibold mb-1">{t.title}</h3>
            <p className="text-xs text-[var(--muted)] mb-1">{t.desc}</p>
            <p className="text-xs text-[var(--muted)] opacity-70">{t.detail}</p>
          </Link>
        ))}
      </div>

      <p className="text-xs text-[var(--muted)] text-center">
        Content mirrors official formats. Not affiliated with ACT, Inc.
      </p>
    </div>
  );
}
