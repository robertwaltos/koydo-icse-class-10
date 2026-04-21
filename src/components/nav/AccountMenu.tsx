"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AccountMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = user.email ? user.email[0].toUpperCase() : "U";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-[var(--card-border)] bg-[var(--background)] py-1 shadow-lg animate-fade-in">
          <div className="border-b border-[var(--card-border)] px-4 py-2">
            <p className="text-xs font-medium text-[var(--foreground)] truncate">{user.email}</p>
          </div>
          <Link href="/account" onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--card)]">
            👤 My Account
          </Link>
          <Link href="/account/subscription" onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--card)]">
            ⭐ Subscription
          </Link>
          <Link href="/account/settings" onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--card)]">
            ⚙️ Settings
          </Link>
          <div className="border-t border-[var(--card-border)] mt-1">
            <button onClick={signOut}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--card)]">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
