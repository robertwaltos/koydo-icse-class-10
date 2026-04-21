"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="mb-4 text-6xl">⚠️</span>
      <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
      <p className="mb-6 text-sm text-[var(--muted)] max-w-md">{error.message || "An unexpected error occurred. Please try again."}</p>
      <div className="flex gap-3">
        <button onClick={reset} className="koydo-btn-primary px-6 py-2.5 text-sm">Try again</button>
        <Link href="/learn" className="koydo-btn-ghost px-6 py-2.5 text-sm">Study Hub</Link>
      </div>
    </div>
  );
}
