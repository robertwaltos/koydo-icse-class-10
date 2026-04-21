import Link from "next/link";

interface Props {
  examName: string;
  examSlug: string;
}

const FOOTER_LINKS = [
  { href: "/learn",        label: "Learn" },
  { href: "/pricing",      label: "Pricing" },
  { href: "/study-rooms",  label: "Study Rooms" },
  { href: "/privacy",      label: "Privacy" },
  { href: "/terms",        label: "Terms" },
];

const ECOSYSTEM_LINKS = [
  { href: "https://koydo.app",               label: "Koydo Platform" },
  { href: "https://koydo-lingua.koydo.app",  label: "Koydo Lingua" },
  { href: "https://koydo-distill.koydo.app", label: "Koydo Distill" },
  { href: "https://koydo-vocab.koydo.app",   label: "Koydo Vocab" },
  { href: "https://store.koydo.app",         label: "🛍 Merch Store" },
];

export function Footer({ examName, examSlug }: Props) {
  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--background)] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-3 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect width="28" height="28" rx="7" fill="var(--accent)" />
                <path d="M8 14L12 10L16 14L20 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 18L12 14L16 18L20 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
              </svg>
              <span className="font-bold text-[var(--foreground)]">Koydo {examName}</span>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Smarter exam prep with AI tutoring, adaptive practice, and study rooms. Available on iOS, Android, and web.
            </p>
            <div className="mt-3 flex gap-2">
              <a href="https://apps.apple.com/app/id6739452395" target="_blank" rel="noopener noreferrer"
                className="koydo-btn-ghost text-xs py-1 px-3">📱 App Store</a>
              <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer"
                className="koydo-btn-ghost text-xs py-1 px-3">🤖 Google Play</a>
            </div>
          </div>

          {/* App links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">App</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ecosystem */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">Koydo Ecosystem</h4>
            <ul className="space-y-2">
              {ECOSYSTEM_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--card-border)] pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} Koydo. All rights reserved.
          </p>
          <p className="text-xs text-[var(--muted)] max-w-lg">
            Independent study aid — not affiliated with or endorsed by {examName} or any official testing authority. All trademarks belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
