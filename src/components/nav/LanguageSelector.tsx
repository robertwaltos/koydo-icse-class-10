"use client";

import { useRouter } from "next/navigation";

interface Props { examSlug: string; }

const LOCALES = [
  { code: "en", label: "English",    flag: "🇺🇸" },
  { code: "es", label: "Español",    flag: "🇪🇸" },
  { code: "fr", label: "Français",   flag: "🇫🇷" },
  { code: "de", label: "Deutsch",    flag: "🇩🇪" },
  { code: "pt", label: "Português",  flag: "🇧🇷" },
  { code: "ar", label: "العربية",   flag: "🇸🇦" },
  { code: "hi", label: "हिन्दी",    flag: "🇮🇳" },
  { code: "zh", label: "中文",       flag: "🇨🇳" },
  { code: "ja", label: "日本語",     flag: "🇯🇵" },
  { code: "ko", label: "한국어",     flag: "🇰🇷" },
];

export function LanguageSelector({ examSlug }: Props) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const locale = e.target.value;
    if (locale === "en") return; // already on en version
    // Route to locale-specific app: koydo-{slug}-{locale}.koydo.app
    if (typeof window !== "undefined") {
      window.location.href = `https://koydo-${examSlug}-${locale}.koydo.app`;
    }
  }

  return (
    <select
      onChange={handleChange}
      defaultValue="en"
      aria-label="Select language"
      className="h-8 cursor-pointer rounded-full border border-[var(--card-border)] bg-[var(--background)] px-2 text-xs text-[var(--foreground)] transition hover:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
    >
      {LOCALES.map((l) => (
        <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
      ))}
    </select>
  );
}
