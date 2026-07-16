const VIBE_STYLES = {
  rowdy: "bg-flag/15 text-flag border-flag/30",
  casual: "bg-signal/15 text-signal border-signal/30",
  family: "bg-amber-400/15 text-amber-300 border-amber-400/30",
};

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Downtown Toronto reference point (Union Station) used for distance display
// since we don't ask for geolocation permission mid-demo.
const TORONTO_CENTER = { lat: 43.6453, lng: -79.3806 };

export default function BarCard({ bar, selectedMatch, onTagScreening, isLoggedIn, isActive, onHover }) {
  const distanceKm = haversineKm(TORONTO_CENTER.lat, TORONTO_CENTER.lng, bar.lat, bar.lng);
  const alreadyTagged = selectedMatch
    ? bar.screening_tags?.some((t) => t.match === selectedMatch.id)
    : false;

  return (
    <div
      onMouseEnter={() => onHover?.(bar.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group relative overflow-hidden rounded-2xl border bg-pitch-800/70 p-4 transition-all duration-200 ${
        isActive
          ? "border-signal shadow-floodlight"
          : "border-pitch-600/70 hover:border-signal/50 hover:shadow-floodlight"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold leading-snug text-chalk">
            {bar.name}
          </h3>
          <p className="mt-0.5 text-xs text-chalk/50">{bar.address}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${VIBE_STYLES[bar.vibe] || VIBE_STYLES.casual}`}
        >
          {bar.vibe}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-chalk/60 font-mono">
        <span className="flex items-center gap-1">
          <StarIcon /> {bar.rating?.toFixed(1) ?? "—"}
        </span>
        <span>{distanceKm.toFixed(1)} km from downtown</span>
        {bar.hours && <span className="truncate max-w-[180px]">{bar.hours}</span>}
      </div>

      {bar.team_tag_list?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {bar.team_tag_list.map((t) => (
            <span
              key={t}
              className="rounded-full bg-pitch-700 px-2 py-0.5 text-[11px] text-chalk/70"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <a
          href={`tel:${bar.phone}`}
          className="flex-1 rounded-xl bg-signal py-2 text-center text-sm font-semibold text-pitch-950 transition-colors hover:bg-signal-glow"
        >
          Call to confirm they're screening this match
        </a>
      </div>

      {selectedMatch && (
        <button
          disabled={!isLoggedIn || alreadyTagged}
          onClick={() => onTagScreening(bar.id, selectedMatch.id)}
          className={`mt-2 w-full rounded-xl border py-1.5 text-xs font-medium transition-colors ${
            alreadyTagged
              ? "border-signal/40 text-signal cursor-default"
              : isLoggedIn
              ? "border-pitch-600 text-chalk/70 hover:border-signal hover:text-signal"
              : "border-pitch-700 text-chalk/30 cursor-not-allowed"
          }`}
          title={!isLoggedIn ? "Log in to tag a screening" : undefined}
        >
          {alreadyTagged
            ? `Tagged as screening ${selectedMatch.team_a} vs ${selectedMatch.team_b}`
            : isLoggedIn
            ? `Tag as screening ${selectedMatch.team_a} vs ${selectedMatch.team_b}`
            : "Log in to tag this screening"}
        </button>
      )}
    </div>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" className="text-amber-400">
      <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z" />
    </svg>
  );
}
