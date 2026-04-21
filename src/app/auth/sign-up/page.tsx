"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { EXAM_CONFIG } from "@/lib/act/config";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/learn";
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: displayName }, emailRedirectTo: `${location.origin}/auth/callback?returnTo=${returnTo}` },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setDone(true);
    setLoading(false);
  };

  const signInGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback?returnTo=${returnTo}` } });
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="koydo-card w-full max-w-sm p-8 text-center">
          <span className="text-5xl mb-4 block">🎉</span>
          <h1 className="text-xl font-bold mb-2">Check your email</h1>
          <p className="text-sm text-[var(--muted)] mb-6">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
          <Link href="/auth/sign-in" className="text-sm text-[var(--accent)] hover:underline">Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="koydo-card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold mb-1">Join {EXAM_CONFIG.name}</h1>
          <p className="text-sm text-[var(--muted)]">Free account — no credit card needed</p>
        </div>

        <button onClick={signInGoogle} disabled={loading}
          className="koydo-btn-ghost w-full mb-4 flex items-center justify-center gap-2 py-2.5 text-sm">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Sign up with Google
        </button>

        <div className="mb-4 flex items-center gap-3 text-xs text-[var(--muted)]">
          <div className="flex-1 border-t border-[var(--card-border)]" />or<div className="flex-1 border-t border-[var(--card-border)]" />
        </div>

        <form onSubmit={signUp} className="space-y-3">
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name"
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--muted-bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email address"
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--muted-bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password (min. 8 chars)"
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--muted-bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" />
          {error && <p className="text-xs text-[var(--error)]">{error}</p>}
          <button type="submit" disabled={loading} className="koydo-btn-primary w-full py-2.5 text-sm disabled:opacity-60">
            {loading ? "…" : "Create free account"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-[var(--muted)]">
          Already have an account? <Link href="/auth/sign-in" className="text-[var(--accent)] hover:underline">Sign in</Link>
        </p>
        <p className="mt-2 text-center text-xs text-[var(--muted)]">
          By signing up you agree to our <Link href="/terms" className="hover:underline">Terms</Link> &amp; <Link href="/privacy" className="hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
