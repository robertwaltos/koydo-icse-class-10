"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const TRACKS = [
  { id: "lofi_chill",   label: "Lo-fi Chill",     emoji: "🎵", src: "https://cdn.koydo.app/ambient/lofi-chill.mp3" },
  { id: "rain_focus",   label: "Rain & Focus",     emoji: "🌧", src: "https://cdn.koydo.app/ambient/rain-focus.mp3" },
  { id: "forest",       label: "Forest Sounds",    emoji: "🌿", src: "https://cdn.koydo.app/ambient/forest.mp3" },
  { id: "coffee_shop",  label: "Coffee Shop",      emoji: "☕", src: "https://cdn.koydo.app/ambient/coffee-shop.mp3" },
  { id: "deep_focus",   label: "Deep Focus",       emoji: "🧠", src: "https://cdn.koydo.app/ambient/deep-focus.mp3" },
  { id: "white_noise",  label: "White Noise",      emoji: "〰", src: "https://cdn.koydo.app/ambient/white-noise.mp3" },
];

export function AmbientPlayerPortal() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("koydo_music_active");
    if (saved === "1") setActive(true);

    function onToggle(e: CustomEvent<{ active: boolean }>) {
      setActive(e.detail.active);
      if (!e.detail.active && audioRef.current) {
        audioRef.current.pause();
        setPlaying(false);
      }
    }
    window.addEventListener("koydo_music_toggle", onToggle as EventListener);
    return () => window.removeEventListener("koydo_music_toggle", onToggle as EventListener);
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  async function play() {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setPlaying(true);
    } catch { /* autoplay blocked */ }
  }

  function pause() {
    audioRef.current?.pause();
    setPlaying(false);
  }

  function selectTrack(idx: number) {
    setTrackIdx(idx);
    if (audioRef.current) {
      audioRef.current.src = TRACKS[idx].src;
      if (playing) play();
    }
  }

  if (!mounted || !active) return null;

  const track = TRACKS[trackIdx];

  return createPortal(
    <div className="fixed bottom-4 left-4 z-50 select-none">
      <audio ref={audioRef} src={track.src} loop preload="none" />

      {expanded && (
        <div className="mb-2 w-64 rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 shadow-xl animate-fade-in">
          <p className="mb-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Ambient Sound</p>
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {TRACKS.map((t, i) => (
              <button key={t.id} onClick={() => selectTrack(i)}
                className={[
                  "rounded-lg py-2 text-center text-xs transition",
                  i === trackIdx ? "bg-[var(--accent)] text-white" : "hover:bg-[var(--card)] text-[var(--foreground)]",
                ].join(" ")}>
                <span className="block text-base">{t.emoji}</span>
                <span className="truncate block leading-tight mt-0.5">{t.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)]">🔈</span>
            <input type="range" min="0" max="1" step="0.05" value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 accent-[var(--accent)]" />
            <span className="text-[var(--muted)]">🔊</span>
          </div>
        </div>
      )}

      {/* Mini pill */}
      <div className="flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 shadow-md">
        <button onClick={playing ? pause : play}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-white text-xs"
          aria-label={playing ? "Pause" : "Play"}>
          {playing ? "❚❚" : "▶"}
        </button>
        <button onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-[var(--foreground)]">
          <span>{track.emoji}</span>
          <span className="max-w-24 truncate">{track.label}</span>
        </button>
        <button onClick={() => {
            setActive(false);
            localStorage.setItem("koydo_music_active", "0");
            window.dispatchEvent(new CustomEvent("koydo_music_toggle", { detail: { active: false } }));
          }}
          className="text-[var(--muted)] hover:text-[var(--error)] text-xs ml-1"
          aria-label="Close player">×</button>
      </div>
    </div>,
    document.body,
  );
}
