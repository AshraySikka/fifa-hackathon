import { useState } from "react";
import { api } from "../api/client";
import { TEAMS } from "../data/teams";

export default function PredictorPage() {
  const [teamA, setTeamA] = useState("Canada");
  const [teamB, setTeamB] = useState("Mexico");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handlePredict() {
    if (teamA === teamB) {
      setError("Pick two different teams.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const data = await api.predictMatch(teamA, teamB);
      setResult(data);
    } catch {
      setError("Prediction failed -- is the backend running on :8000?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-6">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">Challenge 1</p>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Match Predictor</h1>
      <p className="mt-1 text-sm text-chalk/60">
        Pick two teams. Mock model, real Claude-generated reasoning.
      </p>

      <div className="mt-6 grid gap-4 rounded-2xl border border-pitch-600/70 bg-pitch-800/60 p-6 sm:grid-cols-[1fr_auto_1fr]">
        <TeamSelect label="Team A" value={teamA} onChange={setTeamA} />
        <div className="hidden items-center justify-center text-chalk/40 font-display text-xl sm:flex">
          vs
        </div>
        <TeamSelect label="Team B" value={teamB} onChange={setTeamB} />
      </div>

      {error && <p className="mt-3 text-sm text-flag">{error}</p>}

      <button
        onClick={handlePredict}
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-signal py-3 font-display font-semibold text-pitch-950 hover:bg-signal-glow transition-colors disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {loading ? "Crunching it…" : "Predict the match"}
      </button>

      {result && (
        <div className="mt-8 rounded-2xl border border-pitch-600/70 bg-pitch-800/60 p-6">
          <div className="flex items-center justify-between font-display text-lg font-semibold">
            <span>{result.team_a}</span>
            <span>{result.team_b}</span>
          </div>

          <div className="mt-3 flex h-4 w-full overflow-hidden rounded-full bg-pitch-700 font-mono">
            <div
              className="flex items-center justify-center bg-signal text-[10px] font-bold text-pitch-950"
              style={{ width: `${result.team_a_win_pct}%` }}
            >
              {result.team_a_win_pct}%
            </div>
            <div
              className="flex items-center justify-center bg-chalk/25 text-[10px] font-bold text-chalk"
              style={{ width: `${result.draw_pct}%` }}
            >
              {result.draw_pct}%
            </div>
            <div
              className="flex items-center justify-center bg-flag text-[10px] font-bold text-pitch-950"
              style={{ width: `${result.team_b_win_pct}%` }}
            >
              {result.team_b_win_pct}%
            </div>
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-chalk/50">
            <span>Win</span>
            <span>Draw</span>
            <span>Win</span>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-chalk/80">{result.explanation}</p>
        </div>
      )}
    </div>
  );
}

function TeamSelect({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-chalk/50">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-pitch-600 bg-pitch-900 px-3 py-2 text-sm text-chalk focus:border-signal focus:outline-none"
      >
        {TEAMS.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </label>
  );
}
