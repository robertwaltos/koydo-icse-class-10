import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";

export const metadata: Metadata = { title: `Mock Exam — ${EXAM_CONFIG.name}` };

export default async function MockExamPage() {
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
        <p className="text-[var(--muted)] mb-8">Timed, full-length {EXAM_CONFIG.name} practice tests with complete scoring, section breakdowns, and AI-powered score prediction. Mirrors the real exam format exactly.</p>
        <Link href={`https://koydo.app/pricing?exam=${EXAM_CONFIG.slug}&cadence=annual`}
          className="koydo-btn-primary text-base px-8 py-3">Unlock Premium</Link>
        <p className="mt-4 text-sm text-[var(--muted)]">or <Link href="/pricing" className="text-[var(--accent)] hover:underline">compare plans</Link></p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/learn" className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Study Hub</Link>
      <h1 className="text-2xl font-bold mb-2">Full Mock Exam</h1>
      <p className="text-sm text-[var(--muted)] mb-8">Official-format, timed practice test with complete scoring.</p>
      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        {[
          { title: "Full Test (3h 35m)", desc: "All 4 sections", sections: "English + Math + Reading + Science", icon: "📋", duration: "215 min" },
          { title: "English Only", desc: "75 questions · 45 min", sections: "Grammar, usage, rhetorical skills", icon: "✍️", duration: "45 min" },
          { title: "Mathematics Only", desc: "60 questions · 60 min", sections: "Pre-Algebra through Trigonometry", icon: "📐", duration: "60 min" },
          { title: "Reading Only", desc: "40 questions · 35 min", sections: "Prose fiction, social science, humanities, natural science", icon: "📖", duration: "35 min" },
        ].map((t) => (
          <button key={t.title} className="koydo-card text-left p-5 hover:border-[var(--accent)] transition hover:-translate-y-0.5">
            <span className="text-2xl mb-3 block">{t.icon}</span>
            <h3 className="font-semibold mb-1">{t.title}</h3>
            <p className="text-xs text-[var(--muted)] mb-2">{t.desc}</p>
            <p className="text-xs text-[var(--muted)]">{t.sections}</p>
            <span className="mt-3 inline-block rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
              ⏱ {t.duration}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-[var(--muted)] text-center">Content is generated to mirror official formats. Not affiliated with ACT, Inc.</p>
    </div>
  );
}
