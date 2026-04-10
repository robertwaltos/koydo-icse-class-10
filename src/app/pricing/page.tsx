import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — ICSE Class 10 Premium",
  description: "Unlock unlimited ICSE Class 10 practice with Koydo Premium.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400">
          ← Back to Home
        </Link>
        <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          ICSE Class 10 Premium
        </h1>
        <p className="mb-10 text-zinc-600 dark:text-zinc-400">
          Free tier: 10 questions/day. Premium: unlimited everything.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
            <h3 className="mb-2 text-lg font-semibold">Free</h3>
            <p className="mb-4 text-3xl font-bold">$0</p>
            <ul className="mb-6 space-y-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
              <li>✓ 10 questions per day</li>
              <li>✓ Score tracking</li>
              <li>✗ AI tutor</li>
              <li>✗ Full mock exams</li>
            </ul>
          </div>
          <div className="rounded-xl border-2 border-[var(--accent)] p-6">
            <h3 className="mb-2 text-lg font-semibold">Premium</h3>
            <p className="mb-4 text-3xl font-bold">$9.99<span className="text-base font-normal text-zinc-500">/mo</span></p>
            <ul className="mb-6 space-y-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
              <li>✓ Unlimited questions</li>
              <li>✓ AI tutor & explanations</li>
              <li>✓ Full mock exams</li>
              <li>✓ Score prediction</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
