import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import Sidebar from "../components/layout/Sidebar";
import { ParticipantsTable, CreateJudgeWidget, AdminStatsBar } from "../components/admin/AdminWidgets";
import TeamsTab from "../components/admin/TeamsTab";
import AdminOverview from "../components/admin/AdminOverview";

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
  qr: "QR Management",
  credentials: "Credential Management",
  allocations: "Allocations",
};

/* Sample timeline data */
const TIMELINE_EVENTS = [
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

function TimelineSection() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount < TIMELINE_EVENTS.length) {
      const t = setTimeout(() => setVisibleCount((c) => c + 1), 120);
      return () => clearTimeout(t);
    }
  }, [visibleCount]);

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
          {TIMELINE_EVENTS.map((ev, i) => {
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

export default function AdminDashboard() {
  const { currentUser, selectedHackathon } = useApp();
  const [activeSection, setActiveSection] = useState("overview");
  const [qrTab, setQrTab] = useState("food");

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

        {activeSection === "ppt" && (
          <motion.div
            className={`rounded-2xl p-8 text-center ${glassStyle}`}
            whileHover={{ borderColor: "rgba(180,237,87,0.2)" }}
          >
            <motion.span
              className="text-5xl block mb-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >{"\ud83d\udcca"}</motion.span>
            <h3 className="text-white font-bold text-xl mb-2" style={{ fontFamily: "'Questrial', sans-serif" }}>PPT Evaluation</h3>
            <p className="text-white/40 text-sm">Evaluate and score team presentations</p>
          </motion.div>
        )}

        {activeSection === "qr" && (
          <div className="space-y-5">
            {/* Tabs */}
            <div className="flex gap-2">
              {["food", "entry"].map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setQrTab(tab)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    qrTab === tab
                      ? "bg-[#B4ED57] text-black shadow-lg shadow-[#B4ED57]/20"
                      : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab === "food" ? "\ud83c\udf7d  Food" : "\ud83d\udeaa  Entry"}
                </motion.button>
              ))}
            </div>
            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={qrTab}
                className={`rounded-2xl p-8 text-center ${glassStyle}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                whileHover={{ borderColor: "rgba(180,237,87,0.2)" }}
              >
                <motion.span
                  className="text-5xl block mb-4"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >{qrTab === "food" ? "\ud83c\udf7d" : "\ud83d\udeaa"}</motion.span>
                <h3 className="text-white font-bold text-xl mb-2" style={{ fontFamily: "'Questrial', sans-serif" }}>
                  {qrTab === "food" ? "Food QR Management" : "Entry QR Management"}
                </h3>
                <p className="text-white/40 text-sm">
                  {qrTab === "food"
                    ? "Manage meal QR codes for participants"
                    : "Manage entry/exit QR scanning for venue check-in"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {activeSection === "credentials" && <CreateJudgeWidget />}

        {activeSection === "allocations" && (
          <motion.div
            className={`rounded-2xl p-8 text-center ${glassStyle}`}
            whileHover={{ borderColor: "rgba(180,237,87,0.2)" }}
          >
            <motion.span
              className="text-5xl block mb-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >{"\ud83d\udce6"}</motion.span>
            <h3 className="text-white font-bold text-xl mb-2" style={{ fontFamily: "'Questrial', sans-serif" }}>Allocations</h3>
            <p className="text-white/40 text-sm">Manage room, lab & seating allocations for teams</p>
          </motion.div>
        )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}