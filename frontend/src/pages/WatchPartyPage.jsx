import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import BarCard from "../components/BarCard";
import MapView from "../components/MapView";
import FilterBar from "../components/FilterBar";
import MatchStrip from "../components/MatchStrip";

export default function WatchPartyPage() {
  const { token, username } = useAuth();
  const [bars, setBars] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teamFilter, setTeamFilter] = useState("");
  const [vibeFilter, setVibeFilter] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeBarId, setActiveBarId] = useState(null);
  const [googleSearchLoading, setGoogleSearchLoading] = useState(false);
  const [googleSearchMsg, setGoogleSearchMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMatches().then(setMatches).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .getBars({ team: teamFilter || undefined, vibe: vibeFilter || undefined })
      .then(setBars)
      .finally(() => setLoading(false));
  }, [teamFilter, vibeFilter]);

  const allTeams = useMemo(() => {
    const set = new Set();
    bars.forEach((b) => b.team_tag_list?.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [bars]);

  async function handleGoogleSearch() {
    setGoogleSearchLoading(true);
    setGoogleSearchMsg(null);
    try {
      const result = await api.searchGooglePlaces("sports bar Toronto");
      if (result.error) {
        setGoogleSearchMsg(result.error);
      } else {
        setGoogleSearchMsg(`Pulled in ${result.length} live result(s) from Google Places.`);
        const refreshed = await api.getBars({ team: teamFilter || undefined, vibe: vibeFilter || undefined });
        setBars(refreshed);
      }
    } catch {
      setGoogleSearchMsg("Google Places search failed -- showing seed data only.");
    } finally {
      setGoogleSearchLoading(false);
    }
  }

  async function handleTagScreening(barId, matchId) {
    try {
      await api.tagScreening(token, barId, matchId);
      const refreshed = await api.getBars({ team: teamFilter || undefined, vibe: vibeFilter || undefined });
      setBars(refreshed);
    } catch {
      // silent fail is fine for demo; a toast would be the next iteration
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-6">
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-signal">FIFA</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Watch Party Finder</h1>
        <p className="mt-1 text-sm text-chalk/60">
          Toronto's sports bars, mapped for World Cup 2026. Filter by team or vibe, pick a match,
          and tag the spots actually screening it.
        </p>
      </div>

      <div className="mb-4">
        <MatchStrip matches={matches} selectedMatch={selectedMatch} onSelect={setSelectedMatch} />
      </div>

      <div className="mb-4">
        <FilterBar
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          vibeFilter={vibeFilter}
          setVibeFilter={setVibeFilter}
          allTeams={allTeams}
          onGoogleSearch={handleGoogleSearch}
          googleSearchLoading={googleSearchLoading}
        />
        {googleSearchMsg && <p className="mt-2 text-xs text-chalk/50">{googleSearchMsg}</p>}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2 h-[420px] lg:h-[640px]">
          <MapView bars={bars} activeBarId={activeBarId} onMarkerHover={setActiveBarId} />
        </div>

        <div className="lg:col-span-3 grid gap-4 sm:grid-cols-2">
          {loading && <p className="text-sm text-chalk/50 sm:col-span-2">Loading bars…</p>}
          {!loading && bars.length === 0 && (
            <p className="text-sm text-chalk/50 sm:col-span-2">No bars match those filters yet.</p>
          )}
          {bars.map((bar) => (
            <BarCard
              key={bar.id}
              bar={bar}
              selectedMatch={selectedMatch}
              onTagScreening={handleTagScreening}
              isLoggedIn={!!username}
              isActive={bar.id === activeBarId}
              onHover={setActiveBarId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
