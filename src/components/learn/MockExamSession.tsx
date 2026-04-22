"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { EXAM_CONFIG } from "@/lib/act/config";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  domain: string;
}

interface ExamSection {
  id: string;
  title: string;
  domain?: string;
  questionCount: number;
  timeLimitMin: number;
  icon: string;
}

const EXAM_SECTIONS: ExamSection[] = [
  { id: "english",     title: "English",     domain: "English",     questionCount: 75, timeLimitMin: 45, icon: "✍️" },
  { id: "math",        title: "Mathematics", domain: "Mathematics", questionCount: 60, timeLimitMin: 60, icon: "📐" },
  { id: "reading",     title: "Reading",     domain: "Reading",     questionCount: 40, timeLimitMin: 35, icon: "📖" },
  { id: "science",     title: "Science",     domain: "Science",     questionCount: 40, timeLimitMin: 35, icon: "🔬" },
];

type Phase = "setup" | "section" | "break" | "results";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MockExamSession({ sections = EXAM_SECTIONS }: { sections?: ExamSection[] }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [sectionIdx, setSectionIdx] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // q index → option
  const [questionIdx, setQuestionIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [allResults, setAllResults] = useState<Array<{ section: string; correct: number; total: number }>>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const flagged = useRef<Set<number>>(new Set());

  const loadSection = useCallback(async (idx: number) => {
    const section = sections[idx];
    setLoading(true);
    setAnswers({});
    setQuestionIdx(0);
    flagged.current = new Set();

    const params = new URLSearchParams({
      limit: String(Math.min(section.questionCount, 50)),
    });
    if (section.domain) params.set("domain", section.domain);

    const res = await fetch(`/api/act/questions?${params}`);
    const data = await res.json() as { questions?: Question[] };
    setQuestions(data.questions ?? []);
    setSecondsLeft(section.timeLimitMin * 60);
    setLoading(false);
    setPhase("section");
  }, [sections]);

  // Countdown timer
  useEffect(() => {
    if (phase !== "section") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          handleSectionComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase, sectionIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSectionComplete = useCallback(() => {
    const section = sections[sectionIdx];
    const correct = questions.filter((q, i) => answers[i] === q.correct_option_index).length;
    setAllResults((prev) => [...prev, { section: section.title, correct, total: questions.length }]);

    if (sectionIdx < sections.length - 1) {
      setPhase("break");
    } else {
      setPhase("results");
    }
  }, [sections, sectionIdx, questions, answers]);

  const startNextSection = useCallback(() => {
    const next = sectionIdx + 1;
    setSectionIdx(next);
    loadSection(next);
  }, [sectionIdx, loadSection]);

  if (phase === "setup") {
    const totalMin = sections.reduce((s, sec) => s + sec.timeLimitMin, 0);
    const totalQ = sections.reduce((s, sec) => s + sec.questionCount, 0);
    return (
      <div className="mx-auto max-w-2xl py-8 px-4">
        <div className="koydo-card p-8 text-center mb-6">
          <p className="text-5xl mb-4">📋</p>
          <h2 className="text-2xl font-bold mb-2">Full {EXAM_CONFIG.name} Mock Exam</h2>
          <p className="text-sm text-[var(--muted)] mb-6">
            {sections.length} sections · {totalQ} questions · {Math.floor(totalMin / 60)}h {totalMin % 60}m total
          </p>
          <div className="grid gap-3 mb-8">
            {sections.map((sec, i) => (
              <div key={sec.id} className="koydo-card flex items-center gap-4 p-3 text-left">
                <span className="text-2xl w-8">{sec.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{sec.title}</p>
                  <p className="text-xs text-[var(--muted)]">{sec.questionCount} questions</p>
                </div>
                <span className="text-xs text-[var(--muted)]">⏱ {sec.timeLimitMin} min</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--muted)] mb-6">
            Find a quiet space. Once started, each section is timed. You can review flagged questions within each section.
          </p>
          <button onClick={() => loadSection(0)} className="koydo-btn-primary w-full py-3 text-base">
            Begin Exam →
          </button>
        </div>
      </div>
    );
  }

  if (phase === "break") {
    return (
      <div className="mx-auto max-w-lg py-16 px-4 text-center">
        <p className="text-4xl mb-4">☕</p>
        <h2 className="text-xl font-bold mb-2">Section Complete!</h2>
        <p className="text-sm text-[var(--muted)] mb-8">Take a short break before the next section.</p>
        <button onClick={startNextSection} className="koydo-btn-primary w-full py-3">
          Start {sections[sectionIdx + 1].title} →
        </button>
      </div>
    );
  }

  if (phase === "results") {
    const totalCorrect = allResults.reduce((s, r) => s + r.correct, 0);
    const totalQ = allResults.reduce((s, r) => s + r.total, 0);
    const overall = Math.round((totalCorrect / Math.max(totalQ, 1)) * 100);
    // ACT-style composite estimate: scale 1-36
    const scaledScore = Math.max(1, Math.min(36, Math.round(1 + (overall / 100) * 35)));

    return (
      <div className="mx-auto max-w-2xl py-10 px-4">
        <div className="koydo-card p-8 text-center mb-6">
          <p className="text-5xl mb-3">🎓</p>
          <h2 className="text-2xl font-bold mb-1">Estimated Score: {scaledScore}/36</h2>
          <p className="text-sm text-[var(--muted)] mb-6">{totalCorrect}/{totalQ} correct ({overall}%)</p>
          <div className="grid gap-3">
            {allResults.map((r) => {
              const pct = Math.round((r.correct / r.total) * 100);
              return (
                <div key={r.section} className="koydo-card p-3 flex items-center gap-4 text-left">
                  <span className="text-sm font-medium flex-1">{r.section}</span>
                  <div className="w-24 h-1.5 rounded-full bg-[var(--card-border)]">
                    <div className="h-1.5 rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold w-16 text-right">{r.correct}/{r.total}</span>
                </div>
              );
            })}
          </div>
        </div>
        <button onClick={() => { setPhase("setup"); setSectionIdx(0); setAllResults([]); }}
          className="koydo-btn-primary w-full py-3">Take Another Mock Exam</button>
      </div>
    );
  }

  // Active exam section
  if (loading || !questions.length) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const section = sections[sectionIdx];
  const q = questions[questionIdx];
  const pctDone = ((questionIdx + 1) / questions.length) * 100;
  const isLowTime = secondsLeft < 300; // < 5 min warning

  return (
    <div className="min-h-screen flex flex-col">
      {/* Exam header */}
      <div className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-[var(--background)] px-4 py-2 flex items-center gap-4">
        <span className="text-sm font-bold">{section.icon} {section.title}</span>
        <div className="flex-1 h-1.5 rounded-full bg-[var(--card-border)]">
          <div className="h-1.5 rounded-full bg-[var(--accent)] transition-all" style={{ width: `${pctDone}%` }} />
        </div>
        <span className="text-xs text-[var(--muted)]">{questionIdx + 1}/{questions.length}</span>
        <span className={["font-mono text-sm font-bold", isLowTime ? "text-[#ef4444] animate-pulse" : "text-[var(--foreground)]"].join(" ")}>
          ⏱ {formatTime(secondsLeft)}
        </span>
      </div>

      <div className="flex-1 mx-auto max-w-2xl px-4 py-6 w-full">
        <p className="text-base font-medium leading-relaxed mb-6">{q.question_text}</p>

        <div className="space-y-2 mb-8">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setAnswers((prev) => ({ ...prev, [questionIdx]: i }))}
              className={["koydo-card p-4 text-sm text-left w-full transition",
                answers[questionIdx] === i
                  ? "border-[var(--accent)] bg-[var(--accent)]/5"
                  : "hover:border-[var(--accent)]"
              ].join(" ")}
            >
              <span className="mr-2 font-bold text-[var(--muted)]">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {questionIdx > 0 && (
            <button onClick={() => setQuestionIdx((i) => i - 1)} className="koydo-btn-ghost flex-1 py-2.5 text-sm">← Prev</button>
          )}
          {questionIdx < questions.length - 1 ? (
            <button onClick={() => setQuestionIdx((i) => i + 1)} className="koydo-btn-primary flex-1 py-2.5 text-sm">Next →</button>
          ) : (
            <button onClick={handleSectionComplete} className="koydo-btn-primary flex-1 py-2.5 text-sm font-bold">
              Submit Section →
            </button>
          )}
        </div>

        {/* Question grid navigator */}
        <div className="mt-8 flex flex-wrap gap-1.5">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setQuestionIdx(i)}
              className={["h-7 w-7 rounded text-xs font-medium transition",
                i === questionIdx ? "bg-[var(--accent)] text-white" :
                answers[i] != null ? "bg-[var(--accent)]/20 text-[var(--accent)]" :
                "bg-[var(--card-border)] text-[var(--muted)]"
              ].join(" ")}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
