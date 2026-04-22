"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { QuizQuestion } from "@/hooks/useAdaptiveQuiz";

const ROUND_SIZE = 10;
const SECONDS_PER_Q = 30;

interface Result {
  question: QuizQuestion;
  chosen: number | null;
  timeUsed: number;
}

export function SpeedRound({ domain }: { domain?: string }) {
  const [phase, setPhase] = useState<"idle" | "loading" | "playing" | "review">("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_Q);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const endQuestion = useCallback((chosen: number | null) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const timeUsed = SECONDS_PER_Q - timeLeft;
    const q = questions[current];
    const newResult: Result = { question: q, chosen, timeUsed };

    setResults((prev) => {
      const next = [...prev, newResult];
      if (next.length >= ROUND_SIZE || current + 1 >= questions.length) {
        setPhase("review");
      } else {
        setCurrent((c) => c + 1);
        setTimeLeft(SECONDS_PER_Q);
        startTimeRef.current = Date.now();
      }
      return next;
    });
  }, [current, questions, timeLeft]);

  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          endQuestion(null); // timed out
          return SECONDS_PER_Q;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, current, endQuestion]);

  const startRound = useCallback(async () => {
    setPhase("loading");
    try {
      const url = `/api/act/questions?limit=${ROUND_SIZE}${domain ? `&domain=${encodeURIComponent(domain)}` : ""}`;
      const res = await fetch(url);
      const { questions: qs } = await res.json() as { questions: QuizQuestion[] };
      if (!qs?.length) { setPhase("idle"); return; }
      setQuestions(qs.slice(0, ROUND_SIZE));
      setResults([]);
      setCurrent(0);
      setTimeLeft(SECONDS_PER_Q);
      setPhase("playing");
    } catch {
      setPhase("idle");
    }
  }, [domain]);

  if (phase === "idle" || phase === "loading") {
    return (
      <div className="koydo-card p-6 text-center">
        <p className="text-3xl mb-3">⚡</p>
        <h2 className="font-bold text-base mb-1">Speed Round</h2>
        <p className="text-xs text-[var(--muted)] mb-5">
          {ROUND_SIZE} questions · {SECONDS_PER_Q}s each · No explanations mid-round
        </p>
        <button
          onClick={startRound}
          disabled={phase === "loading"}
          className="koydo-btn-primary px-6 py-2 text-sm disabled:opacity-60"
        >
          {phase === "loading" ? "Loading…" : "Start Speed Round"}
        </button>
      </div>
    );
  }

  if (phase === "review") {
    const correct = results.filter((r) => r.chosen === r.question.correct_option_index).length;
    const timeouts = results.filter((r) => r.chosen === null).length;
    const avgTime = Math.round(results.filter((r) => r.chosen !== null).reduce((sum, r) => sum + r.timeUsed, 0) / Math.max(1, results.length - timeouts));
    const pct = Math.round((correct / results.length) * 100);

    return (
      <div className="space-y-4">
        <div className="koydo-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-black" style={{ color: pct >= 70 ? "var(--success)" : "var(--warning)" }}>
                {correct}/{ROUND_SIZE}
              </p>
              <p className="text-xs text-[var(--muted)]">{pct}% · avg {avgTime}s · {timeouts} timeouts</p>
            </div>
            <button onClick={startRound} className="koydo-btn-primary text-sm px-4 py-2">Play Again</button>
          </div>
          <div className="flex gap-1 mb-2">
            {results.map((r, i) => (
              <div key={i} className="flex-1 h-2 rounded-full" style={{
                background: r.chosen === null ? "var(--card-border)"
                  : r.chosen === r.question.correct_option_index ? "var(--success)" : "var(--error)",
              }} />
            ))}
          </div>
          <p className="text-xs text-[var(--muted)]">Green = correct · Red = wrong · Grey = timeout</p>
        </div>

        {results.map((r, i) => (
          <div key={i} className="koydo-card p-4">
            <div className="flex items-start gap-2 mb-2">
              <span className="shrink-0 mt-0.5">
                {r.chosen === r.question.correct_option_index ? "✅" : r.chosen === null ? "⏱️" : "❌"}
              </span>
              <p className="text-sm font-medium leading-relaxed">{r.question.question_text}</p>
            </div>
            <p className="text-xs text-[var(--success)] mb-1 ml-6">
              ✓ {r.question.options[r.question.correct_option_index]}
            </p>
            {r.chosen !== null && r.chosen !== r.question.correct_option_index && (
              <p className="text-xs text-[var(--error)] mb-1 ml-6">✗ {r.question.options[r.chosen]}</p>
            )}
            {r.question.explanation && (
              <p className="text-xs text-[var(--muted)] ml-6 mt-1">{r.question.explanation}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  const q = questions[current];
  const timerPct = (timeLeft / SECONDS_PER_Q) * 100;
  const timerColor = timeLeft <= 10 ? "#EF4444" : timeLeft <= 20 ? "#F59E0B" : "var(--accent)";

  return (
    <div className="space-y-4">
      {/* Timer bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-[var(--card-border)] overflow-hidden">
          <div className="h-2 rounded-full transition-all duration-1000"
            style={{ width: `${timerPct}%`, background: timerColor }} />
        </div>
        <span className="text-sm font-bold tabular-nums w-6 text-right" style={{ color: timerColor }}>
          {timeLeft}
        </span>
        <span className="text-xs text-[var(--muted)]">{current + 1}/{ROUND_SIZE}</span>
      </div>

      <div className="koydo-card p-5">
        <p className="text-xs text-[var(--muted)] mb-3">{q.domain} · {q.difficulty}</p>
        <p className="text-sm font-medium leading-relaxed mb-5">{q.question_text}</p>

        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => endQuestion(i)}
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--surface-2)] px-4 py-2.5 text-left text-sm hover:border-[var(--accent)] hover:bg-[var(--accent-light)] transition"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
