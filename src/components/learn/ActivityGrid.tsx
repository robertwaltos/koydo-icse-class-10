"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Activity {
  id: string;
  title: string;
  description: string;
  subject: string;
  activity_type: string;
  difficulty_level: string;
  estimated_minutes: number;
  thumbnail_url: string | null;
  is_featured: boolean;
}

const SUBJECT_ICONS: Record<string, string> = {
  math: "📐",
  language_arts: "📖",
  science: "🔬",
  history: "🏛️",
  arts_music_health: "🎨",
  cross_curricular: "🌐",
};

const TYPE_LABELS: Record<string, string> = {
  game: "Game",
  simulation: "Sim",
  video: "Video",
  worksheet: "Practice",
  quiz: "Quiz",
  project: "Project",
};

const DIFF_COLORS: Record<string, string> = {
  easy: "var(--success)",
  medium: "var(--accent)",
  hard: "#f59e0b",
};

export function ActivityGrid({ domain }: { domain?: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ limit: "12" });
    if (domain) params.set("domain", domain);
    fetch(`/api/act/activities?${params}`)
      .then((r) => r.json())
      .then((d: { activities?: Activity[] }) => {
        setActivities(d.activities ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [domain]);

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--card-border)]" />
        ))}
      </div>
    );
  }

  if (!activities.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {activities.map((a) => (
        <div key={a.id} className="koydo-card p-4 hover:border-[var(--accent)] transition cursor-pointer group">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xl">{SUBJECT_ICONS[a.subject] ?? "📚"}</span>
            <div className="flex items-center gap-1.5">
              {a.is_featured && (
                <span className="rounded-full bg-[var(--accent-light)] px-1.5 py-0.5 text-xs font-medium text-[var(--accent)]">★</span>
              )}
              <span className="text-xs text-[var(--muted)]">{TYPE_LABELS[a.activity_type] ?? a.activity_type}</span>
            </div>
          </div>
          <h4 className="text-sm font-semibold mb-1 leading-tight group-hover:text-[var(--accent)] transition-colors">
            {a.title}
          </h4>
          <p className="text-xs text-[var(--muted)] line-clamp-2 mb-3">{a.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: DIFF_COLORS[a.difficulty_level] ?? "var(--muted)" }}>
              {a.difficulty_level}
            </span>
            <span className="text-xs text-[var(--muted)]">~{a.estimated_minutes} min</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivitySection({ domain, title = "Related Activities" }: { domain?: string; title?: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ limit: "4" });
    if (domain) params.set("domain", domain);
    fetch(`/api/act/activities?${params}`)
      .then((r) => r.json())
      .then((d: { activities?: Activity[] }) => {
        setActivities(d.activities ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [domain]);

  if (loading || !activities.length) return null;

  return (
    <div>
      <h3 className="text-sm font-bold mb-3">{title}</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {activities.map((a) => (
          <div key={a.id} className="koydo-card p-3 flex items-center gap-3 hover:border-[var(--accent)] transition cursor-pointer">
            <span className="text-lg shrink-0">{SUBJECT_ICONS[a.subject] ?? "📚"}</span>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{a.title}</p>
              <p className="text-xs text-[var(--muted)]">{a.estimated_minutes} min</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
