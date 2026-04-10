"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Something went wrong</h1>
        <pre className="rounded-lg bg-zinc-100 dark:bg-zinc-900 p-4 text-xs text-zinc-600 dark:text-zinc-400 overflow-auto max-h-32 text-left">
          {error.message}
        </pre>
        <div className="flex items-center justify-center gap-4">
          <button onClick={reset} className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
            Try again
          </button>
          <Link href="/" className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
