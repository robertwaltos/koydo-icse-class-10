"use client";

import { useEffect } from "react";
import { useAdaptiveQuiz, type Difficulty } from "@/hooks/useAdaptiveQuiz";
import { EXAM_CONFIG } from "@/lib/act/config";

const DIFF_LABEL: Record<Difficulty, string> = { easy: "Foundational", medium: "Standard", hard: "Advanced" };
const DIFF_COLOR: Record<Difficulty, string> = { easy: "var(--success)", medium: "var(--accent)", hard: "#f59e0b" };

export function AdaptiveQuiz({ domain }: { domain?: string }) {
  const {
    current, loading, sessionDone, revealed,
    difficulty, currentIdx, totalAnswered,
    accuracy, avgTime, domainStats, weakDomains,
    startSession, submitAnswer, nextQuestion,
  } = useAdaptiveQuiz(EXAM_CONFIG.slug, domain);

  useEffect(() => { startSession(); }, [startSession]);

  if (loading && !current) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        <p className="text-sm text-[var(--muted)]">Loading adaptive questions…</p>
      </div>
    );
  }

  if (sessionDone) {
    const pct = accuracy != null ? Math.round(accuracy * 100) : 0;
    const avgSec = avgTime != null ? (avgTime / 1000).toFixed(1) : "—";
    return (
      <div className="mx-auto max-w-2xl py-10 px-4">
        <div className="koydo-card p-8 text-center mb-6">
          <p className="text-5xl mb-3">{pct >= 80 ? "🏆" : pct >= 60 ? "💪" : "📚"}</p>
          <h2 className="text-2xl font-bold mb-1">{pct}% Accuracy</h2>
          <p className="text-sm text-[var(--muted)] mb-4">{totalAnswered} questions · {avgSec}s avg per question</p>
          <div className="grid grid-cols-3 gap-3 text-sm mb-6">
            <div className="koydo-card p-3">
              <p className="font-bold text-lg text-[var(--success)]">{Math.round((accuracy ?? 0) * totalAnswered)}</p>
              <p className="text-xs text-[var(--muted)]">Correct</p>
            </div>
            <div className="koydo-card p-3">
              <p className="font-bold text-lg text-[var(--error,#ef4444)]">{totalAnswered - Math.round((accuracy ?? 0) * totalAnswered)}</p>
              <p className="text-xs text-[var(--muted)]">Incorrect</p>
            </div>
            <div className="koydo-card p-3">
              <p className="font-bold text-lg text-[var(--accent)]">{avgSec}s</p>
              <p className="text-xs text-[var(--muted)]">Avg time</p>
            </div>
          </div>
          <button onClick={startSession} className="koydo-btn-primary w-full py-3">Practice Again</button>
        </div>

        {/* Domain breakdown */}
        {Object.keys(domainStats).length > 0 && (
          <div className="koydo-card p-6">
            <h3 className="font-bold text-sm mb-4">Performance by Subject</h3>
            <div className="space-y-3">
              {Object.entries(domainStats).sort(([, a], [, b]) => a.correct / a.total - b.correct / b.total).map(([domain, s]) => {
                const pct = Math.round((s.correct / s.total) * 100);
                return (
                  <div key={domain}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{domain}</span>
                      <span className="text-[var(--muted)]">{pct}% ({s.correct}/{s.total})</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--card-border)]">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 70 ? "var(--success)" : pct >= 50 ? "var(--accent)" : "#ef4444" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {weakDomains.length > 0 && (
              <p className="mt-4 text-xs text-[var(--muted)]">
                Focus area: <span className="font-medium text-[var(--foreground)]">{weakDomains.join(", ")}</span>
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      {/* Progress bar + meta */}
      <div className="flex items-center justify-between mb-4 text-xs text-[var(--muted)]">
        <span>Question {currentIdx + 1}</span>
        <div className="flex items-center gap-3">
          <span style={{ color: DIFF_COLOR[difficulty] }}>{DIFF_LABEL[difficulty]}</span>
          <span>{current.domain}</span>
          {accuracy != null && <span>{Math.round(accuracy * 100)}% accuracy</span>}
        </div>
      </div>

      {/* Thin progress track */}
      <div className="h-1 w-full rounded-full bg-[var(--card-border)] mb-6">
        <div className="h-1 rounded-full bg-[var(--accent)] transition-all"
          style={{ width: `${Math.min(100, (totalAnswered / 20) * 100)}%` }} />
      </div>

      {/* Question card */}
      <div className="koydo-card p-6 mb-4">
        <p className="text-base font-medium leading-relaxed">{current.question_text}</p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {current.options.map((opt, i) => {
          let cls = "koydo-card p-4 text-sm cursor-pointer transition-all hover:border-[var(--accent)] w-full text-left";
          if (revealed) {
            if (i === current.correct_option_index) cls += " border-[var(--success)] bg-[var(--success)]/10";
            else cls += " opacity-50";
          }
          return (
            <button key={i} className={cls} onClick={() => !revealed && submitAnswer(i)} disabled={revealed}>
              <span className="mr-2 font-bold text-[var(--muted)]">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {revealed && (
        <div className="koydo-card p-4 mb-4 border-l-2 border-[var(--accent)]">
          <p className="text-xs font-bold text-[var(--accent)] mb-1">Explanation</p>
          <p className="text-sm text-[var(--muted)]">{current.explanation}</p>
        </div>
      )}

      {revealed && (
        <button onClick={nextQuestion} className="koydo-btn-primary w-full py-3">
          {currentIdx >= 19 ? "See Results" : "Next Question →"}
        </button>
      )}
    </div>
  );
}
