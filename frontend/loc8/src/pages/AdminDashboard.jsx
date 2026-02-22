import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import Sidebar from "../components/layout/Sidebar";
import { ParticipantsTable, CreateJudgeWidget, AdminStatsBar } from "../components/admin/AdminWidgets";
import TeamsTab from "../components/admin/TeamsTab";
import AdminOverview from "../components/admin/AdminOverview";
import ShortlistManagement from "../components/admin/ShortlistManagement";
import ScreeningTab from "../components/admin/ScreeningTab";
import { allocatePS, getPublicLeaderboard, checkInScan, mealScan, getAdminTimeline } from "../api";

/* ── Animation variants ── */
const pageTransition = {
  initial: { opacity: 0, y: 20, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -20, filter: "blur(8px)", transition: { duration: 0.3 } },
};

const glassStyle = "backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]";

const sections = {
  overview: "Overview",
  teams: "Teams",
  ppt: "PPT Evaluation",
  screening: "Screening",
  shortlist: "Shortlist",
  qr: "QR Management",
  credentials: "Credential Management",
  allocations: "Allocations",
};

/* Sample timeline data */
const FALLBACK_TIMELINE_EVENTS = [
  { time: "9:00 AM", event: "Registration & Check-in", status: "completed" },
  { time: "10:00 AM", event: "Opening Ceremony", status: "completed" },
  { time: "10:30 AM", event: "Hacking Begins", status: "completed" },
  { time: "1:00 PM", event: "Lunch Break", status: "active" },
  { time: "3:00 PM", event: "Mentor Round 1", status: "upcoming" },
  { time: "6:00 PM", event: "Snack Break", status: "upcoming" },
  { time: "9:00 PM", event: "Mentor Round 2", status: "upcoming" },
  { time: "12:00 AM", event: "Midnight Energiser", status: "upcoming" },
  { time: "6:00 AM", event: "Breakfast", status: "upcoming" },
  { time: "9:00 AM", event: "Final Submissions", status: "upcoming" },
  { time: "10:00 AM", event: "Judging & Demos", status: "upcoming" },
  { time: "12:00 PM", event: "Awards Ceremony", status: "upcoming" },
];

function TimelineSection({ hackathonId }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [events, setEvents] = useState(FALLBACK_TIMELINE_EVENTS);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await getAdminTimeline(hackathonId);
        const timeline = Array.isArray(data) ? data : data?.events || data?.timeline || [];
        if (timeline.length > 0) setEvents(timeline);
      } catch { /* use fallback */ }
    };
    if (hackathonId) fetchTimeline();
  }, [hackathonId]);

  useEffect(() => {
    if (visibleCount < events.length) {
      const t = setTimeout(() => setVisibleCount((c) => c + 1), 120);
      return () => clearTimeout(t);
    }
  }, [visibleCount, events.length]);

  return (
    <motion.div
      className={`rounded-2xl p-6 md:p-8 ${glassStyle}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-white text-lg font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>Event Timeline</h3>
          <p className="text-white/40 text-sm mt-0.5" style={{ fontFamily: "'Fustat', sans-serif" }}>Track every milestone of the hackathon</p>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ fontFamily: "'Fustat', sans-serif" }}>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#B4ED57]" /> Completed</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#4D58D4] animate-pulse" /> Current</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white/20" /> Upcoming</span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#B4ED57] via-[#4D58D4] to-white/10" />
        <div className="space-y-1">
          {events.map((ev, i) => {
            const isCompleted = ev.status === "completed";
            const isActive = ev.status === "active";
            const show = i < visibleCount;
            return (
              <div
                key={i}
                className="relative flex items-start gap-5 pl-10 py-3 transition-all duration-500"
                style={{ opacity: show ? 1 : 0, transform: show ? "translateX(0)" : "translateX(-20px)" }}
              >
                <div className="absolute left-2.5 top-4 z-10">
                  {isActive ? (
                    <span className="relative flex h-[14px] w-[14px]">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4D58D4] opacity-75" />
                      <span className="relative inline-flex rounded-full h-[14px] w-[14px] bg-[#4D58D4] border-2 border-[#111]" />
                    </span>
                  ) : (
                    <span className={`block w-[14px] h-[14px] rounded-full border-2 border-[#111] transition-colors ${isCompleted ? "bg-[#B4ED57]" : "bg-white/20"}`} />
                  )}
                </div>
                <div className={`flex-1 rounded-xl px-5 py-3 border transition-colors ${isActive ? "bg-[#4D58D4]/15 border-[#4D58D4]/40" : isCompleted ? "bg-[#B4ED57]/5 border-[#B4ED57]/15" : "bg-white/[0.02] border-white/5"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold min-w-[72px] ${isActive ? "text-[#4D58D4]" : isCompleted ? "text-[#B4ED57]" : "text-white/30"}`} style={{ fontFamily: "'Questrial', sans-serif" }}>{ev.time}</span>
                      <span className={`text-sm ${isActive ? "text-white font-semibold" : isCompleted ? "text-white/60" : "text-white/40"}`} style={{ fontFamily: "'Fustat', sans-serif" }}>{ev.event}</span>
                    </div>
                    {isCompleted && <span className="text-[#B4ED57] text-xs">{"\u2713"}</span>}
                    {isActive && <span className="text-[10px] font-bold tracking-wider text-[#4D58D4] bg-[#4D58D4]/20 px-2 py-0.5 rounded-full">NOW</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ── PS Allocation Section ── */
function PSAllocationSection({ hackathonId }) {
  const [maxTeams, setMaxTeams] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAllocate = async () => {
    if (!hackathonId) {
      setError("No hackathon selected");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await allocatePS(hackathonId, maxTeams);
      setResult(data);
    } catch (err) {
      setError(err.message || "Allocation failed");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-2xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-white font-bold text-xl mb-1" style={{ fontFamily: "'Questrial', sans-serif" }}>Problem Statement Allocation</h3>
        <p className="text-white/40 text-sm mb-6" style={{ fontFamily: "'Fustat', sans-serif" }}>
          Automatically allocate problem statements to teams based on their preferences.
        </p>

        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1 max-w-xs">
            <label className="text-white/40 text-xs uppercase tracking-widest font-bold mb-2 block" style={{ fontFamily: "'Fustat', sans-serif" }}>
              Max Teams Per Domain
            </label>
            <input
              type="number"
              min={1}
              value={maxTeams}
              onChange={(e) => setMaxTeams(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none text-sm"
              style={{ fontFamily: "'Fustat', sans-serif" }}
            />
          </div>
          <motion.button
            onClick={handleAllocate}
            disabled={loading}
            className="px-6 py-3 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all disabled:opacity-50"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? "⏳ Allocating..." : "📦 Run Allocation"}
          </motion.button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-sm font-bold">❌ {error}</p>
          </div>
        )}

        {result && (
          <motion.div
            className="bg-[#B4ED57]/5 border border-[#B4ED57]/20 rounded-xl p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[#B4ED57] font-bold text-sm mb-2">✓ Allocation Complete</p>
            <pre className="text-white/60 text-xs whitespace-pre-wrap font-mono bg-black/20 rounded-lg p-4 max-h-64 overflow-y-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

/* ── Shortlist Leaderboard Section (Admin View) ── */
function ShortlistLeaderboardSection() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPublicLeaderboard();
        const list = Array.isArray(data) ? data : data.entries || data.leaderboard || [];
        setEntries(list);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-12 text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-white/40">Loading shortlist...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-12 text-center">
        <p className="text-5xl mb-4">📋</p>
        <h3 className="text-white font-bold text-xl mb-2" style={{ fontFamily: "'Questrial', sans-serif" }}>No Shortlist Data</h3>
        <p className="text-white/40 text-sm">Publish the leaderboard from the Screening tab to see results here.</p>
      </div>
    );
  }

  const shortlisted = entries.filter((e) => e.status !== "ELIMINATED");
  const eliminated = entries.filter((e) => e.status === "ELIMINATED");

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div className="bg-[#B4ED57]/10 border border-[#B4ED57]/20 rounded-2xl p-5 text-center" whileHover={{ scale: 1.02 }}>
          <p className="text-[#B4ED57] text-3xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{shortlisted.length}</p>
          <p className="text-white/40 text-xs mt-1" style={{ fontFamily: "'Fustat', sans-serif" }}>Shortlisted</p>
        </motion.div>
        <motion.div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center" whileHover={{ scale: 1.02 }}>
          <p className="text-red-400 text-3xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{eliminated.length}</p>
          <p className="text-white/40 text-xs mt-1" style={{ fontFamily: "'Fustat', sans-serif" }}>Eliminated</p>
        </motion.div>
        <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center" whileHover={{ scale: 1.02 }}>
          <p className="text-white text-3xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{entries.length}</p>
          <p className="text-white/40 text-xs mt-1" style={{ fontFamily: "'Fustat', sans-serif" }}>Total Entries</p>
        </motion.div>
      </div>

      {/* Shortlisted teams */}
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h3 className="text-white font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>Published Leaderboard</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-5 py-3 text-left text-white/30 text-xs uppercase tracking-wider font-bold">Rank</th>
              <th className="px-5 py-3 text-left text-white/30 text-xs uppercase tracking-wider font-bold">Team</th>
              <th className="px-5 py-3 text-left text-white/30 text-xs uppercase tracking-wider font-bold">Score</th>
              <th className="px-5 py-3 text-left text-white/30 text-xs uppercase tracking-wider font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.id || i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3">
                  <span className={`inline-flex w-7 h-7 rounded-lg items-center justify-center text-xs font-bold ${i < 3 ? "bg-[#B4ED57]/10 text-[#B4ED57]" : "bg-white/5 text-white/30"}`}>{i + 1}</span>
                </td>
                <td className="px-5 py-3 text-white font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>{e.teamName}</td>
                <td className="px-5 py-3 text-white font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{e.finalScore != null ? Math.round(e.finalScore) : "—"}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    e.status === "ELIMINATED" ? "bg-red-500/10 text-red-400" : "bg-[#B4ED57]/10 text-[#B4ED57]"
                  }`}>{e.status || "SHORTLISTED"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── QR Management Section ── */
function QRManagementSection() {
  const [qrTab, setQrTab] = useState("food");
  const [qrInput, setQrInput] = useState("");
  const [mealType, setMealType] = useState("lunch");
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  const handleScan = async () => {
    if (!qrInput.trim()) return;
    setScanning(true);
    setScanResult(null);
    setScanError("");
    try {
      let data;
      if (qrTab === "food") {
        data = await mealScan(qrInput.trim(), mealType);
      } else {
        data = await checkInScan(qrInput.trim());
      }
      setScanResult(data);
      setScanHistory((prev) => [
        { qr: qrInput.trim(), type: qrTab === "food" ? `Meal (${mealType})` : "Entry", time: new Date().toLocaleTimeString(), success: true },
        ...prev.slice(0, 19),
      ]);
      setQrInput("");
    } catch (err) {
      setScanError(err.message || "Scan failed");
      setScanHistory((prev) => [
        { qr: qrInput.trim(), type: qrTab === "food" ? `Meal (${mealType})` : "Entry", time: new Date().toLocaleTimeString(), success: false },
        ...prev.slice(0, 19),
      ]);
    }
    setScanning(false);
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-2">
        {["food", "entry"].map((tab) => (
          <motion.button
            key={tab}
            onClick={() => { setQrTab(tab); setScanResult(null); setScanError(""); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${qrTab === tab
                ? "bg-[#B4ED57] text-black shadow-lg shadow-[#B4ED57]/20"
                : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
              }`}
          >
            {tab === "food" ? "🍽  Food" : "🚪  Entry"}
          </motion.button>
        ))}
      </div>

      {/* Scanner */}
      <motion.div
        className={`rounded-2xl p-8 ${glassStyle}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-white font-bold text-xl mb-2" style={{ fontFamily: "'Questrial', sans-serif" }}>
          {qrTab === "food" ? "🍽 Food QR Scanner" : "🚪 Entry QR Scanner"}
        </h3>
        <p className="text-white/40 text-sm mb-6" style={{ fontFamily: "'Fustat', sans-serif" }}>
          {qrTab === "food" ? "Scan meal QR codes or enter QR data manually" : "Scan entry QR codes for venue check-in"}
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            placeholder="Paste QR data or scan..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#B4ED57]/50"
          />
          {qrTab === "food" && (
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          )}
          <motion.button
            onClick={handleScan}
            disabled={scanning || !qrInput.trim()}
            className="px-6 py-3 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl disabled:opacity-50"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {scanning ? "⏳ Scanning..." : "📷 Scan"}
          </motion.button>
        </div>

        {scanError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-sm font-bold">❌ {scanError}</p>
          </div>
        )}

        {scanResult && (
          <motion.div
            className="bg-[#B4ED57]/10 border border-[#B4ED57]/20 rounded-xl p-5 mb-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-[#B4ED57] font-bold text-sm mb-2">✓ {scanResult.message || "Scan Successful"}</p>
            {scanResult.participant && (
              <p className="text-white/60 text-sm">Participant: <span className="text-white font-bold">{scanResult.participant}</span></p>
            )}
            {scanResult.mealType && (
              <p className="text-white/60 text-sm">Meal: <span className="text-white">{scanResult.mealType}</span></p>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <motion.div
          className={`rounded-2xl p-6 ${glassStyle}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h4 className="text-white font-bold text-sm mb-4" style={{ fontFamily: "'Questrial', sans-serif" }}>Recent Scans</h4>
          <div className="space-y-2">
            {scanHistory.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${s.success ? "bg-[#B4ED57]" : "bg-red-400"}`} />
                  <span className="text-white/60 text-xs font-mono truncate max-w-[200px]">{s.qr}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white/30 text-xs">{s.type}</span>
                  <span className="text-white/20 text-xs">{s.time}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { currentUser, selectedHackathon } = useApp();
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} variant="admin" />

      <main className="flex-1 ml-16 p-6" style={{ fontFamily: "'Fustat', sans-serif" }}>
        {/* Header — hidden on tabs that have their own styled header */}
        {activeSection !== "overview" && activeSection !== "teams" && activeSection !== "credentials" && (
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <motion.h1
                className="text-white text-2xl font-black"
                style={{ fontFamily: "'Questrial', sans-serif" }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                key={activeSection}
              >
                {sections[activeSection]}
              </motion.h1>
              <p className="text-white/40 text-sm mt-0.5">
                {selectedHackathon?.name || "HackOS 2026"} {"\u00b7"} Admin Panel
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.div
                className="flex items-center gap-1.5 text-[#B4ED57] text-xs bg-[#B4ED57]/10 border border-[#B4ED57]/20 px-3 py-1.5 rounded-full backdrop-blur-md"
                animate={{ boxShadow: ["0 0 0px rgba(180,237,87,0)", "0 0 12px rgba(180,237,87,0.3)", "0 0 0px rgba(180,237,87,0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="w-1.5 h-1.5 bg-[#B4ED57] rounded-full animate-pulse" />
                LIVE
              </motion.div>
              <motion.div
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4D58D4] to-[#B4ED57] flex items-center justify-center text-white font-black text-sm"
                style={{ fontFamily: "'Questrial', sans-serif" }}
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                {currentUser?.name?.[0] || "A"}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Content with page transitions */}
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} {...pageTransition}>
            {activeSection === "overview" && <AdminOverview />}

            {activeSection === "teams" && <TeamsTab />}

        {activeSection === "ppt" && <ShortlistManagement />}

            {activeSection === "screening" && <ScreeningTab />}

            {activeSection === "shortlist" && <ShortlistLeaderboardSection />}

            {activeSection === "qr" && (
              <QRManagementSection />
            )}

            {activeSection === "credentials" && <CreateJudgeWidget />}

            {activeSection === "allocations" && (
              <PSAllocationSection hackathonId={selectedHackathon?.id} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}