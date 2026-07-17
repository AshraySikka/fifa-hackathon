import { useState, useEffect, useRef } from "react";
import { DEMO_MATCH, DEMO_COMMENTARY } from "../data/commentary";

const AUTOPLAY_MS = 4500;

export default function AccessPage() {
  const [index, setIndex] = useState(-1); // -1 = not started
  const [playing, setPlaying] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [audioOn, setAudioOn] = useState(false);
  const [signOn, setSignOn] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);

  const intervalRef = useRef(null);
  // audioOn as a ref, kept in sync manually everywhere we change audioOn --
  // this sidesteps React's stale-closure problem, which is what caused the
  // "toggle on, nothing plays" bug: state updates aren't synchronous, so a
  // speak() call made right after setAudioOn(true) was still reading the
  // OLD value. The ref is always current the instant we set it.
  const audioOnRef = useRef(false);

  const current = index >= 0 ? DEMO_COMMENTARY[index] : null;
  const atEnd = index >= DEMO_COMMENTARY.length - 1;

  useEffect(() => {
    setSpeechSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  function speak(text) {
    if (!speechSupported) return;
    const synth = window.speechSynthesis;

    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onerror = (e) => console.error("Speech synthesis error:", e.error);
      synth.speak(utterance);
    };

    // Chrome has a known bug: calling cancel() immediately followed by
    // speak() in the same tick silently drops the new utterance -- no
    // error, no sound, nothing happens. Only cancel+delay when something
    // is actually mid-utterance; otherwise speak immediately (this also
    // keeps the very first call synchronous with the user's click, which
    // Safari requires for audio to be allowed at all).
    if (synth.speaking || synth.pending) {
      synth.cancel();
      setTimeout(doSpeak, 60);
    } else {
      doSpeak();
    }
  }

  function setAudio(next) {
    audioOnRef.current = next; // update synchronously, before React re-renders
    setAudioOn(next);
  }

  function toggleAudio() {
    const next = !audioOn;
    setAudio(next);
    if (!next) {
      window.speechSynthesis?.cancel();
    } else if (current) {
      speak(current.text);
    }
  }

  function handlePlayPause() {
    if (playing) {
      setPlaying(false);
    } else {
      if (!atEnd) goTo(index + 1); // advance right away instead of waiting for the timer
      setPlaying(true);
    }
  }

  function goTo(i) {
    const clamped = Math.max(-1, Math.min(DEMO_COMMENTARY.length - 1, i));
    setIndex(clamped);
    if (clamped >= 0 && audioOnRef.current) speak(DEMO_COMMENTARY[clamped].text);
  }

  function next() {
    goTo(index + 1);
  }
  function prev() {
    goTo(index - 1);
  }
  function restart() {
    window.speechSynthesis?.cancel();
    setPlaying(false);
    setIndex(-1);
  }

  // autoplay
  useEffect(() => {
    if (!playing) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setIndex((i) => {
        const nextI = i + 1;
        if (nextI >= DEMO_COMMENTARY.length) {
          setPlaying(false);
          clearInterval(intervalRef.current);
          return i;
        }
        if (audioOnRef.current) speak(DEMO_COMMENTARY[nextI].text);
        return nextI;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-6">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">Challenge extra</p>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Match Day Access</h1>
      <p className="mt-1 text-sm text-chalk/60">
        Live captions, spoken audio descriptions, and a sign-language interpreter slot -- built
        so no fan has to choose between following the match and understanding it.
      </p>
      <p className="mt-1 text-xs text-chalk/40">
        Demo mode -- playing back the same {DEMO_MATCH.team_a} vs {DEMO_MATCH.team_b} commentary
        from the Ref Chat screen, not a live feed.
      </p>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Accessibility settings">
        <ToggleChip label="Captions" active={captionsOn} onClick={() => setCaptionsOn((v) => !v)} />
        <ToggleChip
          label={speechSupported ? "Audio description" : "Audio description (unsupported in this browser)"}
          active={audioOn}
          onClick={toggleAudio}
          disabled={!speechSupported}
        />
        <ToggleChip label="Sign language slot" active={signOn} onClick={() => setSignOn((v) => !v)} />
      </div>

      <div className="mt-5 rounded-2xl border border-pitch-600/70 bg-pitch-800/60 p-5">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-semibold">
            {DEMO_MATCH.team_a} <span className="text-chalk/40">vs</span> {DEMO_MATCH.team_b}
          </span>
          <span className="font-mono text-xs text-signal">
            {current ? current.minute : "--:--"}
          </span>
        </div>

        {signOn && (
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-pitch-500/60 bg-pitch-900/40 py-8">
            <SignAvatarPlaceholder playing={playing} />
            <p className="mt-3 text-xs text-chalk/50">Sign-language interpreter slot -- placeholder</p>
            <p className="mt-1 max-w-sm text-center text-[11px] text-chalk/35">
              Real ASL translation needs a dedicated avatar/interpreter system, not something a
              hackathon build fakes. This box marks where that would plug in.
            </p>
          </div>
        )}

        {captionsOn && (
          <div
            className="mt-4 min-h-[88px] rounded-xl border border-pitch-600/70 bg-black/60 p-4"
            aria-live="polite"
          >
            {current ? (
              <>
                {current.tag && (
                  <span className="mb-1 inline-block rounded-full bg-flag/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-flag">
                    {current.tag}
                  </span>
                )}
                <p className="font-mono text-lg font-semibold leading-snug text-chalk">
                  {current.text}
                </p>
              </>
            ) : (
              <p className="font-mono text-sm text-chalk/40">
                Press play or "Next" to start the caption feed.
              </p>
            )}
          </div>
        )}

        {!speechSupported && (
          <p className="mt-2 text-[11px] text-chalk/40">
            This browser doesn't support the Web Speech API -- captions still work, audio
            description won't.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={prev}
            disabled={index <= 0}
            className="rounded-xl border border-pitch-600 px-3 py-2 text-sm text-chalk/70 hover:border-signal hover:text-signal disabled:opacity-30 transition-colors"
            aria-label="Previous commentary line"
          >
            ← Prev
          </button>
          <button
            onClick={handlePlayPause}
            disabled={atEnd && !playing}
            className="rounded-xl bg-signal px-5 py-2 text-sm font-semibold text-pitch-950 hover:bg-signal-glow disabled:opacity-40 transition-colors"
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button
            onClick={next}
            disabled={atEnd}
            className="rounded-xl border border-pitch-600 px-3 py-2 text-sm text-chalk/70 hover:border-signal hover:text-signal disabled:opacity-30 transition-colors"
            aria-label="Next commentary line"
          >
            Next →
          </button>
          <button
            onClick={restart}
            className="ml-auto rounded-xl border border-pitch-600 px-3 py-2 text-xs text-chalk/50 hover:text-signal transition-colors"
          >
            Restart
          </button>
        </div>

        <div className="mt-3 flex gap-1">
          {DEMO_COMMENTARY.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= index ? "bg-signal" : "bg-pitch-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ToggleChip({ label, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-30 ${
        active
          ? "border-signal bg-signal/15 text-signal"
          : "border-pitch-600 text-chalk/60 hover:border-pitch-500"
      }`}
    >
      {active ? "✓ " : ""}
      {label}
    </button>
  );
}

function SignAvatarPlaceholder({ playing }) {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle cx="36" cy="18" r="12" fill="#22352C" stroke="#22E584" strokeWidth="2" />
      <path d="M14 66c0-14 10-24 22-24s22 10 22 24" stroke="#22E584" strokeWidth="2" fill="none" />
      <path
        d="M22 44l-8-10M50 44l8-10"
        stroke="#22E584"
        strokeWidth="2"
        strokeLinecap="round"
        className={playing ? "animate-pulse" : ""}
      />
    </svg>
  );
}