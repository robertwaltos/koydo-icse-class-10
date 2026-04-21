"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { EXAM_CONFIG } from "@/lib/act/config";

const LOCALES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
];

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [displayName, setDisplayName] = useState("");
  const [locale, setLocale] = useState("en");
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth/sign-in?returnTo=/account/settings"); return; }
      supabase.from("user_profiles").select("display_name, locale, theme, email_notifications, push_notifications")
        .eq("user_id", user.id).maybeSingle()
        .then(({ data }) => {
          if (data) {
            setDisplayName((data as { display_name: string | null }).display_name ?? "");
            setLocale((data as { locale: string | null }).locale ?? "en");
            setTheme(((data as { theme: string | null }).theme as typeof theme) ?? "system");
            setEmailNotifs((data as { email_notifications: boolean | null }).email_notifications ?? true);
            setPushNotifs((data as { push_notifications: boolean | null }).push_notifications ?? true);
          }
        });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_profiles").upsert({
      user_id: user.id,
      display_name: displayName,
      locale,
      theme,
      email_notifications: emailNotifs,
      push_notifications: pushNotifs,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">Settings</h1>
      <p className="text-sm text-[var(--muted)] mb-8">Preferences for {EXAM_CONFIG.name}.</p>

      <div className="space-y-6 max-w-xl">
        <section className="koydo-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Profile</h2>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Display name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--muted-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" placeholder="Your name" />
          </div>
        </section>

        <section className="koydo-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Language & Region</h2>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Interface language</label>
            <select value={locale} onChange={(e) => setLocale(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--muted-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]">
              {LOCALES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>
        </section>

        <section className="koydo-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Appearance</h2>
          <div className="flex gap-2">
            {(["system", "light", "dark"] as const).map((t) => (
              <button key={t} onClick={() => setTheme(t)}
                className={["flex-1 rounded-lg border py-2 text-sm capitalize transition", theme === t ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]" : "border-[var(--card-border)]"].join(" ")}>
                {t === "system" ? "🖥 System" : t === "light" ? "☀️ Light" : "🌙 Dark"}
              </button>
            ))}
          </div>
        </section>

        <section className="koydo-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Notifications</h2>
          {[
            { label: "Email reminders", desc: "Daily study streak reminders", value: emailNotifs, set: setEmailNotifs },
            { label: "Push notifications", desc: "Scores, quiz invites, room alerts", value: pushNotifs, set: setPushNotifs },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{n.label}</p>
                <p className="text-xs text-[var(--muted)]">{n.desc}</p>
              </div>
              <button onClick={() => n.set(!n.value)} className={["relative inline-flex h-6 w-11 rounded-full transition", n.value ? "bg-[var(--accent)]" : "bg-[var(--card-border)]"].join(" ")}>
                <span className={["absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", n.value ? "translate-x-5" : "translate-x-0"].join(" ")} />
              </button>
            </div>
          ))}
        </section>

        <button onClick={save} disabled={saving}
          className="koydo-btn-primary w-full py-2.5 disabled:opacity-60">
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
