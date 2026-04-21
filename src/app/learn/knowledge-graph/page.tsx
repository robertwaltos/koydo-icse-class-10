import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";

export const metadata: Metadata = { title: `Knowledge Graph — ${EXAM_CONFIG.name}` };

export default async function KnowledgeGraphPage({ searchParams }: { searchParams: Promise<{ concept?: string }> }) {
  const { concept } = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: concepts } = await supabase
    .from("meridian_concepts")
    .select("id, slug, canonical_name, short_description, quality_tier, domain_code, learner_stage")
    .in("quality_tier", ["silver", "gold"])
    .limit(50);

  const selected = concept ? concepts?.find((c) => c.slug === concept) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/learn" className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Study Hub</Link>
      <h1 className="text-2xl font-bold mb-2">Knowledge Graph</h1>
      <p className="text-sm text-[var(--muted)] mb-8">
        Powered by <a href="https://koydo.app/meridian" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Koydo Meridian</a> — explore concepts and their relationships.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          {selected ? (
            <div className="koydo-card p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-bold">{selected.canonical_name}</h2>
                <span className="rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-xs font-medium text-[var(--accent)] capitalize">{selected.quality_tier}</span>
              </div>
              <p className="text-sm text-[var(--muted)] mb-4">{selected.short_description ?? "No description available."}</p>
              <div className="flex gap-3 flex-wrap">
                {selected.domain_code && <span className="rounded-full border border-[var(--card-border)] px-3 py-1 text-xs">{selected.domain_code}</span>}
                {selected.learner_stage && <span className="rounded-full border border-[var(--card-border)] px-3 py-1 text-xs capitalize">{selected.learner_stage}</span>}
              </div>
              <Link href="/learn/practice" className="mt-6 koydo-btn-primary inline-flex text-sm">Practice this concept →</Link>
            </div>
          ) : (
            <div className="koydo-card p-6 text-center">
              <p className="text-4xl mb-3">🔮</p>
              <p className="text-sm text-[var(--muted)]">Select a concept from the list to explore it.</p>
            </div>
          )}
        </div>

        <aside>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">Concepts</h3>
          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
            {(concepts ?? []).map((c) => (
              <Link key={c.id} href={`/learn/knowledge-graph?concept=${c.slug}`}
                className={["flex items-center gap-2 rounded-lg p-2.5 text-sm transition hover:bg-[var(--card)]",
                  c.slug === concept ? "bg-[var(--accent-light)] text-[var(--accent)]" : "text-[var(--foreground)]"].join(" ")}>
                <span className="text-xs opacity-60">{c.quality_tier === "gold" ? "★" : "◆"}</span>
                <span className="truncate">{c.canonical_name}</span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
