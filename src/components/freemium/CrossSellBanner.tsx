import Link from "next/link";
import type { CrossSellApp } from "@/lib/act/cross-sell";

interface Props {
  apps: CrossSellApp[];
  compact?: boolean;
}

export function CrossSellBanner({ apps, compact = false }: Props) {
  if (!apps.length) return null;

  return (
    <aside className="koydo-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)] flex items-center gap-1.5">
        <span>🎓</span> Also from Koydo
      </h3>
      <div className={compact ? "space-y-2" : "grid gap-2 sm:grid-cols-2"}>
        {apps.map((app) => (
          <a
            key={app.slug}
            href={app.url ?? `https://koydo-${app.slug}.koydo.app`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] p-3 transition hover:border-[var(--accent)] hover:bg-[var(--accent-light)] group"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] text-base group-hover:bg-[var(--accent)] group-hover:text-white transition">
              📚
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--foreground)] truncate">{app.name}</p>
              <p className="text-xs text-[var(--muted)] truncate">{app.reason}</p>
            </div>
            <span className="ml-auto text-xs text-[var(--muted)] shrink-0">Free →</span>
          </a>
        ))}
      </div>
    </aside>
  );
}

export function CrossSellGrid({ apps }: { apps: CrossSellApp[] }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h2 className="mb-6 text-xl font-bold text-center text-[var(--foreground)]">Explore More Koydo Apps</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <a
            key={app.slug}
            href={app.url ?? `https://koydo-${app.slug}.koydo.app`}
            target="_blank"
            rel="noopener noreferrer"
            className="koydo-card flex flex-col p-5 transition hover:border-[var(--accent)] hover:-translate-y-0.5"
          >
            <span className="mb-3 text-3xl">📚</span>
            <h3 className="font-semibold text-[var(--foreground)] mb-1">{app.name}</h3>
            <p className="text-sm text-[var(--muted)] flex-1">{app.reason}</p>
            <span className="mt-3 text-xs font-medium text-[var(--accent)]">Try free →</span>
          </a>
        ))}
      </div>
    </section>
  );
}
