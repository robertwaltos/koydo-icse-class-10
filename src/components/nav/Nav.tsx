"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { LanguageSelector } from "./LanguageSelector";
import { MusicToggle } from "./MusicToggle";
import { AccountMenu } from "./AccountMenu";

interface NavProps {
  user: User | null;
  examName: string;
  examSlug: string;
}

const NAV_LINKS = [
  { href: "/",             label: "Home" },
  { href: "/learn",        label: "Learn" },
  { href: "/learn/mock-exam", label: "Mock Exam" },
  { href: "/study-rooms",  label: "Study Rooms" },
  { href: "/pricing",      label: "Pricing" },
];

export function Nav({ user, examName, examSlug }: NavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/90 backdrop-blur-md"
      style={{ height: "var(--nav-h)" }}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-[var(--foreground)]" aria-label={`Koydo ${examName} home`}>
          <KoydoLogoMark />
          <span className="hidden sm:inline">
            <span className="text-[var(--accent)]">Koydo</span>
            <span className="ml-1 text-sm font-medium text-[var(--muted)]">{examName}</span>
          </span>
        </Link>

        {/* Desktop center links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={[
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href))
                  ? "bg-[var(--accent-light)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)]",
              ].join(" ")}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <MusicToggle />
          <LanguageSelector examSlug={examSlug} />
          <a
            href={`https://store.koydo.app?ref=${examSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 rounded-full border border-[var(--card-border)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] lg:flex"
            aria-label="Koydo merchandise store"
          >
            🛍 Store
          </a>
          {user ? (
            <AccountMenu user={user} />
          ) : (
            <Link href="/auth/sign-in" className="koydo-btn-primary text-sm">
              Sign In
            </Link>
          )}
          {/* Hamburger */}
          <button
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--card-border)] md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="absolute inset-x-0 top-full border-b border-[var(--card-border)] bg-[var(--background)] px-4 py-4 shadow-lg md:hidden animate-fade-in">
          <div className="space-y-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={[
                  "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href))
                    ? "bg-[var(--accent-light)] text-[var(--accent)]"
                    : "text-[var(--foreground)] hover:bg-[var(--card)]",
                ].join(" ")}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-[var(--card-border)] pt-4">
            <MusicToggle />
            <LanguageSelector examSlug={examSlug} />
            <a href={`https://store.koydo.app?ref=${examSlug}`} target="_blank" rel="noopener noreferrer"
               className="text-xs text-[var(--muted)] hover:text-[var(--accent)]">🛍 Store</a>
          </div>
          {!user && (
            <div className="mt-4 flex gap-2">
              <Link href="/auth/sign-in" onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-lg bg-[var(--accent)] py-2 text-center text-sm font-semibold text-white">
                Sign In
              </Link>
              <Link href="/auth/sign-up" onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-lg border border-[var(--card-border)] py-2 text-center text-sm font-medium">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

// ─── Inline SVG icons ──────────────────────────────────────────────────────

function KoydoLogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="var(--accent)" />
      <path d="M8 14L12 10L16 14L20 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 18L12 14L16 18L20 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
