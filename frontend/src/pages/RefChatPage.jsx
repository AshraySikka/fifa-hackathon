import { useState, useRef, useEffect } from "react";
import { api } from "../api/client";
import { DEMO_MATCH, DEMO_COMMENTARY } from "../data/commentary";

const GENERAL_STARTERS = [
  "Was that offside?",
  "Can a goalkeeper be shown a red card?",
  "What counts as a handball?",
  "How does VAR review a penalty decision?",
];

export default function RefChatPage() {
  const [mode, setMode] = useState("general"); // "general" | "commentary"
  const [messages, setMessages] = useState([
    {
      role: "ref",
      text: "Ask me anything about the Laws of the Game -- offside, handball, VAR, cards, you name it. I'll cite the exact law.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(question, commentaryContext = "") {
    const q = question ?? input;
    if (!q.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const data = await api.refExplain(q, commentaryContext);
      setMessages((m) => [...m, { role: "ref", text: data.answer }]);
    } catch {
      setMessages((m) => [...m, { role: "ref", text: "Couldn't reach the backend -- is it running on :8000?" }]);
    } finally {
      setLoading(false);
    }
  }

  function askAboutMoment(event) {
    send(event.suggestedQuestion, event.text);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl flex-col px-5 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-signal">Challenge 6</p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Referee Decision Explainer</h1>
          <p className="mt-1 text-sm text-chalk/60">
            Rules questions, answered in plain English with the exact Law cited.
          </p>
        </div>

        <div className="flex rounded-xl border border-pitch-600 bg-pitch-800 p-1">
          <button
            onClick={() => setMode("general")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "general" ? "bg-signal text-pitch-950" : "text-chalk/60 hover:text-chalk"
            }`}
          >
            General Q&A
          </button>
          <button
            onClick={() => setMode("commentary")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "commentary" ? "bg-signal text-pitch-950" : "text-chalk/60 hover:text-chalk"
            }`}
          >
            Live Commentary (demo)
          </button>
        </div>
      </div>

      {mode === "general" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {GENERAL_STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-pitch-600 px-3 py-1 text-xs text-chalk/70 hover:border-signal hover:text-signal transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-pitch-600/70 bg-pitch-800/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display text-sm font-semibold">
                  {DEMO_MATCH.team_a} <span className="text-chalk/40">vs</span> {DEMO_MATCH.team_b}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-flag">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-flag" /> DEMO FEED
                </span>
              </div>
              <p className="mb-2 text-[11px] text-chalk/40">
                Fake commentary for demo purposes -- {DEMO_MATCH.venue}
              </p>
              <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
                {DEMO_COMMENTARY.map((event, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-2.5 text-xs leading-relaxed ${
                      event.tag
                        ? "border-signal/40 bg-signal/5"
                        : "border-pitch-600/50 bg-pitch-900/40"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-signal">{event.minute}</span>
                      {event.tag && (
                        <span className="rounded-full bg-flag/15 px-2 py-0.5 text-[9px] font-semibold uppercase text-flag">
                          {event.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-chalk/80">{event.text}</p>
                    {event.suggestedQuestion && (
                      <button
                        onClick={() => askAboutMoment(event)}
                        disabled={loading}
                        className="mt-2 text-[11px] font-medium text-signal hover:text-signal-glow disabled:opacity-40"
                      >
                        Ask the ref about this →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col">
            <ChatPanel messages={messages} loading={loading} bottomRef={bottomRef} />
            <ChatInput input={input} setInput={setInput} onSend={() => send()} loading={loading} />
          </div>
        </div>
      )}

      {mode === "general" && (
        <div className="mt-4 flex flex-1 flex-col">
          <ChatPanel messages={messages} loading={loading} bottomRef={bottomRef} />
          <ChatInput input={input} setInput={setInput} onSend={() => send()} loading={loading} />
        </div>
      )}
    </div>
  );
}

function ChatPanel({ messages, loading, bottomRef }) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-pitch-600/70 bg-pitch-800/40 p-4">
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "user" ? "bg-signal text-pitch-950 font-medium" : "bg-pitch-700 text-chalk/90"
            }`}
          >
            {m.text}
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="rounded-2xl bg-pitch-700 px-4 py-2.5 text-sm text-chalk/50">
            Checking the Laws of the Game…
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function ChatInput({ input, setInput, onSend, loading }) {
  return (
    <div className="mt-3 flex gap-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        placeholder="e.g. was that offside?"
        className="flex-1 rounded-xl border border-pitch-600 bg-pitch-900 px-4 py-2.5 text-sm text-chalk placeholder:text-chalk/30 focus:border-signal focus:outline-none"
      />
      <button
        onClick={onSend}
        disabled={loading}
        className="rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-pitch-950 hover:bg-signal-glow transition-colors disabled:opacity-50"
      >
        Ask
      </button>
    </div>
  );
}
