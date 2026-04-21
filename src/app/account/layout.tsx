import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

const NAV = [
  { href: "/account", label: "Overview" },
  { href: "/account/subscription", label: "Subscription" },
  { href: "/account/billing", label: "Billing" },
  { href: "/account/settings", label: "Settings" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?returnTo=/account");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="mb-8 flex gap-1 border-b border-[var(--card-border)]">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href}
            className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition border-b-2 border-transparent data-[active=true]:border-[var(--accent)] data-[active=true]:text-[var(--foreground)]">
            {n.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
