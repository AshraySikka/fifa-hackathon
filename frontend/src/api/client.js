import axios from "axios";

const API_BASE = "http://localhost:8000/api";

// Token is passed in explicitly per-call (kept in React state upstream,
// never in localStorage/sessionStorage per project requirements) rather
// than mutated onto a shared axios instance, so we don't leak a stale
// token across users during the demo.
function authHeaders(token) {
  return token ? { Authorization: `Token ${token}` } : {};
}

export const api = {
  signup: (username, password) =>
    axios.post(`${API_BASE}/auth/signup/`, { username, password }).then((r) => r.data),

  login: (username, password) =>
    axios.post(`${API_BASE}/auth/login/`, { username, password }).then((r) => r.data),

  getBars: (params = {}) =>
    axios.get(`${API_BASE}/bars/`, { params }).then((r) => r.data),

  searchGooglePlaces: (q) =>
    axios.get(`${API_BASE}/bars/search-google/`, { params: { q } }).then((r) => r.data),

  getMatches: () => axios.get(`${API_BASE}/matches/`).then((r) => r.data),

  tagScreening: (token, bar, match) =>
    axios
      .post(`${API_BASE}/screening-tags/`, { bar, match }, { headers: authHeaders(token) })
      .then((r) => r.data),

  refExplain: (question, commentaryContext = "") =>
    axios.post(`${API_BASE}/ref-explain/`, { question, commentary_context: commentaryContext }).then((r) => r.data),

  predictMatch: (team_a, team_b) =>
    axios.post(`${API_BASE}/predict/`, { team_a, team_b }).then((r) => r.data),

  // -- Chant & Banter --
  getNearbyRoom: (lat, lng) =>
    axios.post(`${API_BASE}/chat/nearby-room/`, { lat, lng }).then((r) => r.data),

  createGlobalRoom: () => axios.post(`${API_BASE}/chat/rooms/`).then((r) => r.data),

  getMessages: (code, sinceId) =>
    axios
      .get(`${API_BASE}/chat/rooms/${encodeURIComponent(code)}/messages/`, {
        params: sinceId ? { since: sinceId } : {},
      })
      .then((r) => r.data),

  sendMessage: (code, senderName, text) =>
    axios
      .post(`${API_BASE}/chat/rooms/${encodeURIComponent(code)}/messages/`, {
        sender_name: senderName,
        text,
      })
      .then((r) => r.data),
};
