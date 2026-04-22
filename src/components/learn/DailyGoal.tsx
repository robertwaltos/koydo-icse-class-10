"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDueCount, loadReviews } from "@/hooks/useSpacedRepetition";
import { EXAM_CONFIG } from "@/lib/act/config";

interface Goal {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  href: string;
  priority: "high" | "medium" | "low";
  done?: boolean;
}

export function DailyGoal() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [questionsLeft, setQuestionsLeft] = useState<number | null>(null);

  useEffect(() => {
    const reviews = loadReviews(EXAM_CONFIG.slug);
    const dueCards = getDueCount(reviews);

    // Check practice done today (localStorage)
    const today = new Date().toISOString().slice(0, 10);
    const practiceKey = `koydo_practice_${EXAM_CONFIG.slug}_${today}`;
    const practiceDone = localStorage.getItem(practiceKey) === "done";

    const g: Goal[] = [];

    if (dueCards > 0) {
      g.push({
        id: "flashcards",
        icon: "🃏",
        title: `Review ${dueCards} due flashcard${dueCards !== 1 ? "s" : ""}`,
        subtitle: "Spaced repetition — keep your streak",
        href: `/learn/flashcards`,
        priority: "high",
      });
    }

    if (!practiceDone) {
      g.push({
        id: "practice",
        icon: "⚡",
        title: "Daily practice session",
        subtitle: "10 adaptive questions · ~8 min",
        href: `/learn/practice?mode=quiz`,
        priority: "high",
      });
    } else {
      g.push({
        id: "practice",
        icon: "✅",
        title: "Daily practice done",
        subtitle: "Come back tomorrow for more",
        href: `/learn/practice`,
        priority: "low",
        done: true,
      });
    }

    g.push({
      id: "explore",
      icon: "🗺️",
      title: "Explore your roadmap",
      subtitle: "See what's next on your 30-day plan",
      href: "/learn/roadmap",
      priority: "low",
    });

    setGoals(g);

    // Remaining free questions
    fetch("/api/act/questions?limit=0")
      .then((r) => r.json())
      .then((d: { remaining?: number }) => {
        if (d.remaining != null) setQuestionsLeft(d.remaining);
      })
      .catch(() => null);
  }, []);

  if (!goals.length) return null;

  return (
    <div className="koydo-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold">Today&apos;s Goals</h3>
        {questionsLeft != null && (
          <span className="text-xs text-[var(--muted)]">{questionsLeft} free Qs left</span>
        )}
      </div>
      <div className="space-y-2">
        {goals.map((g) => (
          <Link
            key={g.id}
            href={g.href}
            className={[
              "flex items-center gap-3 rounded-xl p-3 transition",
              g.done
                ? "opacity-50 cursor-default"
                : "hover:bg-[var(--accent)]/5 hover:border-[var(--accent)]",
              g.priority === "high" && !g.done ? "border border-[var(--accent)]/30" : "border border-transparent",
            ].join(" ")}
          >
            <span className="text-xl shrink-0">{g.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight">{g.title}</p>
              <p className="text-xs text-[var(--muted)]">{g.subtitle}</p>
            </div>
            {!g.done && g.priority === "high" && (
              <span className="ml-auto text-xs font-medium text-[var(--accent)] shrink-0">Start →</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
