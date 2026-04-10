import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Learn — ICSE Class 10 Practice",
  description: "Study and practice for ICSE Class 10. Choose your subject and start preparing.",
};

export default function LearnPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400">
          ← Back to Home
        </Link>
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          ICSE Class 10 Study Hub
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          Select a subject or start a full practice test.
        </p>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            Study modules coming soon. Content agents will populate this area with subject-specific practice.
          </p>
        </div>
      </div>
    </main>
  );
}
