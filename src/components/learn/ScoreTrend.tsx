"use client";

import { useMemo } from "react";

interface Attempt {
  id: string;
  score: number | null;
  started_at: string | null;
  domain: string | null;
}

interface Props {
  attempts: Attempt[];
}

// Minimal SVG sparkline for score trend
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const W = 200, H = 48;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 8) - 4;
    return `${x},${y}`;
  });
  const d = `M ${pts.join(" L ")}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12" preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]} r="3" fill={color} />
    </svg>
  );
}

export function ScoreTrend({ attempts }: Props) {
  const { chartData, weeklyAvgs, trend } = useMemo(() => {
    const sorted = [...attempts]
      .filter((a) => a.score !== null && a.started_at)
      .sort((a, b) => new Date(a.started_at!).getTime() - new Date(b.started_at!).getTime());

    if (sorted.length < 2) return { chartData: [], weeklyAvgs: [], trend: 0 };

    const scores = sorted.map((a) => a.score as number);
    const chartData = scores.slice(-20); // last 20 sessions for sparkline

    // Weekly averages
    const weeks: Record<string, number[]> = {};
    for (const a of sorted) {
      const d = new Date(a.started_at!);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!weeks[key]) weeks[key] = [];
      weeks[key].push(a.score as number);
    }
    const weeklyAvgs = Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([week, ss]) => ({
        week,
        avg: Math.round(ss.reduce((s, v) => s + v, 0) / ss.length),
        count: ss.length,
      }));

    // Trend: compare last 5 vs first 5
    const recent = scores.slice(-5);
    const early = scores.slice(0, 5);
    const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
    const earlyAvg = early.reduce((s, v) => s + v, 0) / early.length;
    const trend = recentAvg - earlyAvg;

    return { chartData, weeklyAvgs, trend };
  }, [attempts]);

  if (chartData.length < 2) return null;

  const trendColor = trend > 5 ? "var(--success)" : trend < -5 ? "var(--error)" : "var(--warning)";
  const trendLabel = trend > 5 ? `+${Math.round(trend)} improving` : trend < -5 ? `${Math.round(trend)} needs work` : "steady";

  return (
    <div className="koydo-card p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Score Trend</h3>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--surface-2)]"
          style={{ color: trendColor }}>{trendLabel}</span>
      </div>

      <div className="mb-4">
        <Sparkline values={chartData} color="var(--accent)" />
      </div>

      {weeklyAvgs.length >= 2 && (
        <div className="grid grid-cols-6 gap-1 pt-2 border-t border-[var(--card-border)]">
          {weeklyAvgs.map((w) => (
            <div key={w.week} className="text-center">
              <p className="text-xs font-bold text-[var(--foreground)]">{w.avg}</p>
              <p className="text-[10px] text-[var(--muted)]">{new Date(w.week).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
