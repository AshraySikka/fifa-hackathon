# MatchDay TO

FIFA World Cup 2026 (Toronto) hackathon app. Django + DRF backend, React
(Vite + Tailwind) frontend, SQLite, zero external setup required to get a
demo running -- Google Places and Claude are optional live upgrades.

```
matchday-to/
├── backend/          Django + DRF API (SQLite, port 8000)
│   ├── matchday/      project settings/urls
│   ├── core/           models, serializers, views, llm.py, fixtures/
│   └── manage.py
└── frontend/         React + Vite + Tailwind SPA (port 5173)
    └── src/
        ├── api/client.js
        ├── components/  BarCard, MapView, FilterBar, MatchStrip, Navbar
        ├── context/AuthContext.jsx
        ├── data/teams.js       (48 WC2026 teams)
        └── pages/  WatchPartyPage, PredictorPage, RefChatPage, AccountPage
```

## 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py migrate
python manage.py loaddata core/fixtures/bars.json core/fixtures/matches.json

python manage.py runserver        # http://localhost:8000
```

## 2. Frontend setup (new terminal)

```bash
cd frontend
npm install
npm run dev                       # http://localhost:5173
```

Open http://localhost:5173 -- the backend must be running on :8000 for any
of it to work (CORS is pre-configured for that origin).

## 3. API keys (both optional -- everything works without them)

Copy `backend/.env.example` to `backend/.env` and fill in what you have:

```bash
cd backend
cp .env.example .env
```

```
ANTHROPIC_API_KEY=sk-ant-...      # Referee Explainer + Predictor reasoning
GOOGLE_PLACES_API_KEY=AIza...     # "Find more bars via Google Places" button
```

`.env` is auto-loaded via `python-dotenv` (already wired into
`matchday/settings.py`) -- no manual `export` needed, just restart
`runserver` after editing it.

- **No `ANTHROPIC_API_KEY`**: the ref-explainer and predictor still respond,
  with an answer clearly prefixed `[MOCK RESPONSE ...]` instead of crashing.
- **No `GOOGLE_PLACES_API_KEY`**: the map/cards still show all 8 seeded
  Toronto bars; the live-search button returns a friendly inline message
  instead of an error.

The Anthropic key needs `messages` access on the standard `/v1/messages`
endpoint; the Google key needs the **Places API (New)** enabled and billing
turned on for Text Search — Google requires a billing account even within
the free monthly credit.

## 4. Demo user flow

1. `/` (Watch Party Finder) -- filter Toronto bars by team/vibe, pick a
   match from the strip, hover a card to highlight it on the map.
2. `/account` -- sign up (creates a real DRF token, held in React state only,
   not localStorage — refreshing the page logs you out by design).
3. Back on `/`, pick a match and tag a bar as screening it.
4. `/predictor` -- pick two of the 48 teams, get a mock win/draw/loss split
   plus a Claude-generated (or mock) reasoning blurb.
5. `/ref-chat` -- ask a rules question, get a plain-English answer citing
   the specific Law of the Game.

## Notes / known trade-offs (hackathon speed over polish)

- Auth token lives in React state only, per spec -- no persistence across
  reloads. Fine for a demo; swap for httpOnly session cookies before any
  real use.
- `AUTH_PASSWORD_VALIDATORS = []` and `DEBUG = True` in settings.py --
  intentionally relaxed for demo speed, not production-safe.
- `predict_match()` in `core/views.py` is a deterministic hash-based stub,
  not a real model -- swap it out once you have actual data.
- Distance shown on bar cards is calculated from a fixed downtown Toronto
  point (Union Station), not the user's real location, to avoid a
  geolocation permission prompt mid-demo.
