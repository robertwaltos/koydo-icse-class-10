import Link from "next/link";

interface Concept {
  id: string;
  slug: string;
  canonical_name: string;
  short_description: string | null;
  quality_tier: string | null;
  domain_code: string | null;
}

interface Props {
  concepts: Concept[];
  examSlug: string;
}

export function MeridianPanel({ concepts, examSlug }: Props) {
  if (concepts.length === 0) return null;

  return (
    <aside className="koydo-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1.5">
          <span>🔮</span> Knowledge Graph
        </h3>
        <Link href="/learn/knowledge-graph"
          className="text-xs text-[var(--accent)] hover:underline">
          Explore all →
        </Link>
      </div>
      <p className="text-xs text-[var(--muted)] mb-3">Core concepts in {examSlug.toUpperCase()}</p>
      <div className="space-y-2">
        {concepts.slice(0, 6).map((c) => (
          <Link
            key={c.id}
            href={`/learn/knowledge-graph?concept=${c.slug}`}
            className="flex items-start gap-2 rounded-lg p-2 transition hover:bg-[var(--muted-bg)] group"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] text-xs font-bold text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition">
              {c.quality_tier === "gold" ? "★" : c.quality_tier === "silver" ? "◆" : "○"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-[var(--foreground)] leading-snug">{c.canonical_name}</p>
              {c.short_description && (
                <p className="mt-0.5 truncate text-xs text-[var(--muted)] leading-snug">{c.short_description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-3 border-t border-[var(--card-border)] pt-3">
        <p className="text-xs text-[var(--muted)]">
          Powered by{" "}
          <a href="https://koydo.app/meridian" target="_blank" rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline">Koydo Meridian</a>
          {" "}— open knowledge graph
        </p>
      </div>
    </aside>
  );
}
