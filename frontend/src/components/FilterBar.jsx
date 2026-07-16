const VIBES = ["casual", "rowdy", "family"];

export default function FilterBar({
  teamFilter, setTeamFilter,
  vibeFilter, setVibeFilter,
  allTeams,
  onGoogleSearch, googleSearchLoading,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={teamFilter}
        onChange={(e) => setTeamFilter(e.target.value)}
        className="rounded-xl border border-pitch-600 bg-pitch-800 px-3 py-2 text-sm text-chalk focus:border-signal focus:outline-none"
      >
        <option value="">All teams</option>
        {allTeams.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <div className="flex gap-1 rounded-xl border border-pitch-600 bg-pitch-800 p-1">
        <button
          onClick={() => setVibeFilter("")}
          className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-colors ${
            vibeFilter === "" ? "bg-signal text-pitch-950" : "text-chalk/60 hover:text-chalk"
          }`}
        >
          Any vibe
        </button>
        {VIBES.map((v) => (
          <button
            key={v}
            onClick={() => setVibeFilter(v)}
            className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-colors ${
              vibeFilter === v ? "bg-signal text-pitch-950" : "text-chalk/60 hover:text-chalk"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <button
        onClick={onGoogleSearch}
        disabled={googleSearchLoading}
        className="ml-auto rounded-xl border border-signal/40 px-3 py-2 text-sm font-medium text-signal hover:bg-signal/10 transition-colors disabled:opacity-50"
      >
        {googleSearchLoading ? "Searching Google Places…" : "Find more bars via Google Places"}
      </button>
    </div>
  );
}
