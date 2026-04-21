import type { Metadata } from "next";
import Link from "next/link";
import { EXAM_CONFIG } from "@/lib/act/config";
import { CONTENT_MANIFEST } from "@/lib/act/content/manifest";

export const metadata: Metadata = { title: `Flashcards — ${EXAM_CONFIG.name}` };

const DECKS = CONTENT_MANIFEST.topics.map((t) => ({
  id: t.id,
  title: `${t.title} Key Concepts`,
  icon: t.icon,
  color: t.color,
  cardCount: Math.floor(t.minQuestionCount / 4),
  free: t === CONTENT_MANIFEST.topics[0] || t === CONTENT_MANIFEST.topics[1],
}));

export default function FlashcardsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/learn" className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Study Hub</Link>
      <h1 className="text-2xl font-bold mb-2">Flashcards</h1>
      <p className="text-sm text-[var(--muted)] mb-8">Spaced repetition system. Cards resurface based on your recall confidence.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {DECKS.map((deck) => (
          <div key={deck.id} className={["koydo-card p-5 transition", deck.free ? "hover:border-[var(--accent)] cursor-pointer" : "opacity-70"].join(" ")}>
            <div className="flex items-start justify-between mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: `${deck.color}20` }}>{deck.icon}</span>
              {deck.free
                ? <span className="rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]">Free</span>
                : <span className="premium-badge">Premium</span>}
            </div>
            <h3 className="font-semibold mb-1 text-sm">{deck.title}</h3>
            <p className="text-xs text-[var(--muted)]">{deck.cardCount} cards · Spaced repetition</p>
            {deck.free
              ? <button className="mt-4 koydo-btn-primary text-xs py-1.5 px-4">Study Now</button>
              : <Link href="/pricing" className="mt-4 inline-block text-xs text-[var(--accent)] hover:underline">Unlock with Premium →</Link>}
          </div>
        ))}
      </div>
    </div>
  );
}
