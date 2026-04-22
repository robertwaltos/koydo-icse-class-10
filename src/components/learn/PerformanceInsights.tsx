"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { EXAM_CONFIG } from "@/lib/act/config";

interface AttemptAnswer {
  is_correct: boolean;
  created_at: string;
  testing_question_bank: {
    domain: string;
    difficulty: string;
  } | null;
}

interface DomainStat {
  domain: string;
  correct: number;
  total: number;
  pct: number;
}

export function PerformanceInsights() {
  const [stats, setStats] = useState<DomainStat[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Last 100 answers with domain info
      const { data: answers } = await supabase
        .from("testing_attempt_answers")
        .select("is_correct, created_at, testing_question_bank(domain, difficulty)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100) as { data: AttemptAnswer[] | null };

      if (!answers?.length) { setLoading(false); return; }

      // Domain breakdown
      const domainMap: Record<string, { correct: number; total: number }> = {};
      for (const a of answers) {
        const d = a.testing_question_bank?.domain ?? "General";
        if (!domainMap[d]) domainMap[d] = { correct: 0, total: 0 };
        domainMap[d].total++;
        if (a.is_correct) domainMap[d].correct++;
      }

      const domainStats: DomainStat[] = Object.entries(domainMap)
        .map(([domain, s]) => ({ domain, ...s, pct: Math.round((s.correct / s.total) * 100) }))
        .sort((a, b) => a.pct - b.pct);

      setStats(domainStats);

      // Streak — count consecutive days with at least 1 answer
      const days = new Set(answers.map((a) => a.created_at.slice(0, 10)));
      let s = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (days.has(d.toISOString().slice(0, 10))) s++;
        else if (i > 0) break;
      }
      setStreak(s);

      // Total exam attempts
      const { count } = await supabase
        .from("testing_exam_attempts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setTotalSessions(count ?? 0);
      setLoading(false);
    }

    load().catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-[var(--card-border)]" />;
  if (!stats.length) {
    return (
      <div className="koydo-card p-6 text-center">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-sm font-medium mb-1">No data yet</p>
        <p className="text-xs text-[var(--muted)]">Complete your first practice session to see insights.</p>
      </div>
    );
  }

  const weakest = stats[0];
  const strongest = stats[stats.length - 1];
  const overall = Math.round(stats.reduce((s, d) => s + d.pct * d.total, 0) / stats.reduce((s, d) => s + d.total, 0));

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="koydo-card p-4 text-center">
          <p className="text-2xl font-bold text-[var(--accent)]">{overall}%</p>
          <p className="text-xs text-[var(--muted)]">Overall accuracy</p>
        </div>
        <div className="koydo-card p-4 text-center">
          <p className="text-2xl font-bold text-[var(--foreground)]">{streak}</p>
          <p className="text-xs text-[var(--muted)]">Day streak 🔥</p>
        </div>
        <div className="koydo-card p-4 text-center">
          <p className="text-2xl font-bold text-[var(--foreground)]">{totalSessions}</p>
          <p className="text-xs text-[var(--muted)]">Sessions</p>
        </div>
      </div>

      {/* Domain bars */}
      <div className="koydo-card p-5">
        <h3 className="text-sm font-bold mb-4">Performance by Subject</h3>
        <div className="space-y-3">
          {stats.map((s) => (
            <div key={s.domain}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium truncate max-w-[60%]">{s.domain}</span>
                <span className="text-[var(--muted)]">{s.pct}% ({s.correct}/{s.total})</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--card-border)]">
                <div className="h-1.5 rounded-full"
                  style={{ width: `${s.pct}%`, background: s.pct >= 70 ? "var(--success)" : s.pct >= 50 ? "var(--accent)" : "#ef4444" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable tip */}
      {weakest && strongest && (
        <div className="koydo-card p-4 border-l-2 border-[var(--accent)]">
          <p className="text-xs font-bold text-[var(--accent)] mb-1">Focus Recommendation</p>
          <p className="text-sm text-[var(--muted)]">
            Your weakest area is <span className="font-medium text-[var(--foreground)]">{weakest.domain}</span> ({weakest.pct}%).
            Drill 10 questions there to close the gap — your strongest is{" "}
            <span className="font-medium text-[var(--foreground)]">{strongest.domain}</span> ({strongest.pct}%).
          </p>
        </div>
      )}
    </div>
  );
}
