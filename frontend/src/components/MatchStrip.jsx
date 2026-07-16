function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
}

export default function MatchStrip({ matches, selectedMatch, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-xl border px-4 py-2 text-left text-xs transition-colors ${
          !selectedMatch
            ? "border-signal bg-signal/10 text-signal"
            : "border-pitch-600 text-chalk/60 hover:border-pitch-500"
        }`}
      >
        <div className="font-semibold">All bars</div>
        <div className="text-[10px] opacity-70">no match filter</div>
      </button>
      {matches.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m)}
          className={`shrink-0 rounded-xl border px-4 py-2 text-left transition-colors ${
            selectedMatch?.id === m.id
              ? "border-signal bg-signal/10 text-signal"
              : "border-pitch-600 text-chalk/80 hover:border-pitch-500"
          }`}
        >
          <div className="font-display text-sm font-semibold">
            {m.team_a} <span className="text-chalk/40">vs</span> {m.team_b}
          </div>
          <div className="text-[10px] opacity-70 font-mono">
            {formatDate(m.date)} · {m.time.slice(0, 5)} · {m.venue}
          </div>
        </button>
      ))}
    </div>
  );
}
