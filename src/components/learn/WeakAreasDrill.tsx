"use client";

import { useState, useCallback } from "react";
import type { QuizQuestion } from "@/hooks/useAdaptiveQuiz";

interface Props {
  weakDomains: string[];
  examSlug: string;
}

interface DrillState {
  questions: QuizQuestion[];
  current: number;
  answers: (number | null)[];
  revealed: boolean;
  done: boolean;
}

export function WeakAreasDrill({ weakDomains, examSlug }: Props) {
  const [loading, setLoading] = useState(false);
  const [drill, setDrill] = useState<DrillState | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const startDrill = useCallback(async (domain: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/act/questions?domain=${encodeURIComponent(domain)}&difficulty=easy&limit=10`);
      const { questions } = await res.json() as { questions: Question[] };
      if (!questions?.length) return;
      setDrill({
        questions,
        current: 0,
        answers: new Array(questions.length).fill(null),
        revealed: false,
        done: false,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnswer = useCallback((idx: number) => {
    if (!drill || drill.revealed) return;
    setSelected(idx);
    setDrill((prev) => {
      if (!prev) return prev;
      const answers = [...prev.answers];
      answers[prev.current] = idx;
      return { ...prev, answers, revealed: true };
    });
  }, [drill]);

  const next = useCallback(() => {
    if (!drill) return;
    const nextIdx = drill.current + 1;
    if (nextIdx >= drill.questions.length) {
      setDrill((prev) => prev ? { ...prev, done: true } : prev);
    } else {
      setSelected(null);
      setDrill((prev) => prev ? { ...prev, current: nextIdx, revealed: false } : prev);
    }
  }, [drill]);

  if (!weakDomains.length) return null;

  if (!drill) {
    return (
      <div className="koydo-card p-5 mb-6">
        <h2 className="font-bold text-sm mb-1">Weak Areas Drill</h2>
        <p className="text-xs text-[var(--muted)] mb-4">Target your lowest-scoring domains with focused practice.</p>
        <div className="flex flex-wrap gap-2">
          {weakDomains.slice(0, 4).map((domain) => (
            <button
              key={domain}
              onClick={() => startDrill(domain)}
              disabled={loading}
              className="rounded-full border border-[var(--card-border)] px-3 py-1.5 text-xs font-medium hover:border-[var(--accent)] hover:text-[var(--accent)] transition disabled:opacity-50"
            >
              {loading ? "Loading…" : `${domain} →`}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (drill.done) {
    const correct = drill.answers.filter((a, i) => a === drill.questions[i].correct_option_index).length;
    const pct = Math.round((correct / drill.questions.length) * 100);
    return (
      <div className="koydo-card p-5 mb-6">
        <div className="text-center py-4">
          <p className="text-3xl font-black mb-1" style={{ color: pct >= 70 ? "var(--success)" : "var(--warning)" }}>
            {correct}/{drill.questions.length}
          </p>
          <p className="text-sm text-[var(--muted)] mb-4">{pct}% — {pct >= 80 ? "Strong improvement!" : pct >= 60 ? "Good progress." : "Keep drilling — you'll get there."}</p>
          <button
            onClick={() => { setDrill(null); setSelected(null); }}
            className="koydo-btn-primary text-sm px-4 py-2"
          >
            Drill another area
          </button>
        </div>
      </div>
    );
  }

  const q = drill.questions[drill.current];
  return (
    <div className="koydo-card p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[var(--accent)]">DRILL · {q.domain}</span>
        <span className="text-xs text-[var(--muted)]">{drill.current + 1} / {drill.questions.length}</span>
      </div>

      <p className="text-sm font-medium mb-4 leading-relaxed">{q.question_text}</p>

      <div className="space-y-2 mb-4">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correct_option_index;
          const isSelected = selected === i;
          let bg = "var(--surface-2)";
          let border = "var(--card-border)";
          if (drill.revealed) {
            if (isCorrect) { bg = "#10B98120"; border = "#10B981"; }
            else if (isSelected) { bg = "#EF444420"; border = "#EF4444"; }
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={drill.revealed}
              className="w-full rounded-xl border px-4 py-2.5 text-left text-sm transition disabled:cursor-default"
              style={{ background: bg, borderColor: border }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {drill.revealed && (
        <div className="rounded-xl bg-[var(--surface-2)] p-3 text-xs text-[var(--muted)] mb-3 leading-relaxed">
          {q.explanation}
        </div>
      )}

      {drill.revealed && (
        <button onClick={next} className="koydo-btn-primary text-sm w-full py-2">
          {drill.current + 1 < drill.questions.length ? "Next →" : "See Results"}
        </button>
      )}
    </div>
  );
}
