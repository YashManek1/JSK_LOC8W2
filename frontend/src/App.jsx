import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import EvaluationStatus from "./pages/EvaluationStatus";
import ShortlistSubmit from "./pages/ShortlistSubmit";
import ShortlistResult from "./pages/ShortlistResult";
import AdminDashboard from "./pages/AdminDashboard";
import IdentityVerification from "./pages/IdentityVerification";
import VoiceChat from "./pages/VoiceChat";

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/evaluations/:id" element={<EvaluationStatus />} />
          <Route path="/shortlist/submit" element={<ShortlistSubmit />} />
          <Route path="/shortlist/:id" element={<ShortlistResult />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/verify-identity" element={<IdentityVerification />} />
          <Route path="/voice-chat" element={<VoiceChat />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
