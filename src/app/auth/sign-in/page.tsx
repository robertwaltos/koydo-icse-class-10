"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { EXAM_CONFIG } from "@/lib/act/config";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/learn";
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [magicSent, setMagicSent] = useState(false);

  const signInPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    router.push(returnTo);
  };

  const signInMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback?returnTo=${returnTo}` } });
    if (err) { setError(err.message); setLoading(false); return; }
    setMagicSent(true);
    setLoading(false);
  };

  const signInGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback?returnTo=${returnTo}` } });
  };

  if (magicSent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="koydo-card w-full max-w-sm p-8 text-center">
          <span className="text-5xl mb-4 block">📬</span>
          <h1 className="text-xl font-bold mb-2">Check your email</h1>
          <p className="text-sm text-[var(--muted)] mb-6">We sent a magic link to <strong>{email}</strong></p>
          <button onClick={() => setMagicSent(false)} className="text-sm text-[var(--accent)] hover:underline">← Back to sign in</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="koydo-card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold mb-1">Sign in to {EXAM_CONFIG.name}</h1>
          <p className="text-sm text-[var(--muted)]">Track progress, unlock premium features</p>
        </div>

        <button onClick={signInGoogle} disabled={loading}
          className="koydo-btn-ghost w-full mb-4 flex items-center justify-center gap-2 py-2.5 text-sm">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div className="mb-4 flex items-center gap-3 text-xs text-[var(--muted)]">
          <div className="flex-1 border-t border-[var(--card-border)]" />or<div className="flex-1 border-t border-[var(--card-border)]" />
        </div>

        <div className="mb-4 flex rounded-lg border border-[var(--card-border)] overflow-hidden">
          {(["password", "magic"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={["flex-1 py-2 text-sm transition", mode === m ? "bg-[var(--accent)] text-white" : "bg-transparent text-[var(--muted)] hover:text-[var(--foreground)]"].join(" ")}>
              {m === "password" ? "Password" : "Magic link"}
            </button>
          ))}
        </div>

        <form onSubmit={mode === "password" ? signInPassword : signInMagic} className="space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email address"
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--muted-bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" />
          {mode === "password" && (
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--muted-bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" />
          )}
          {error && <p className="text-xs text-[var(--error)]">{error}</p>}
          <button type="submit" disabled={loading} className="koydo-btn-primary w-full py-2.5 text-sm disabled:opacity-60">
            {loading ? "…" : mode === "password" ? "Sign in" : "Send magic link"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-xs text-[var(--muted)]">
          <Link href="/auth/sign-up" className="hover:text-[var(--foreground)]">Create account</Link>
          <Link href="/auth/magic-link" className="hover:text-[var(--foreground)]">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}
