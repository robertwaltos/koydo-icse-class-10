import Link from "next/link";
import { EXAM_CONFIG } from "@/lib/act/config";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="mb-4 text-7xl">🗺️</span>
      <h1 className="mb-2 text-3xl font-bold">404 — Page not found</h1>
      <p className="mb-8 max-w-md text-[var(--muted)]">
        This page doesn&apos;t exist in {EXAM_CONFIG.name}. Let&apos;s get you back on track.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/learn" className="koydo-btn-primary px-6 py-2.5">Go to Study Hub</Link>
        <Link href="/" className="koydo-btn-ghost px-6 py-2.5">Home</Link>
      </div>
    </div>
  );
}
