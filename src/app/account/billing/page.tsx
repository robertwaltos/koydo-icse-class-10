import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";

export const metadata: Metadata = { title: `Billing — ${EXAM_CONFIG.name}` };

export default async function BillingPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: invoices } = await supabase
    .from("stripe_invoices")
    .select("id, amount_paid, currency, status, created_at, invoice_pdf")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">Billing History</h1>
      <p className="text-sm text-[var(--muted)] mb-8">All payments for {EXAM_CONFIG.name} Premium.</p>

      {!invoices?.length ? (
        <div className="koydo-card p-12 text-center">
          <span className="text-4xl mb-3 block">🧾</span>
          <p className="font-semibold mb-1">No invoices yet</p>
          <p className="text-sm text-[var(--muted)]">Your billing history will appear here once you subscribe.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(invoices as { id: string; amount_paid: number; currency: string; status: string; created_at: string; invoice_pdf: string | null }[]).map((inv) => (
            <div key={inv.id} className="koydo-card flex items-center gap-4 p-4">
              <span className="text-xl">🧾</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{EXAM_CONFIG.name} Premium</p>
                <p className="text-xs text-[var(--muted)]">{new Date(inv.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
              <span className={["rounded-full px-2 py-0.5 text-xs font-medium", inv.status === "paid" ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/10 text-[var(--warning)]"].join(" ")}>
                {inv.status}
              </span>
              <span className="text-sm font-bold">{new Intl.NumberFormat("en-US", { style: "currency", currency: (inv.currency ?? "usd").toUpperCase() }).format(inv.amount_paid / 100)}</span>
              {inv.invoice_pdf && (
                <a href={inv.invoice_pdf} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent)] hover:underline">PDF</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
