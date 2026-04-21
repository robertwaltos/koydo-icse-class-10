import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";

export const metadata: Metadata = { title: `Subscription — ${EXAM_CONFIG.name}` };

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: "$9.99",
    period: "/month",
    features: ["Unlimited practice questions", "All mock exams", "AI explanations (unlimited)", "Study roadmap", "Study rooms access", "Knowledge graph explorer"],
    highlight: false,
  },
  {
    id: "annual",
    label: "Annual",
    price: "$5.83",
    period: "/month",
    badge: "Save 42%",
    features: ["Everything in Monthly", "Priority AI responses", "Offline mode (mobile)", "Export progress reports", "Early access to new features"],
    highlight: true,
  },
];

export default async function SubscriptionPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: entitlement } = await supabase
    .from("microapp_user_entitlements")
    .select("status, plan_id, expires_at, stripe_subscription_id")
    .eq("user_id", user!.id)
    .eq("app_id", `koydo_${EXAM_CONFIG.slug}`)
    .maybeSingle();

  const isPremium = (entitlement as { status: string } | null)?.status === "active";
  const planId = (entitlement as { plan_id: string | null } | null)?.plan_id;
  const expiresAt = (entitlement as { expires_at: string | null } | null)?.expires_at;

  if (isPremium) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-2">Your Subscription</h1>
        <p className="text-sm text-[var(--muted)] mb-8">Manage your {EXAM_CONFIG.name} Premium plan.</p>

        <div className="koydo-card p-6 mb-6 border-[var(--accent)]">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl">💎</span>
            <div>
              <p className="font-bold text-lg">Premium {planId === "annual" ? "Annual" : "Monthly"}</p>
              <p className="text-sm text-[var(--muted)]">
                {expiresAt ? `Renews ${new Date(expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}` : "Active"}
              </p>
            </div>
            <span className="ml-auto premium-badge">Active</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {["Unlimited practice", "All mock exams", "AI explanations", "Study roadmap", "Study rooms", "Knowledge graph"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-[var(--muted)]">
                <span className="text-[var(--success)]">✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`https://koydo.app/billing?exam=${EXAM_CONFIG.slug}`} className="koydo-btn-ghost text-sm px-4 py-2" target="_blank" rel="noopener noreferrer">
            Manage Billing →
          </Link>
          <Link href={`https://koydo.app/cancel?exam=${EXAM_CONFIG.slug}`} className="text-sm text-[var(--muted)] hover:text-[var(--error)] px-4 py-2">
            Cancel subscription
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">Upgrade to Premium</h1>
      <p className="text-sm text-[var(--muted)] mb-8">Unlock everything in {EXAM_CONFIG.name}.</p>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        {PLANS.map((plan) => (
          <div key={plan.id} className={["koydo-card p-6 relative", plan.highlight ? "border-[var(--accent)]" : ""].join(" ")}>
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--accent)] px-3 py-0.5 text-xs font-bold text-white">{plan.badge}</span>
            )}
            <p className="font-bold text-lg mb-1">{plan.label}</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-sm text-[var(--muted)]">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <span className="text-[var(--success)]">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href={`https://koydo.app/pricing?exam=${EXAM_CONFIG.slug}&cadence=${plan.id}`}
              className={plan.highlight ? "koydo-btn-primary w-full text-center block py-2.5" : "koydo-btn-ghost w-full text-center block py-2.5"}>
              Get {plan.label}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-[var(--muted)]">
        Cancel anytime. Questions? <a href="mailto:support@koydo.app" className="text-[var(--accent)] hover:underline">support@koydo.app</a>
      </p>
    </div>
  );
}
