"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

interface Props {
  userId: string | null;
  examSlug: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function CortexWidget({ userId, examSlug }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Only show on learn routes
  const showOnRoute = pathname.startsWith("/learn") || pathname.startsWith("/study-rooms");
  if (!showOnRoute) return null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/${examSlug}/tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim(), history: messages }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "I couldn't process that. Try again." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg transition hover:scale-110 active:scale-95"
          aria-label="Open Cortex AI tutor"
          style={{ animation: "pulse-ring 2.5s infinite" }}
        >
          🤖
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="flex w-80 flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--background)] shadow-2xl animate-fade-in" style={{ height: "420px" }}>
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-[var(--accent)] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <p className="text-sm font-semibold text-white">Cortex AI Tutor</p>
                <p className="text-xs text-white/70">Ask anything about {examSlug.toUpperCase()}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-lg leading-none" aria-label="Close">×</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">🧠</p>
                <p className="text-sm text-[var(--muted)]">Hi! I'm your AI tutor. Ask me to explain a concept, solve a problem, or create practice questions.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={[
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.role === "user"
                    ? "bg-[var(--accent)] text-white rounded-br-sm"
                    : "bg-[var(--card)] text-[var(--foreground)] rounded-bl-sm",
                ].join(" ")}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--card)] rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-[var(--muted)]">
                  <span className="animate-pulse">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[var(--card-border)] p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder={userId ? "Ask Cortex…" : "Sign in to use AI tutor"}
              disabled={!userId || loading}
              className="flex-1 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading || !userId}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-white disabled:opacity-40"
              aria-label="Send"
            >
              ↑
            </button>
          </div>
          {!userId && (
            <p className="px-4 pb-3 text-center text-xs text-[var(--muted)]">
              <a href="/auth/sign-in" className="text-[var(--accent)] hover:underline">Sign in</a> to unlock AI tutoring
            </p>
          )}
        </div>
      )}
    </div>
  );
}
