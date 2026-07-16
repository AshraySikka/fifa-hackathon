import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../api/client";

const POLL_MS = 3000;

export default function BanterPage() {
  const [displayName, setDisplayName] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [mode, setMode] = useState(null); // null | "nearby" | "global"

  if (!nameConfirmed) {
    return <NamePrompt displayName={displayName} setDisplayName={setDisplayName} onConfirm={() => setNameConfirmed(true)} />;
  }

  if (!mode) {
    return <ModePicker onPick={setMode} />;
  }

  return <ChatRoomView mode={mode} displayName={displayName} onBack={() => setMode(null)} />;
}

function NamePrompt({ displayName, setDisplayName, onConfirm }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-6">
      <p className="font-mono text-xs uppercase tracking-widest text-signal text-center">Challenge extra</p>
      <h1 className="font-display text-3xl font-bold text-center">Chant & Banter</h1>
      <p className="mt-1 text-center text-sm text-chalk/60">
        What should other fans see you as?
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (displayName.trim()) onConfirm();
        }}
        className="mt-6 space-y-3 rounded-2xl border border-pitch-600/70 bg-pitch-800/60 p-6"
      >
        <input
          autoFocus
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Ash from Toronto"
          maxLength={30}
          className="w-full rounded-xl border border-pitch-600 bg-pitch-900 px-3 py-2 text-sm text-chalk placeholder:text-chalk/30 focus:border-signal focus:outline-none"
        />
        <button
          type="submit"
          disabled={!displayName.trim()}
          className="w-full rounded-xl bg-signal py-2.5 font-display font-semibold text-pitch-950 hover:bg-signal-glow transition-colors disabled:opacity-50"
        >
          Continue
        </button>
      </form>
    </div>
  );
}

function ModePicker({ onPick }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-6">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">Challenge extra</p>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Chant & Banter</h1>
      <p className="mt-1 text-sm text-chalk/60">
        Chat with fans right around you, or bring in friends from anywhere.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => onPick("nearby")}
          className="rounded-2xl border border-pitch-600/70 bg-pitch-800/60 p-6 text-left transition-colors hover:border-signal/60 hover:shadow-floodlight"
        >
          <p className="font-display text-lg font-semibold">Nearby</p>
          <p className="mt-1 text-sm text-chalk/60">
            Auto-joins a room with everyone else using MatchDay TO near your location right now.
          </p>
          <p className="mt-3 text-[11px] text-chalk/40">Uses your browser location, not Bluetooth.</p>
        </button>

        <button
          onClick={() => onPick("global")}
          className="rounded-2xl border border-pitch-600/70 bg-pitch-800/60 p-6 text-left transition-colors hover:border-signal/60 hover:shadow-floodlight"
        >
          <p className="font-display text-lg font-semibold">Global</p>
          <p className="mt-1 text-sm text-chalk/60">
            Start a room and share the code with friends anywhere in the world.
          </p>
          <p className="mt-3 text-[11px] text-chalk/40">Works across borders, no location needed.</p>
        </button>
      </div>
    </div>
  );
}

function ChatRoomView({ mode, displayName, onBack }) {
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const lastIdRef = useRef(0);
  const bottomRef = useRef(null);

  // -- Nearby: request geolocation, join the grid room for that spot --
  useEffect(() => {
    if (mode !== "nearby" || room) return;
    if (!navigator.geolocation) {
      setError("This browser doesn't support geolocation. Try Global instead.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await api.getNearbyRoom(pos.coords.latitude, pos.coords.longitude);
          setRoom(r);
        } catch {
          setError("Couldn't reach the backend -- is it running on :8000?");
        }
      },
      () => setError("Location permission denied. Allow location access, or use Global chat instead."),
      { timeout: 8000 }
    );
  }, [mode, room]);

  const startGlobalRoom = async () => {
    try {
      const r = await api.createGlobalRoom();
      setRoom(r);
    } catch {
      setError("Couldn't reach the backend -- is it running on :8000?");
    }
  };

  const joinGlobalRoom = async () => {
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) return;
    setError(null);
    try {
      const msgs = await api.getMessages(code);
      setRoom({ code });
      setMessages(msgs);
      lastIdRef.current = msgs.length ? msgs[msgs.length - 1].id : 0;
    } catch (e) {
      setError(e.response?.data?.error || "Couldn't find that room.");
    }
  };

  const poll = useCallback(async () => {
    if (!room) return;
    try {
      const msgs = await api.getMessages(room.code, lastIdRef.current || undefined);
      if (msgs.length) {
        setMessages((m) => [...m, ...msgs]);
        lastIdRef.current = msgs[msgs.length - 1].id;
      }
    } catch {
      // silent -- next poll tick will retry
    }
  }, [room]);

  useEffect(() => {
    if (!room) return;
    const interval = setInterval(poll, POLL_MS);
    return () => clearInterval(interval);
  }, [room, poll]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !room) return;
    const text = input;
    setInput("");
    try {
      const msg = await api.sendMessage(room.code, displayName, text);
      setMessages((m) => [...m, msg]);
      lastIdRef.current = msg.id;
    } catch {
      setError("Message failed to send -- check the backend is running.");
    }
  }

  function copyInvite() {
    const link = `${window.location.origin}/banter?join=${room.code}`;
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-5 py-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-chalk/50 hover:text-signal">
          ← Back
        </button>
        {room && (
          <span className="rounded-full bg-pitch-700 px-3 py-1 font-mono text-xs text-signal">
            {room.code}
          </span>
        )}
      </div>

      <h1 className="mt-2 font-display text-2xl font-bold">
        {mode === "nearby" ? "Nearby chat" : "Global chat"}
      </h1>

      {error && <p className="mt-2 text-sm text-flag">{error}</p>}

      {!room && mode === "global" && (
        <div className="mt-6 space-y-4">
          <button
            onClick={startGlobalRoom}
            className="w-full rounded-xl bg-signal py-3 font-display font-semibold text-pitch-950 hover:bg-signal-glow transition-colors"
          >
            Start a new room
          </button>
          <div className="flex items-center gap-2 text-xs text-chalk/40">
            <div className="h-px flex-1 bg-pitch-600" /> or join one <div className="h-px flex-1 bg-pitch-600" />
          </div>
          <div className="flex gap-2">
            <input
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinGlobalRoom()}
              placeholder="Enter invite code"
              className="flex-1 rounded-xl border border-pitch-600 bg-pitch-900 px-4 py-2.5 text-sm uppercase tracking-widest text-chalk placeholder:text-chalk/30 placeholder:normal-case focus:border-signal focus:outline-none"
            />
            <button
              onClick={joinGlobalRoom}
              className="rounded-xl border border-signal/40 px-4 py-2.5 text-sm font-medium text-signal hover:bg-signal/10"
            >
              Join
            </button>
          </div>
        </div>
      )}

      {!room && mode === "nearby" && !error && (
        <p className="mt-6 text-sm text-chalk/50">Finding fans near you…</p>
      )}

      {room && (
        <>
          {mode === "global" && (
            <button
              onClick={copyInvite}
              className="mt-3 w-fit rounded-full border border-pitch-600 px-3 py-1.5 text-xs text-chalk/70 hover:border-signal hover:text-signal transition-colors"
            >
              {copied ? "Copied!" : "Copy invite link"}
            </button>
          )}

          <div className="mt-4 flex-1 space-y-2 overflow-y-auto rounded-2xl border border-pitch-600/70 bg-pitch-800/40 p-4">
            {messages.length === 0 && (
              <p className="text-sm text-chalk/40">No messages yet -- say hi to kick things off.</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender_name === displayName ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    m.sender_name === displayName
                      ? "bg-signal text-pitch-950 font-medium"
                      : "bg-pitch-700 text-chalk/90"
                  }`}
                >
                  {m.sender_name !== displayName && (
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-signal/80">
                      {m.sender_name}
                    </p>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Say something…"
              maxLength={500}
              className="flex-1 rounded-xl border border-pitch-600 bg-pitch-900 px-4 py-2.5 text-sm text-chalk placeholder:text-chalk/30 focus:border-signal focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-pitch-950 hover:bg-signal-glow transition-colors"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
