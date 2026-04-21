import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";

export const metadata: Metadata = { title: `Account — ${EXAM_CONFIG.name}` };

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: entitlement }, { data: attempts }, { data: profile }] = await Promise.all([
    supabase.from("microapp_user_entitlements").select("status, expires_at, plan_id").eq("user_id", user!.id).eq("app_id", `koydo_${EXAM_CONFIG.slug}`).maybeSingle(),
    supabase.from("testing_exam_attempts").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("exam_id", EXAM_CONFIG.slug),
    supabase.from("user_profiles").select("display_name, avatar_url, created_at").eq("user_id", user!.id).maybeSingle(),
  ]);

  const isPremium = (entitlement as { status: string } | null)?.status === "active";
  const displayName = (profile as { display_name: string | null } | null)?.display_name ?? user!.email?.split("@")[0] ?? "User";
  const memberSince = user!.created_at ? new Date(user!.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—";
  const totalAttempts = (attempts as unknown as { count: number } | null)?.count ?? 0;

  return (
    <div>
      <div className="mb-8 flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)] text-2xl font-bold text-white">
          {displayName[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold">{displayName}</h1>
          <p className="text-sm text-[var(--muted)]">{user!.email}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">Member since {memberSince}</p>
        </div>
        {isPremium && (
          <span className="ml-auto premium-badge">Premium</span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { label: "Plan", value: isPremium ? "Premium" : "Free", sub: isPremium ? (entitlement as { expires_at: string | null })?.expires_at ? `Renews ${new Date((entitlement as { expires_at: string }).expires_at).toLocaleDateString()}` : "Active" : "Upgrade for full access" },
          { label: "Practice Sessions", value: totalAttempts.toString(), sub: `${EXAM_CONFIG.name} total` },
          { label: "Exam", value: EXAM_CONFIG.name, sub: EXAM_CONFIG.slug },
        ].map((stat) => (
          <div key={stat.label} className="koydo-card p-5">
            <p className="text-xs text-[var(--muted)] mb-1">{stat.label}</p>
            <p className="text-2xl font-bold mb-0.5">{stat.value}</p>
            <p className="text-xs text-[var(--muted)]">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { href: "/account/subscription", icon: "💎", title: "Subscription", desc: isPremium ? "Manage your premium plan" : "Upgrade to Premium" },
          { href: "/account/billing", icon: "🧾", title: "Billing History", desc: "View past invoices and payments" },
          { href: "/account/settings", icon: "⚙️", title: "Settings", desc: "Language, theme, notifications" },
          { href: "/learn/progress", icon: "📊", title: "My Progress", desc: "View scores across all topics" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="koydo-card flex items-center gap-4 p-4 hover:border-[var(--accent)] transition">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-xs text-[var(--muted)]">{item.desc}</p>
            </div>
            <span className="ml-auto text-[var(--muted)]">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
