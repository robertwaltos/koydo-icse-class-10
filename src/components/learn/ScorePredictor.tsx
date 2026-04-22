"use client";

import { useMemo } from "react";

interface DomainStat {
  attempts: number;
  best: number;
  avg: number;
}

interface Props {
  domainStats: Record<string, DomainStat>;
}

// ACT section → list of domains that contribute to it
const SECTION_DOMAINS: Record<string, string[]> = {
  English:  ["English", "Writing", "Grammar", "Language", "Rhetoric"],
  Math:     ["Mathematics", "Math", "Algebra", "Geometry", "Statistics", "Trigonometry"],
  Reading:  ["Reading", "Comprehension", "Literature", "Social Science", "Natural Science"],
  Science:  ["Science", "Biology", "Chemistry", "Physics", "Earth"],
};

// % accuracy → ACT score (1-36)
function accuracyToActScore(pct: number): number {
  if (pct >= 95) return 35;
  if (pct >= 88) return 32;
  if (pct >= 80) return 29;
  if (pct >= 72) return 26;
  if (pct >= 64) return 23;
  if (pct >= 56) return 20;
  if (pct >= 48) return 17;
  if (pct >= 40) return 14;
  return 11;
}

function sectionScore(section: string, domainStats: Record<string, DomainStat>): number | null {
  const keywords = SECTION_DOMAINS[section];
  const matching: number[] = [];
  for (const [domain, stat] of Object.entries(domainStats)) {
    if (keywords.some((k) => domain.toLowerCase().includes(k.toLowerCase()))) {
      matching.push(stat.avg);
    }
  }
  if (!matching.length) return null;
  const avg = matching.reduce((a, b) => a + b, 0) / matching.length;
  return accuracyToActScore(avg);
}

export function ScorePredictor({ domainStats }: Props) {
  const hasSomeData = Object.values(domainStats).some((s) => s.attempts > 0);

  const sections = useMemo(() => {
    return Object.entries(SECTION_DOMAINS).map(([name]) => ({
      name,
      score: sectionScore(name, domainStats),
    }));
  }, [domainStats]);

  const filledSections = sections.filter((s) => s.score !== null);
  const composite = filledSections.length === 4
    ? Math.round(filledSections.reduce((sum, s) => sum + s.score!, 0) / 4)
    : filledSections.length > 0
      ? Math.round(filledSections.reduce((sum, s) => sum + s.score!, 0) / filledSections.length)
      : null;

  const compositeColor = composite
    ? composite >= 30 ? "var(--success)"
    : composite >= 24 ? "var(--accent)"
    : composite >= 18 ? "var(--warning)"
    : "var(--error)"
    : "var(--muted)";

  if (!hasSomeData) return null;

  return (
    <div className="koydo-card p-6 mb-8">
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h2 className="font-bold text-base mb-0.5">Predicted Score</h2>
          <p className="text-xs text-[var(--muted)]">Based on your practice performance · Updates with each session</p>
        </div>
        {composite && (
          <div className="text-center">
            <p className="text-4xl font-black" style={{ color: compositeColor }}>{composite}</p>
            <p className="text-xs text-[var(--muted)]">/ 36 Composite</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {sections.map(({ name, score }) => (
          <div key={name} className="rounded-xl bg-[var(--surface-2)] p-3 text-center">
            <p className="text-xs text-[var(--muted)] mb-1">{name}</p>
            {score !== null ? (
              <>
                <p className="text-2xl font-bold text-[var(--foreground)]">{score}</p>
                <div className="mt-2 h-1.5 rounded-full bg-[var(--card-border)]">
                  <div className="h-1.5 rounded-full transition-all" style={{
                    width: `${((score - 1) / 35) * 100}%`,
                    background: score >= 30 ? "var(--success)" : score >= 24 ? "var(--accent)" : "var(--warning)",
                  }} />
                </div>
              </>
            ) : (
              <p className="text-xs text-[var(--muted)] mt-2">Practice to unlock</p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-[var(--muted)]">
        Predictions improve with more practice sessions. Complete a full mock exam for the most accurate estimate.
      </p>
    </div>
  );
}
