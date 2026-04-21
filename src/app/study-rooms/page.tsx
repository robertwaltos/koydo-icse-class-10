import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EXAM_CONFIG } from "@/lib/act/config";

export const metadata: Metadata = { title: `Study Rooms — ${EXAM_CONFIG.name}` };

interface StudyRoom {
  id: string;
  name: string;
  exam_id: string;
  participant_count: number;
  status: string;
  created_at: string;
}

export default async function StudyRoomsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: entitlement } = await supabase
    .from("microapp_user_entitlements")
    .select("status")
    .eq("user_id", user!.id)
    .eq("app_id", `koydo_${EXAM_CONFIG.slug}`)
    .maybeSingle();
  const isPremium = (entitlement as { status: string } | null)?.status === "active";

  const { data: rooms } = await supabase
    .from("study_rooms")
    .select("id, name, exam_id, participant_count, status, created_at")
    .eq("exam_id", EXAM_CONFIG.slug)
    .eq("is_public", true)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/learn" className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Study Hub</Link>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Study Rooms</h1>
          <p className="text-sm text-[var(--muted)]">Live collaborative study sessions with real-time quizzes and chat.</p>
        </div>
        {isPremium && (
          <button className="koydo-btn-primary">+ Create Room</button>
        )}
      </div>

      {!isPremium && (
        <div className="mb-8 rounded-xl border border-[var(--gold)] bg-[var(--gold-light)] p-5 flex items-center gap-4">
          <span className="text-3xl">👥</span>
          <div>
            <p className="font-semibold mb-1">Study Rooms — Premium Feature</p>
            <p className="text-sm text-[var(--muted)]">Join live study sessions, compete on real-time quizzes, and learn with peers.</p>
            <Link href="/pricing" className="mt-2 inline-block text-sm text-[var(--accent)] hover:underline">Unlock with Premium →</Link>
          </div>
        </div>
      )}

      {(rooms?.length ?? 0) === 0 ? (
        <div className="koydo-card p-12 text-center">
          <span className="text-5xl mb-4 block">🏠</span>
          <h2 className="font-bold text-lg mb-2">No active rooms</h2>
          <p className="text-sm text-[var(--muted)] mb-4">Be the first to create a study room for {EXAM_CONFIG.name}.</p>
          {isPremium && <button className="koydo-btn-primary">Create the First Room</button>}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(rooms as StudyRoom[]).map((room) => (
            <Link
              key={room.id}
              href={isPremium ? `/study-rooms/${room.id}` : "/pricing"}
              className="koydo-card p-5 transition hover:border-[var(--accent)] hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-sm">{room.name}</h3>
                <span className="flex items-center gap-1 rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--success)]">
                  🔴 Live
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">{room.participant_count ?? 0} participants · {EXAM_CONFIG.name}</p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-full border border-[var(--card-border)] px-2 py-0.5 text-xs">Live Quiz</span>
                <span className="rounded-full border border-[var(--card-border)] px-2 py-0.5 text-xs">Chat</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
