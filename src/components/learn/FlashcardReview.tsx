"use client";

import { useState, useEffect, useCallback } from "react";
import {
  sm2, qualityFromAnswer, loadReviews, saveReviews,
  getOrCreateCard, getDueCount, getRetentionRate,
  type CardReview,
} from "@/hooks/useSpacedRepetition";
import { EXAM_CONFIG } from "@/lib/act/config";

interface FlashCard {
  id: string;
  front: string;
  back: string;
  domain: string;
}

interface Props {
  deckId: string;
  title: string;
  icon: string;
}

const BUTTONS: { label: string; q: 0 | 3 | 4 | 5; hint: string; color: string }[] = [
  { label: "Forgot",  q: 0, hint: "Review again soon",  color: "#ef4444" },
  { label: "Hard",    q: 3, hint: "Show in a few days", color: "#f59e0b" },
  { label: "Good",    q: 4, hint: "Show in a week",     color: "var(--accent)" },
  { label: "Easy",    q: 5, hint: "Long-term memory",   color: "var(--success)" },
];

export function FlashcardReview({ deckId, title, icon }: Props) {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [reviews, setReviews] = useState<Record<string, CardReview>>({});
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());
  const [sessionTimes, setSessionTimes] = useState<number[]>([]);

  useEffect(() => {
    const stored = loadReviews(EXAM_CONFIG.slug);
    setReviews(stored);

    // Fetch questions for this deck and transform into flashcards
    fetch(`/api/act/questions?domain=${encodeURIComponent(deckId)}&limit=30`)
      .then((r) => r.json())
      .then((data: { questions?: Array<{ id: string; question_text: string; explanation: string; domain: string }> }) => {
        const qs = data.questions ?? [];
        const fc: FlashCard[] = qs.map((q) => ({
          id: q.id,
          front: q.question_text,
          back: q.explanation ?? "See your study materials for details.",
          domain: q.domain,
        }));
        // Sort: due cards first
        fc.sort((a, b) => {
          const aR = stored[a.id];
          const bR = stored[b.id];
          if (!aR && !bR) return 0;
          if (!aR) return -1;
          if (!bR) return 1;
          return aR.nextDue.localeCompare(bR.nextDue);
        });
        setCards(fc);
        setLoading(false);
        setStartTime(Date.now());
      })
      .catch(() => setLoading(false));
  }, [deckId]);

  const handleRate = useCallback((quality: 0 | 3 | 4 | 5) => {
    const card = cards[idx];
    if (!card) return;

    const timeMs = Date.now() - startTime;
    const avgTime = sessionTimes.length
      ? sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length
      : 5000;

    const existing = getOrCreateCard(card.id, reviews);
    const q = quality === 0 ? 0 : qualityFromAnswer(quality > 0, timeMs, avgTime);
    const updated = sm2(existing, q);
    const newReviews = { ...reviews, [card.id]: updated };

    setReviews(newReviews);
    saveReviews(EXAM_CONFIG.slug, newReviews);
    setSessionTimes((prev) => [...prev, timeMs]);

    if (idx >= cards.length - 1) {
      setDone(true);
    } else {
      setIdx((i) => i + 1);
      setFlipped(false);
      setStartTime(Date.now());
    }
  }, [cards, idx, reviews, startTime, sessionTimes]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-[var(--muted)]">Loading flashcards…</p>
      </div>
    );
  }

  if (done || !cards.length) {
    const dueNow = getDueCount(reviews);
    const retention = Math.round(getRetentionRate(reviews) * 100);
    return (
      <div className="mx-auto max-w-lg py-16 px-4 text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
        <p className="text-sm text-[var(--muted)] mb-8">{idx + 1} cards reviewed · {retention}% retention rate</p>
        <div className="grid grid-cols-2 gap-3 mb-8 text-sm">
          <div className="koydo-card p-4">
            <p className="text-xl font-bold text-[var(--accent)]">{retention}%</p>
            <p className="text-xs text-[var(--muted)]">Retention</p>
          </div>
          <div className="koydo-card p-4">
            <p className="text-xl font-bold text-[var(--foreground)]">{dueNow}</p>
            <p className="text-xs text-[var(--muted)]">Due now</p>
          </div>
        </div>
        {dueNow > 0 ? (
          <button onClick={() => { setIdx(0); setFlipped(false); setDone(false); }} className="koydo-btn-primary w-full py-3">
            Review {dueNow} Due Cards
          </button>
        ) : (
          <p className="text-sm text-[var(--muted)]">Come back tomorrow — your next cards will be due then.</p>
        )}
      </div>
    );
  }

  const card = cards[idx];
  const cardReview = reviews[card.id];
  const dueCount = getDueCount(reviews);

  return (
    <div className="mx-auto max-w-lg py-8 px-4">
      <div className="flex items-center justify-between mb-4 text-xs text-[var(--muted)]">
        <span>{icon} {title}</span>
        <span>{idx + 1} / {cards.length}{dueCount > 0 ? ` · ${dueCount} due` : ""}</span>
      </div>

      {/* Flip card */}
      <div
        className={["koydo-card p-8 min-h-48 flex flex-col justify-center cursor-pointer transition-all mb-6",
          flipped ? "border-[var(--accent)]" : "hover:border-[var(--accent)]"].join(" ")}
        onClick={() => setFlipped(true)}
        role="button"
        aria-label={flipped ? "Card back" : "Tap to reveal answer"}
      >
        {!flipped ? (
          <>
            <p className="text-xs text-[var(--muted)] mb-3">{card.domain}</p>
            <p className="text-base font-medium leading-relaxed">{card.front}</p>
            <p className="mt-6 text-xs text-[var(--muted)] text-center">Tap to reveal</p>
          </>
        ) : (
          <>
            <p className="text-xs text-[var(--accent)] font-bold mb-3">Answer</p>
            <p className="text-sm leading-relaxed text-[var(--muted)]">{card.back}</p>
            {cardReview && (
              <p className="mt-4 text-xs text-[var(--muted)] opacity-60">
                Rep {cardReview.repetitions} · EF {cardReview.easiness.toFixed(2)} · Next in {cardReview.interval}d
              </p>
            )}
          </>
        )}
      </div>

      {/* Rating buttons — only show after flip */}
      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          {BUTTONS.map((btn) => (
            <button
              key={btn.q}
              onClick={() => handleRate(btn.q)}
              className="koydo-card p-3 text-center hover:border-[var(--accent)] transition"
              style={{ borderColor: btn.color + "40" }}
            >
              <p className="text-xs font-bold" style={{ color: btn.color }}>{btn.label}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5 leading-tight">{btn.hint}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
