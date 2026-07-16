import { createContext, useContext, useState, useCallback } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

// Deliberately in-memory only (React state). No localStorage/sessionStorage,
// per project requirements -- refreshing the page logs you out. Fine for a
// 90-minute demo; swap for httpOnly cookie sessions before shipping.
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [authError, setAuthError] = useState(null);

  const login = useCallback(async (u, p) => {
    setAuthError(null);
    try {
      const data = await api.login(u, p);
      setToken(data.token);
      setUsername(u);
      return true;
    } catch (e) {
      setAuthError(e.response?.data?.non_field_errors?.[0] || "Login failed. Check your username and password.");
      return false;
    }
  }, []);

  const signup = useCallback(async (u, p) => {
    setAuthError(null);
    try {
      const data = await api.signup(u, p);
      setToken(data.token);
      setUsername(data.username);
      return true;
    } catch (e) {
      setAuthError(e.response?.data?.username?.[0] || "Signup failed. Try a different username.");
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, username, authError, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
