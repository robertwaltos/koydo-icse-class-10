"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { EXAM_CONFIG } from "@/lib/act/config";

interface Message { id: string; user_id: string; display_name: string; text: string; ts: number; }
interface Presence { user_id: string; display_name: string; joined_at: string; }
interface QuizQuestion { id: string; question: string; options: string[]; correct: number; }
interface LiveQuiz { question: QuizQuestion; endsAt: number; votes: Record<number, number>; myVote: number | null; revealed: boolean; }

export default function StudyRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [roomId, setRoomId] = useState<string>("");
  const [room, setRoom] = useState<{ name: string; host_id: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [presence, setPresence] = useState<Presence[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Anon");
  const [quiz, setQuiz] = useState<LiveQuiz | null>(null);
  const [countdown, setCountdown] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    params.then((p) => setRoomId(p.roomId));
  }, [params]);

  useEffect(() => {
    if (!roomId) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push(`/auth/sign-in?returnTo=/study-rooms/${roomId}`); return; }
      setUserId(user.id);
      setDisplayName(user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Anon");
    });

    supabase.from("study_rooms").select("name, host_id").eq("id", roomId).single()
      .then(({ data }) => { if (data) setRoom(data); else router.push("/study-rooms"); });

    supabase.from("study_room_messages")
      .select("id, user_id, display_name, text, created_at")
      .eq("room_id", roomId).order("created_at").limit(50)
      .then(({ data }) => {
        if (data) setMessages(data.map((m) => ({ id: m.id, user_id: m.user_id, display_name: m.display_name, text: m.text, ts: new Date(m.created_at).getTime() })));
      });
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !userId) return;
    const ch = supabase.channel(`room:${roomId}`, { config: { presence: { key: userId } } });
    channelRef.current = ch;

    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState<Presence>();
      setPresence(Object.values(state).flat());
    });

    ch.on("broadcast", { event: "chat" }, ({ payload }) => {
      setMessages((prev) => [...prev, payload as Message]);
    });

    ch.on("broadcast", { event: "quiz_start" }, ({ payload }) => {
      const q = payload as { question: QuizQuestion; duration: number };
      const endsAt = Date.now() + q.duration * 1000;
      setQuiz({ question: q.question, endsAt, votes: {}, myVote: null, revealed: false });
    });

    ch.on("broadcast", { event: "quiz_vote" }, ({ payload }) => {
      setQuiz((prev) => prev ? { ...prev, votes: { ...prev.votes, [payload.option]: (prev.votes[payload.option] ?? 0) + 1 } } : prev);
    });

    ch.on("broadcast", { event: "quiz_reveal" }, () => {
      setQuiz((prev) => prev ? { ...prev, revealed: true } : prev);
    });

    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await ch.track({ user_id: userId, display_name: displayName, joined_at: new Date().toISOString() });
      }
    });

    return () => { ch.unsubscribe(); };
  }, [roomId, userId, displayName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!quiz) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((quiz.endsAt - Date.now()) / 1000));
      setCountdown(left);
      if (left === 0) { clearInterval(timerRef.current!); channelRef.current?.send({ type: "broadcast", event: "quiz_reveal", payload: {} }); }
    }, 500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [quiz?.endsAt]);

  const sendMessage = useCallback(async () => {
    if (!text.trim() || !channelRef.current || !userId) return;
    const msg: Message = { id: crypto.randomUUID(), user_id: userId, display_name: displayName, text: text.trim(), ts: Date.now() };
    await channelRef.current.send({ type: "broadcast", event: "chat", payload: msg });
    await supabase.from("study_room_messages").insert({ id: msg.id, room_id: roomId, user_id: userId, display_name: displayName, text: msg.text });
    setText("");
  }, [text, userId, displayName, roomId]);

  const castVote = useCallback(async (option: number) => {
    if (!channelRef.current || !quiz || quiz.myVote !== null) return;
    setQuiz((prev) => prev ? { ...prev, myVote: option } : prev);
    await channelRef.current.send({ type: "broadcast", event: "quiz_vote", payload: { option } });
  }, [quiz]);

  if (!room) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalVotes = Object.values(quiz?.votes ?? {}).reduce((s, n) => s + n, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/study-rooms" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Rooms</Link>
          <h1 className="text-lg font-bold">{room.name}</h1>
          <span className="flex items-center gap-1 rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--success)]">🔴 Live</span>
        </div>
        <span className="text-sm text-[var(--muted)]">{presence.length} online</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-4">
          {quiz && (
            <div className="koydo-card p-5 border-[var(--accent)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">⚡ Live Quiz</span>
                {!quiz.revealed && <span className="tabular-nums text-sm font-bold text-[var(--warning)]">{countdown}s</span>}
              </div>
              <p className="font-semibold mb-4">{quiz.question.question}</p>
              <div className="space-y-2">
                {quiz.question.options.map((opt, i) => {
                  const votes = quiz.votes[i] ?? 0;
                  const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                  const isCorrect = quiz.revealed && i === quiz.question.correct;
                  const isWrong = quiz.revealed && quiz.myVote === i && i !== quiz.question.correct;
                  return (
                    <button key={i} onClick={() => castVote(i)} disabled={quiz.myVote !== null || quiz.revealed}
                      className={["relative w-full rounded-lg border p-3 text-left text-sm transition overflow-hidden",
                        isCorrect ? "border-[var(--success)] bg-[var(--success)]/10" :
                        isWrong ? "border-[var(--error)] bg-[var(--error)]/10" :
                        quiz.myVote === i ? "border-[var(--accent)] bg-[var(--accent-light)]" :
                        "border-[var(--card-border)] hover:border-[var(--accent)]"].join(" ")}>
                      {(quiz.myVote !== null || quiz.revealed) && (
                        <div className="absolute inset-0 origin-left rounded-lg bg-[var(--accent)]/10 transition-all" style={{ width: `${pct}%` }} />
                      )}
                      <span className="relative">{opt}</span>
                      {(quiz.myVote !== null || quiz.revealed) && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">{pct}%</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="koydo-card flex flex-col" style={{ height: "420px" }}>
            <div className="border-b border-[var(--card-border)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Chat</div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={["flex gap-2", m.user_id === userId ? "flex-row-reverse" : ""].join(" ")}>
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                    {m.display_name[0]?.toUpperCase()}
                  </div>
                  <div className={["max-w-xs rounded-2xl px-3 py-2 text-sm", m.user_id === userId ? "bg-[var(--accent)] text-white" : "bg-[var(--card)]"].join(" ")}>
                    {m.user_id !== userId && <p className="mb-0.5 text-[10px] font-semibold opacity-60">{m.display_name}</p>}
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-[var(--card-border)] p-3 flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Message the room…" className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--muted-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
              <button onClick={sendMessage} disabled={!text.trim()} className="koydo-btn-primary px-4 py-2 text-sm disabled:opacity-40">Send</button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="koydo-card p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Participants ({presence.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {presence.map((p) => (
                <div key={p.user_id} className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">{p.display_name[0]?.toUpperCase()}</span>
                  <span className="text-sm truncate">{p.display_name}</span>
                  {p.user_id === room.host_id && <span className="ml-auto text-[10px] rounded-full bg-[var(--gold-light)] px-1.5 py-0.5 text-[var(--gold)] font-semibold">HOST</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="koydo-card p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Session Info</h3>
            <p className="text-xs text-[var(--muted)] mb-1">{EXAM_CONFIG.name}</p>
            <div className="flex gap-2 flex-wrap mt-3">
              <span className="rounded-full border border-[var(--card-border)] px-2 py-0.5 text-xs">Live Quiz</span>
              <span className="rounded-full border border-[var(--card-border)] px-2 py-0.5 text-xs">Chat</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
