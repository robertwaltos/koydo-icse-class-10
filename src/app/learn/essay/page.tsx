import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";
import { EssayJudge } from "@/components/learn/EssayJudge";

export const metadata: Metadata = { title: `Essay Practice — ${EXAM_CONFIG.name}` };

export default async function EssayPage() {
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
        <span className="text-6xl mb-4 block">✍️</span>
        <h1 className="text-2xl font-bold mb-3">AI Essay Evaluation — Premium</h1>
        <p className="text-[var(--muted)] mb-3">
          Write an {EXAM_CONFIG.name} essay and get instant AI-powered feedback scored on the official rubric.
        </p>
        <ul className="text-sm text-[var(--muted)] mb-8 space-y-1 text-left inline-block">
          <li>• Scored on 5 dimensions (1–6 each)</li>
          <li>• Composite score estimate</li>
          <li>• Specific strengths + improvements</li>
          <li>• Model paragraph rewrite</li>
        </ul>
        <div className="block" />
        <Link href={`https://koydo.app/pricing?exam=${EXAM_CONFIG.slug}&cadence=annual`}
          className="koydo-btn-primary text-base px-8 py-3">
          Unlock Premium
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/learn" className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Study Hub</Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Essay Practice</h1>
        <p className="text-sm text-[var(--muted)]">
          Write your essay below. AI will score it on the official {EXAM_CONFIG.name} writing rubric.
        </p>
      </div>
      <EssayJudge />
    </div>
  );
}
