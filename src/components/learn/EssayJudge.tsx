"use client";

import { useState } from "react";

interface Scores {
  ideas_analysis: number;
  development_support: number;
  organization: number;
  language_use: number;
  conventions: number;
}

interface Evaluation {
  scores: Scores;
  composite: number;
  strengths: string[];
  improvements: string[];
  model_paragraph: string;
}

const SCORE_LABELS: Record<keyof Scores, string> = {
  ideas_analysis:       "Ideas & Analysis",
  development_support:  "Development & Support",
  organization:         "Organization",
  language_use:         "Language Use",
  conventions:          "Conventions",
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = ((score - 1) / 5) * 100;
  const color = score >= 5 ? "var(--success)" : score >= 4 ? "var(--accent)" : score >= 3 ? "var(--warning)" : "var(--error)";
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 shrink-0 text-xs text-[var(--muted)]">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-[var(--card-border)]">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-6 text-right text-xs font-bold">{score}/6</span>
    </div>
  );
}

export function EssayJudge() {
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ evaluation: Evaluation; prompt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (essay.trim().length < 50) {
      setError("Essay must be at least 50 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/act/essay-judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay, domain: "Writing" }),
      });
      if (!res.ok) {
        const { error: e } = await res.json() as { error: string };
        setError(e === "premium_required" ? "Premium required." : e);
        return;
      }
      const data = await res.json() as { evaluation: Evaluation; prompt: string };
      setResult(data);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const { evaluation, prompt } = result;
    const compositeColor = evaluation.composite >= 24 ? "var(--success)" : evaluation.composite >= 18 ? "var(--accent)" : "var(--warning)";

    return (
      <div className="space-y-6">
        {/* Score summary */}
        <div className="koydo-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold">Score Report</h2>
            <div className="text-center">
              <p className="text-3xl font-black" style={{ color: compositeColor }}>{evaluation.composite.toFixed(1)}</p>
              <p className="text-xs text-[var(--muted)]">/ 36 composite</p>
            </div>
          </div>
          <div className="space-y-3">
            {(Object.entries(evaluation.scores) as [keyof Scores, number][]).map(([key, val]) => (
              <ScoreBar key={key} label={SCORE_LABELS[key]} score={val} />
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="koydo-card p-5">
          <h3 className="font-semibold text-sm mb-3 text-[var(--success)]">✓ Strengths</h3>
          <ul className="space-y-1">
            {evaluation.strengths.map((s, i) => (
              <li key={i} className="text-sm text-[var(--foreground)] flex gap-2">
                <span className="shrink-0 text-[var(--success)]">•</span>{s}
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="koydo-card p-5">
          <h3 className="font-semibold text-sm mb-3 text-[var(--accent)]">↗ To Improve</h3>
          <ul className="space-y-1">
            {evaluation.improvements.map((s, i) => (
              <li key={i} className="text-sm text-[var(--foreground)] flex gap-2">
                <span className="shrink-0 text-[var(--accent)]">•</span>{s}
              </li>
            ))}
          </ul>
        </div>

        {/* Model paragraph */}
        {evaluation.model_paragraph && (
          <div className="koydo-card p-5">
            <h3 className="font-semibold text-sm mb-3">Model Paragraph</h3>
            <p className="text-sm leading-relaxed text-[var(--muted)] italic border-l-2 border-[var(--accent)] pl-4">
              {evaluation.model_paragraph}
            </p>
          </div>
        )}

        <button
          onClick={() => { setResult(null); setEssay(""); }}
          className="koydo-btn-primary w-full py-3 text-sm"
        >
          Write Another Essay
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="koydo-card p-5">
        <h2 className="font-semibold text-sm mb-1">Essay Prompt</h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Write a persuasive essay arguing whether social media has been a net positive or negative for society.
          Use specific examples and reasoning to support your position.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
          Your Essay
        </label>
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="Begin writing your essay here… (minimum 50 characters)"
          rows={14}
          className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--surface-2)] p-4 text-sm resize-none focus:outline-none focus:border-[var(--accent)] leading-relaxed"
        />
        <div className="mt-1 flex justify-between text-xs text-[var(--muted)]">
          <span>{essay.length} characters</span>
          <span>~{Math.round(essay.split(/\s+/).filter(Boolean).length)} words</span>
        </div>
      </div>

      {error && <p className="text-sm text-[var(--error)]">{error}</p>}

      <button
        onClick={submit}
        disabled={loading || essay.trim().length < 50}
        className="koydo-btn-primary w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Evaluating… (15–30 seconds)" : "Submit for AI Evaluation →"}
      </button>
    </div>
  );
}
