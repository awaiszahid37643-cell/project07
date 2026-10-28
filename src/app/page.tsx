"use client";

import { useEffect, useRef, useState } from "react";
import rules from "./rules.json";

type Message = { id: number; role: "user" | "bot"; text: string };

const GREETING =
  "Assalam o Alaikum! Main UOS Helpdesk Bot hoon. Aap mujh se fee, admission, eligibility, timing, library, hostel, transport, scholarship, exams, contact, degree ya societies ke bare mein pooch sakte hain.";

const FALLBACK =
  "Maaf kijiye, mujhe is sawal ka jawab nahi mila. Meherbani karke apna sawal dobara likhein, ya fee, admission, hostel, library jaise lafz istemal karein.";

const normalize = (text: string) =>
  text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

function getReply(input: string): string {
  const msg = normalize(input);
  if (!msg) return FALLBACK;

  let best: { reply: string; score: number } | null = null;
  for (const rule of rules) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (msg.includes(normalize(keyword))) score += keyword.length;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { reply: rule.reply, score };
    }
  }
  return best ? best.reply : FALLBACK;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "bot", text: GREETING },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length, role: "user", text },
      { id: prev.length + 1, role: "bot", text: getReply(text) },
    ]);
    setInput("");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="flex h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-lg">
        <header className="bg-blue-600 px-4 py-3 text-lg font-semibold text-white">
          UOS Helpdesk Bot
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "rounded-br-sm bg-blue-600 text-white"
                    : "rounded-bl-sm bg-gray-200 text-gray-900"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="flex gap-2 border-t p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Apna sawal likhein..."
            className="flex-1 rounded-full border px-4 py-2 text-sm outline-none focus:border-blue-500"
          />
          <button
            onClick={send}
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}