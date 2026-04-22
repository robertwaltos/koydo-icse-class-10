"use client";

/**
 * SM-2 spaced repetition algorithm.
 * Quality scores: 0=blackout, 1=wrong+recalled, 2=wrong+easy, 3=correct+hard, 4=correct+ok, 5=perfect
 */

export interface CardReview {
  cardId: string;
  easiness: number;   // starts at 2.5
  interval: number;   // days until next review
  repetitions: number;
  nextDue: string;    // ISO date
}

export function sm2(card: CardReview, quality: 0 | 1 | 2 | 3 | 4 | 5): CardReview {
  if (quality < 3) {
    // Failed — reset
    return { ...card, repetitions: 0, interval: 1, nextDue: daysFromNow(1) };
  }

  const newEF = Math.max(1.3, card.easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  let newInterval: number;

  if (card.repetitions === 0) newInterval = 1;
  else if (card.repetitions === 1) newInterval = 6;
  else newInterval = Math.round(card.interval * newEF);

  return {
    cardId: card.cardId,
    easiness: newEF,
    interval: newInterval,
    repetitions: card.repetitions + 1,
    nextDue: daysFromNow(newInterval),
  };
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function isDue(card: CardReview): boolean {
  return card.nextDue <= new Date().toISOString().split("T")[0];
}

export function qualityFromAnswer(correct: boolean, timeMs: number, avgTimeMs: number): 0 | 3 | 4 | 5 {
  if (!correct) return 0;
  const ratio = timeMs / Math.max(avgTimeMs, 1000);
  if (ratio < 0.6) return 5; // very fast correct
  if (ratio < 1.2) return 4; // normal speed correct
  return 3; // slow correct
}

// Local storage key for persisting reviews
const STORAGE_KEY = (examSlug: string) => `koydo_srs_${examSlug}`;

export function loadReviews(examSlug: string): Record<string, CardReview> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY(examSlug)) ?? "{}");
  } catch {
    return {};
  }
}

export function saveReviews(examSlug: string, reviews: Record<string, CardReview>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY(examSlug), JSON.stringify(reviews));
}

export function getOrCreateCard(cardId: string, reviews: Record<string, CardReview>): CardReview {
  return reviews[cardId] ?? {
    cardId,
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
    nextDue: new Date().toISOString().split("T")[0],
  };
}

export function getDueCount(reviews: Record<string, CardReview>): number {
  return Object.values(reviews).filter(isDue).length;
}

export function getRetentionRate(reviews: Record<string, CardReview>): number {
  const cards = Object.values(reviews).filter((c) => c.repetitions > 0);
  if (!cards.length) return 1;
  const passing = cards.filter((c) => c.repetitions >= 2 && c.easiness >= 2.0).length;
  return passing / cards.length;
}
