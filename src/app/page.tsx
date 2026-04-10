import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Koydo ICSE Class 10 — Free Exam Prep",
  description: "Comprehensive ICSE Class 10 preparation. Practice tests, AI tutor, score tracking. Study aid only. Not affiliated with official examination boards.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] px-4 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur">
            Tier 3 · varies annual test takers
          </span>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Ace ICSE Class 10 with Koydo
          </h1>
          <p className="mb-8 text-lg text-white/90 sm:text-xl">
            Practice questions · AI-powered study tools · Score prediction
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/learn"
              className="rounded-full bg-white px-8 py-3 text-sm font-bold text-zinc-900 shadow-lg transition hover:bg-zinc-100"
            >
              Start Free Practice
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-white/30 px-8 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
            >
              View Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Why Koydo for ICSE Class 10?
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "📝", title: "Practice Tests", desc: "Hundreds of practice questions matching the real ICSE Class 10 format." },
            { icon: "🤖", title: "AI Tutor", desc: "Get instant explanations and personalized study recommendations." },
            { icon: "📊", title: "Score Prediction", desc: "Track your progress and predict your exam score with AI analytics." },
            { icon: "📱", title: "Study Anywhere", desc: "Mobile-optimized for studying on the go, even offline." },
            { icon: "🎯", title: "Adaptive Learning", desc: "Focus on your weakest areas with intelligent question selection." },
            { icon: "🆓", title: "Free to Start", desc: "10 free questions every day. Upgrade for unlimited access." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
              <span className="mb-3 block text-2xl">{f.icon}</span>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">{f.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-8">
        <p className="mx-auto max-w-3xl text-center text-xs text-zinc-500 dark:text-zinc-500">
          Study aid only. Not affiliated with official examination boards.
        </p>
        <p className="mt-2 text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} Koydo. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
