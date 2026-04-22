import type { Metadata } from "next";
import Link from "next/link";
import { EXAM_CONFIG } from "@/lib/act/config";
import { CONTENT_MANIFEST } from "@/lib/act/content/manifest";
import { FlashcardReview } from "@/components/learn/FlashcardReview";

export const metadata: Metadata = { title: `Flashcards — ${EXAM_CONFIG.name}` };

const DECKS = CONTENT_MANIFEST.topics.map((t, i) => ({
  id: t.id,
  domain: t.domain,
  title: `${t.title} Key Concepts`,
  icon: t.icon,
  color: t.color,
  cardCount: Math.floor(t.minQuestionCount / 4),
  free: i < 2,
}));

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: Promise<{ deck?: string }>;
}) {
  const { deck } = await searchParams;
  const activeDeck = deck ? DECKS.find((d) => d.id === deck) : null;

  if (activeDeck) {
    return (
      <div className="min-h-screen">
        <div className="border-b border-[var(--card-border)] px-4 py-3 flex items-center justify-between">
          <Link href="/learn/flashcards" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Decks</Link>
          <span className="text-sm font-medium">{activeDeck.title}</span>
          <span />
        </div>
        <FlashcardReview deckId={activeDeck.domain} title={activeDeck.title} icon={activeDeck.icon} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/learn" className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Study Hub</Link>
      <h1 className="text-2xl font-bold mb-2">Flashcards</h1>
      <p className="text-sm text-[var(--muted)] mb-8">
        SM-2 spaced repetition — cards resurface at the optimal moment before you forget them.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {DECKS.map((deck) => (
          <div key={deck.id}
            className={["koydo-card p-5 transition", deck.free ? "hover:border-[var(--accent)]" : "opacity-70"].join(" ")}>
            <div className="flex items-start justify-between mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                style={{ background: `${deck.color}20` }}>{deck.icon}</span>
              {deck.free
                ? <span className="rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]">Free</span>
                : <span className="rounded-full bg-[var(--card-border)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">Premium</span>}
            </div>
            <h3 className="font-semibold mb-1 text-sm">{deck.title}</h3>
            <p className="text-xs text-[var(--muted)] mb-4">{deck.cardCount} cards · SM-2 algorithm</p>
            {deck.free
              ? <Link href={`/learn/flashcards?deck=${deck.id}`} className="koydo-btn-primary text-xs py-1.5 px-4 inline-block text-center">Study Now</Link>
              : <Link href="/pricing" className="text-xs text-[var(--accent)] hover:underline">Unlock with Premium →</Link>}
          </div>
        ))}
      </div>
    </div>
  );
}
