import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AccountPage() {
  const { username, login, signup, authError } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [busy, setBusy] = useState(false);

  if (username) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    const ok = mode === "login" ? await login(u, p) : await signup(u, p);
    setBusy(false);
    // Client-side nav only -- a full page reload (window.location) would
    // wipe the in-memory-only auth token we just set.
    if (ok) navigate("/");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-6">
      <p className="font-mono text-xs uppercase tracking-widest text-signal text-center">
        Fan account
      </p>
      <h1 className="font-display text-3xl font-bold text-center">
        {mode === "login" ? "Log in" : "Create an account"}
      </h1>
      <p className="mt-1 text-center text-sm text-chalk/60">
        Tag which bars are actually screening a match.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-2xl border border-pitch-600/70 bg-pitch-800/60 p-6">
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-chalk/50">Username</span>
          <input
            value={u}
            onChange={(e) => setU(e.target.value)}
            required
            className="w-full rounded-xl border border-pitch-600 bg-pitch-900 px-3 py-2 text-sm text-chalk focus:border-signal focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-chalk/50">Password</span>
          <input
            type="password"
            value={p}
            onChange={(e) => setP(e.target.value)}
            required
            minLength={4}
            className="w-full rounded-xl border border-pitch-600 bg-pitch-900 px-3 py-2 text-sm text-chalk focus:border-signal focus:outline-none"
          />
        </label>

        {authError && <p className="text-sm text-flag">{authError}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-signal py-2.5 font-display font-semibold text-pitch-950 hover:bg-signal-glow transition-colors disabled:opacity-50"
        >
          {busy ? "Working…" : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="mt-4 text-center text-sm text-chalk/50 hover:text-signal"
      >
        {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
      </button>
    </div>
  );
}
