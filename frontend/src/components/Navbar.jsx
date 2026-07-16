import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Watch Parties" },
  { to: "/predictor", label: "Predictor" },
  { to: "/ref-chat", label: "Ref Chat" },
  { to: "/banter", label: "Chant & Banter" },
  { to: "/access", label: "Accessibility" },
];

export default function Navbar() {
  const { username, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-pitch-700/60 bg-pitch-900/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-signal text-pitch-950 font-display font-bold text-sm shadow-floodlight">
            26
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            MatchDay <span className="text-signal">TO</span>
          </span>
        </div>

        <nav className="hidden gap-1 sm:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-signal/15 text-signal"
                    : "text-chalk/70 hover:text-chalk hover:bg-pitch-700/60"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {username ? (
            <>
              <span className="hidden text-sm text-chalk/60 sm:inline">
                Signed in as <span className="text-chalk">{username}</span>
              </span>
              <button
                onClick={logout}
                className="rounded-full border border-pitch-600 px-3 py-1.5 text-sm text-chalk/80 hover:border-flag hover:text-flag transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <NavLink
              to="/account"
              className="rounded-full bg-signal px-4 py-1.5 text-sm font-semibold text-pitch-950 hover:bg-signal-glow transition-colors"
            >
              Log in
            </NavLink>
          )}
        </div>
      </div>

      {/* mobile nav */}
      <nav className="flex gap-1 overflow-x-auto border-t border-pitch-700/60 px-3 py-2 sm:hidden">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                isActive ? "bg-signal/15 text-signal" : "text-chalk/70"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
