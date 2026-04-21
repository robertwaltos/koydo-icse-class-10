"use client";

import { useState, useEffect } from "react";

export function MusicToggle() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("koydo_music_active");
    if (saved === "1") setActive(true);
  }, []);

  function toggle() {
    const next = !active;
    setActive(next);
    localStorage.setItem("koydo_music_active", next ? "1" : "0");
    window.dispatchEvent(new CustomEvent("koydo_music_toggle", { detail: { active: next } }));
  }

  return (
    <button
      onClick={toggle}
      aria-label={active ? "Stop ambient music" : "Play lo-fi ambient music"}
      aria-pressed={active}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-full border text-sm transition-all",
        active
          ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
          : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
      ].join(" ")}
    >
      {active ? "♪" : "♩"}
    </button>
  );
}
