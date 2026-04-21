"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { EXAM_CONFIG } from "@/lib/act/config";

export default function MagicLinkPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?returnTo=/learn` },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="koydo-card w-full max-w-sm p-8 text-center">
          <span className="text-5xl mb-4 block">📬</span>
          <h1 className="text-xl font-bold mb-2">Magic link sent</h1>
          <p className="text-sm text-[var(--muted)] mb-2">Check your inbox at <strong>{email}</strong></p>
          <p className="text-xs text-[var(--muted)] mb-6">The link expires in 60 minutes.</p>
          <button onClick={() => setSent(false)} className="text-sm text-[var(--accent)] hover:underline">Resend link</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="koydo-card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold mb-1">Passwordless sign in</h1>
          <p className="text-sm text-[var(--muted)]">Get a one-click login link for {EXAM_CONFIG.name}</p>
        </div>
        <form onSubmit={send} className="space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email address"
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--muted-bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" />
          {error && <p className="text-xs text-[var(--error)]">{error}</p>}
          <button type="submit" disabled={loading} className="koydo-btn-primary w-full py-2.5 text-sm disabled:opacity-60">
            {loading ? "Sending…" : "Send magic link"}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-[var(--muted)]">
          <Link href="/auth/sign-in" className="text-[var(--accent)] hover:underline">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
