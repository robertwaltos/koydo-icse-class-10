import Link from "next/link";
import { EXAM_CONFIG } from "@/lib/act/config";

interface Props {
  featureName: string;
  description?: string;
  children: React.ReactNode;
  isPremium: boolean;
}

export function PremiumGate({ featureName, description, children, isPremium }: Props) {
  if (isPremium) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--gold)] bg-[var(--gold-light)]">
      {/* Blur preview */}
      <div className="pointer-events-none select-none blur-sm opacity-40" aria-hidden="true">
        {children}
      </div>
      {/* Gate overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-4xl">⭐</span>
        <h3 className="text-lg font-bold text-[var(--foreground)]">{featureName} is Premium</h3>
        {description && <p className="text-sm text-[var(--muted)] max-w-xs">{description}</p>}
        <Link
          href={`https://koydo.app/pricing?exam=${EXAM_CONFIG.slug}&cadence=annual`}
          className="koydo-btn-primary"
        >
          Unlock Premium
        </Link>
        <p className="text-xs text-[var(--muted)]">or <Link href="/pricing" className="underline">see plans</Link></p>
      </div>
    </div>
  );
}

export function DailyLimitBanner({ used, limit, isPremium }: { used: number; limit: number; isPremium: boolean }) {
  if (isPremium) return null;
  const remaining = Math.max(0, limit - used);
  const pct = Math.min(100, (used / limit) * 100);

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--foreground)]">Daily Free Questions</span>
        <span className="text-sm text-[var(--muted)]">{remaining} left</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--card-border)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all"
          style={{ width: `${pct}%`, background: pct > 80 ? "var(--error)" : "var(--accent)" }}
        />
      </div>
      {remaining === 0 && (
        <p className="mt-2 text-xs text-[var(--muted)]">
          Daily limit reached.{" "}
          <Link href="/pricing" className="text-[var(--accent)] hover:underline">
            Upgrade for unlimited access
          </Link>
        </p>
      )}
    </div>
  );
}
