"use client";

import { useState, useCallback, useRef } from "react";

export type Difficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  domain: string;
  difficulty: Difficulty;
}

export interface QuizAnswer {
  question_id: string;
  selected: number;
  correct: boolean;
  time_ms: number;
  domain: string;
  difficulty: Difficulty;
}

export interface DomainStats {
  correct: number;
  total: number;
  avg_time_ms: number;
}

const WINDOW = 5; // re-evaluate difficulty every N questions
const UP_THRESHOLD = 0.80;
const DOWN_THRESHOLD = 0.50;

export function useAdaptiveQuiz(examSlug: string, initialDomain?: string) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [loading, setLoading] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const questionStartRef = useRef<number>(Date.now());

  const domainStats = answers.reduce<Record<string, DomainStats>>((acc, a) => {
    const d = a.domain || "General";
    if (!acc[d]) acc[d] = { correct: 0, total: 0, avg_time_ms: 0 };
    acc[d].total++;
    if (a.correct) acc[d].correct++;
    acc[d].avg_time_ms = (acc[d].avg_time_ms * (acc[d].total - 1) + a.time_ms) / acc[d].total;
    return acc;
  }, {});

  const weakDomains = Object.entries(domainStats)
    .filter(([, s]) => s.total >= 3 && s.correct / s.total < 0.5)
    .map(([d]) => d);

  const fetchQuestions = useCallback(async (diff: Difficulty, count = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(count), difficulty: diff });
      if (initialDomain && initialDomain !== "all") params.set("domain", initialDomain);
      const res = await fetch(`/api/act/questions?${params}`);
      const data = await res.json() as { questions?: QuizQuestion[]; error?: string };
      if (data.questions?.length) {
        setQuestions((prev) => [...prev, ...data.questions!]);
      }
    } finally {
      setLoading(false);
    }
  }, [initialDomain]);

  const startSession = useCallback(async () => {
    setQuestions([]);
    setAnswers([]);
    setCurrentIdx(0);
    setDifficulty("medium");
    setSessionDone(false);
    setRevealed(false);
    questionStartRef.current = Date.now();
    await fetchQuestions("medium", 15);
  }, [fetchQuestions]);

  const submitAnswer = useCallback(async (selected: number) => {
    const q = questions[currentIdx];
    if (!q || revealed) return;

    const time_ms = Date.now() - questionStartRef.current;
    const correct = selected === q.correct_option_index;
    const newAnswers = [...answers, { question_id: q.id, selected, correct, time_ms, domain: q.domain, difficulty }];
    setAnswers(newAnswers);
    setRevealed(true);

    // Fire-and-forget answer submission
    fetch("/api/act/submit-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: q.id, selected_option: selected, domain: q.domain }),
    }).catch(() => null);

    // Recalibrate difficulty after every WINDOW answers
    if (newAnswers.length % WINDOW === 0) {
      const window = newAnswers.slice(-WINDOW);
      const acc = window.filter((a) => a.correct).length / WINDOW;
      let next: Difficulty = difficulty;
      if (acc >= UP_THRESHOLD && difficulty !== "hard") next = difficulty === "easy" ? "medium" : "hard";
      if (acc <= DOWN_THRESHOLD && difficulty !== "easy") next = difficulty === "hard" ? "medium" : "easy";
      if (next !== difficulty) {
        setDifficulty(next);
        // Pre-fetch next batch at new difficulty if running low
        if (questions.length - currentIdx <= 3) {
          fetchQuestions(next, 10).catch(() => null);
        }
      }
    }

    // Pre-fetch more questions when approaching the end
    if (currentIdx >= questions.length - 5 && !loading) {
      fetchQuestions(difficulty, 10).catch(() => null);
    }
  }, [questions, currentIdx, answers, difficulty, revealed, loading, fetchQuestions]);

  const nextQuestion = useCallback(() => {
    if (currentIdx >= questions.length - 1) {
      setSessionDone(true);
      return;
    }
    setCurrentIdx((i) => i + 1);
    setRevealed(false);
    questionStartRef.current = Date.now();
  }, [currentIdx, questions.length]);

  const current = questions[currentIdx] ?? null;
  const accuracy = answers.length > 0 ? answers.filter((a) => a.correct).length / answers.length : null;
  const avgTime = answers.length > 0 ? answers.reduce((s, a) => s + a.time_ms, 0) / answers.length : null;

  return {
    current, loading, sessionDone, revealed,
    difficulty, currentIdx, totalAnswered: answers.length,
    accuracy, avgTime, domainStats, weakDomains,
    startSession, submitAnswer, nextQuestion,
  };
}
