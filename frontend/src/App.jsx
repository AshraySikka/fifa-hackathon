import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import WatchPartyPage from "./pages/WatchPartyPage";
import PredictorPage from "./pages/PredictorPage";
import RefChatPage from "./pages/RefChatPage";
import AccountPage from "./pages/AccountPage";
import BanterPage from "./pages/BanterPage";
import AccessPage from "./pages/AccessPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<WatchPartyPage />} />
          <Route path="/predictor" element={<PredictorPage />} />
          <Route path="/ref-chat" element={<RefChatPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/banter" element={<BanterPage />} />
          <Route path="/access" element={<AccessPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
