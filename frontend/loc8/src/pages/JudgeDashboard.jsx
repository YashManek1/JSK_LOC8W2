import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { useApp } from "../context/AppContext";
import Sidebar from "../components/layout/Sidebar";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

/* ── Animation variants (matching AdminDashboard) ────────────────── */
const pageTransition = {
  initial: { opacity: 0, y: 20, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -20, filter: "blur(8px)", transition: { duration: 0.3 } },
};

const glassStyle = "backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]";

const staggerContainer = { animate: { transition: { staggerChildren: 0.08 } } };
const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/* ── Hardcoded data ──────────────────────────────────────────────── */
const ASSIGNED_TEAMS = [
  { id: "t1", name: "404 Found", project: "HealthTrack ML", track: "AI/ML", members: ["Aarav P.", "Sneha G.", "Rohan J.", "Meera N."], status: "submitted", scores: { innovation: 0, feasibility: 0, techDepth: 0, clarity: 0, impact: 0 } },
  { id: "t2", name: "ChainHackers", project: "DefiVault", track: "Web3", members: ["Vikram S.", "Priya R.", "Arjun M."], status: "submitted", scores: { innovation: 0, feasibility: 0, techDepth: 0, clarity: 0, impact: 0 } },
  { id: "t3", name: "IoTSquad", project: "SmartHome Hub", track: "IoT", members: ["Kavya S.", "Dev K.", "Riya D.", "Aditya R."], status: "pending", scores: { innovation: 0, feasibility: 0, techDepth: 0, clarity: 0, impact: 0 } },
  { id: "t4", name: "MetaMinds", project: "EduVerse AR", track: "EdTech", members: ["Ananya I.", "Karthik M.", "Tanvi S."], status: "submitted", scores: { innovation: 0, feasibility: 0, techDepth: 0, clarity: 0, impact: 0 } },
  { id: "t5", name: "FarmTech", project: "AgriSense", track: "AI/ML", members: ["Rajesh K.", "Pooja V.", "Siddharth N.", "Ishaan K."], status: "submitted", scores: { innovation: 0, feasibility: 0, techDepth: 0, clarity: 0, impact: 0 } },
  { id: "t6", name: "SyntaxError", project: "CodeBuddy AI", track: "AI/ML", members: ["Varun S.", "Divya P.", "Rahul M.", "Kriti S."], status: "submitted", scores: { innovation: 0, feasibility: 0, techDepth: 0, clarity: 0, impact: 0 } },
];

const CRITERIA = [
  { key: "innovation", label: "Innovation", max: 20 },
  { key: "feasibility", label: "Feasibility", max: 20 },
  { key: "techDepth", label: "Technical Depth", max: 25 },
  { key: "clarity", label: "Presentation & Clarity", max: 20 },
  { key: "impact", label: "Impact", max: 15 },
];

const CANDIDATES = [
  { id: "c1", name: "Aarav Patel", team: "404 Found", role: "ML Engineer", skills: ["Python", "TensorFlow", "FastAPI"], rating: 4.5, shortlisted: false },
  { id: "c2", name: "Priya Reddy", team: "ChainHackers", role: "Smart Contract Dev", skills: ["Solidity", "Hardhat", "ethers.js"], rating: 4.2, shortlisted: false },
  { id: "c3", name: "Varun Shetty", team: "SyntaxError", role: "Full-Stack Dev", skills: ["TypeScript", "LangChain", "React"], rating: 4.8, shortlisted: true },
  { id: "c4", name: "Ananya Iyer", team: "MetaMinds", role: "AR/VR Developer", skills: ["Unity", "ARCore", "Flutter"], rating: 4.3, shortlisted: false },
  { id: "c5", name: "Siddharth Nair", team: "FarmTech", role: "Backend Engineer", skills: ["Python", "AWS", "MongoDB"], rating: 4.1, shortlisted: false },
];

const totalScore = (s) => s.innovation + s.feasibility + s.techDepth + s.clarity + s.impact;

/* ── Animated Counter (matches AdminOverview) ─────────────────────── */
function AnimatedCounter({ value, className, style }) {
  const ref = useRef(null);
  const numVal = parseInt(value) || 0;

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { innerText: 0 }, {
      innerText: numVal,
      duration: 1.8,
      ease: "power2.out",
      snap: { innerText: 1 },
      delay: 0.3,
    });
  }, [numVal]);

  return <div ref={ref} className={className} style={style}>0</div>;
}

/* ── Score Slider (Glowing progress bar) ──────────────────────────── */
function ScoreSlider({ label, value, max, onChange }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const sliderRef = useRef(null);

  return (
    <div className="rounded-2xl bg-[#111118] border border-white/[0.06] p-4">
      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/80 text-sm font-semibold tracking-wide" style={{ fontFamily: "'Questrial', sans-serif" }}>{label}</span>
        <span className="text-[#B4ED57] text-xl font-black tabular-nums">{value}<span className="text-white/25 text-sm font-medium">/{max}</span></span>
      </div>

      {/* Custom progress bar track */}
      <div className="relative h-3 rounded-full bg-white/[0.06]">
        {/* Filled track with glow */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-200 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, #4D58D4, #6ddf3a, #B4ED57)`,
            boxShadow: pct > 0 ? `0 0 12px rgba(180,237,87,0.4), 0 0 24px rgba(180,237,87,0.15)` : 'none',
          }}
        />
        {/* Glowing thumb indicator */}
        {pct > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-[#B4ED57] pointer-events-none transition-all duration-200 ease-out"
            style={{
              left: `calc(${pct}% - 10px)`,
              background: `radial-gradient(circle, #B4ED57 30%, rgba(180,237,87,0.3) 70%)`,
              boxShadow: `0 0 10px rgba(180,237,87,0.6), 0 0 20px rgba(180,237,87,0.3), 0 0 40px rgba(180,237,87,0.1)`,
            }}
          />
        )}

        {/* Hidden native range input overlaid for interaction */}
        <input
          ref={sliderRef}
          type="range"
          min={0}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: '20px', top: '-4px' }}
        />
      </div>
    </div>
  );
}

/* ── Countdown Timer Widget ───────────────────────────────────────── */
function CountdownTimer() {
  /* Deadline: 6 hours from first render (simulated) */
  const [deadline] = useState(() => Date.now() + 6 * 60 * 60 * 1000);
  const [diff, setDiff] = useState(deadline - Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      const rem = Math.max(0, deadline - Date.now());
      setDiff(rem);
      if (rem <= 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [deadline]);

  const hrs = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

  return (
    <motion.div
      className="bg-[#4D58D4] rounded-2xl p-5 relative overflow-hidden group"
      variants={{
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
      }}
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <svg className="w-7 h-7 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Deadline</span>
        </div>
        {/* Timer digits */}
        <div className="flex items-baseline gap-1 mb-1">
          <motion.span
            className="text-white text-4xl font-black tracking-wider"
            style={{ fontFamily: "'Questrial', sans-serif" }}
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {hrs}:{mins}:{secs}
          </motion.span>
        </div>
        <div className="text-white/50 text-sm mt-1 mb-3">Evaluation Closes</div>
        {/* Urgency bar */}
        <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-white/40"
            initial={{ width: "100%" }}
            animate={{ width: `${Math.max(0, (diff / (6 * 60 * 60 * 1000)) * 100)}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-white/40">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" />
            Live
          </span>
          <span>6h window</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  ROLE CONFIRMATION SCREEN                                          */
/* ═══════════════════════════════════════════════════════════════════ */
function RoleConfirmation({ onConfirm }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className={`rounded-2xl p-8 text-center ${glassStyle}`}>
          {/* Logo */}
          <motion.div
            className="flex items-center justify-center gap-2 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#B4ED57] flex items-center justify-center">
              <span className="text-black font-black text-base">H</span>
            </div>
            <span className="text-white font-black tracking-widest text-lg" style={{ fontFamily: "'Questrial', sans-serif" }}>HACKOS</span>
          </motion.div>

          {/* Icon */}
          <motion.div
            className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#4D58D4]/15 border border-[#4D58D4]/30 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <motion.span
              className="text-3xl"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >⚖️</motion.span>
          </motion.div>

          <motion.h2
            className="text-white text-xl font-bold mb-2"
            style={{ fontFamily: "'Questrial', sans-serif" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Welcome, Judge!
          </motion.h2>
          <motion.p
            className="text-white/40 text-sm mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Before we proceed, we need to confirm your role.<br />
            Are you also <span className="text-[#B4ED57] font-semibold">sponsoring</span> this event?
          </motion.p>

          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={() => onConfirm(true)}
              className="w-full py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#B4ED57]/20"
              whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(180,237,87,0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              <span>💼</span> Yes, I'm also a Sponsor
            </motion.button>
            <motion.button
              onClick={() => onConfirm(false)}
              className={`w-full py-3.5 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${glassStyle}`}
              whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.98 }}
            >
              <span>⚖️</span> No, Judge only
            </motion.button>
          </motion.div>

          <motion.p
            className="text-white/25 text-xs mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Sponsors get access to the Recruitment tab for scouting talent.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                    */
/* ═══════════════════════════════════════════════════════════════════ */
export default function JudgeDashboard() {
  const { currentUser, selectedHackathon, logout } = useApp();

  /* Role confirmation state */
  const [roleConfirmed, setRoleConfirmed] = useState(false);
  const [isSponsor, setIsSponsor] = useState(false);

  /* Dashboard state */
  const [activeSection, setActiveSection] = useState("dashboard");
  const [teams, setTeams] = useState(ASSIGNED_TEAMS);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [saved, setSaved] = useState({});
  const [notes, setNotes] = useState({});
  const [candidates, setCandidates] = useState(CANDIDATES);

  const handleRoleConfirm = (sponsor) => {
    setIsSponsor(sponsor);
    setRoleConfirmed(true);
  };

  /* ── Show role confirmation first ── */
  if (!roleConfirmed) {
    return <RoleConfirmation onConfirm={handleRoleConfirm} />;
  }

  const updateScore = (teamId, key, value) => {
    setTeams((prev) => prev.map((t) => t.id === teamId ? { ...t, scores: { ...t.scores, [key]: value } } : t));
  };

  const saveScores = (teamId) => {
    setSaved((prev) => ({ ...prev, [teamId]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [teamId]: false })), 2000);
  };

  const updateNote = (teamId, text) => {
    setNotes((prev) => ({ ...prev, [teamId]: text }));
  };

  const toggleShortlist = (candidateId) => {
    setCandidates((prev) => prev.map((c) => c.id === candidateId ? { ...c, shortlisted: !c.shortlisted } : c));
  };

  const scored = teams.filter((t) => totalScore(t.scores) > 0);
  const ranked = [...scored].sort((a, b) => totalScore(b.scores) - totalScore(a.scores));

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} variant="judge" showRecruitment={isSponsor} />

      <main className="flex-1 ml-16 p-6" style={{ fontFamily: "'Fustat', sans-serif" }}>
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <motion.h1
              className="text-white text-4xl font-black"
              style={{ fontFamily: "'Questrial', sans-serif" }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              key={activeSection}
            >
              {activeSection === "dashboard" && <>Judge{" "}<motion.span className="text-[#B4ED57] italic text-[2.6rem]" style={{ fontFamily: "'Pixelify Sans', cursive" }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>Dashboard</motion.span></>}
              {activeSection === "assignedTeams" && <>Assigned{" "}<motion.span className="text-[#B4ED57] italic text-[2.6rem]" style={{ fontFamily: "'Pixelify Sans', cursive" }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>Teams</motion.span></>}
              {activeSection === "notes" && <motion.span className="text-[#B4ED57] italic text-[2.6rem]" style={{ fontFamily: "'Pixelify Sans', cursive" }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>Notes</motion.span>}
              {activeSection === "leaderboard" && <motion.span className="text-[#B4ED57] italic text-[2.6rem]" style={{ fontFamily: "'Pixelify Sans', cursive" }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>Leaderboard</motion.span>}
              {activeSection === "recruitment" && <>Recruitment{" "}<motion.span className="text-[#B4ED57] italic text-[2.6rem]" style={{ fontFamily: "'Pixelify Sans', cursive" }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>Panel</motion.span></>}
              {activeSection === "settings" && <>Profile &{" "}<motion.span className="text-[#B4ED57] italic text-[2.6rem]" style={{ fontFamily: "'Pixelify Sans', cursive" }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>Settings</motion.span></>}
            </motion.h1>
            <p className="text-white/40 text-sm mt-0.5">
              {selectedHackathon?.name || "HackOS 2026"} ·{" "}
              <span className="text-[#B4ED57]">{currentUser?.name || "Judge"}</span>
              {isSponsor && <span className="text-[#4D58D4] ml-1">· Sponsor</span>}
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
              {currentUser?.name?.[0] || "J"}
            </motion.div>
          </div>
        </motion.div>

        {/* Content with page transitions */}
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} {...pageTransition}>

        {/* ═══════════ DASHBOARD ═══════════ */}
        {activeSection === "dashboard" && (
          <div className="space-y-6">
            {/* Stats cards */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Card 1 — Teams Assigned */}
              <motion.div
                className="rounded-2xl p-5 relative overflow-hidden group"
                style={{ background: "linear-gradient(135deg, rgba(77,88,212,0.15) 0%, rgba(77,88,212,0.05) 100%)", border: "1px solid rgba(77,88,212,0.25)" }}
                variants={staggerItem}
                whileHover={{ scale: 1.03, borderColor: "rgba(77,88,212,0.5)", boxShadow: "0 12px 40px rgba(77,88,212,0.2)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-br from-[#4D58D4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#4D58D4]/20 border border-[#4D58D4]/30 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4D58D4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#4D58D4]/15 text-[#8B93F0] border border-[#4D58D4]/25">
                      TEAMS
                    </span>
                  </div>
                  <AnimatedCounter value={teams.length} className="text-white text-4xl font-black mb-1" style={{ fontFamily: "'Questrial', sans-serif" }} />
                  <p className="text-white/40 text-xs">Teams assigned to you</p>
                </div>
              </motion.div>

              {/* Card 2 — Evaluations Done */}
              <motion.div
                className="rounded-2xl p-5 relative overflow-hidden group"
                style={{ background: "linear-gradient(135deg, rgba(180,237,87,0.12) 0%, rgba(180,237,87,0.03) 100%)", border: "1px solid rgba(180,237,87,0.2)" }}
                variants={staggerItem}
                whileHover={{ scale: 1.03, borderColor: "rgba(180,237,87,0.45)", boxShadow: "0 12px 40px rgba(180,237,87,0.15)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-br from-[#B4ED57]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#B4ED57]/15 border border-[#B4ED57]/25 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B4ED57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#B4ED57]/12 text-[#B4ED57] border border-[#B4ED57]/20">
                      SCORED
                    </span>
                  </div>
                  <AnimatedCounter value={scored.length} className="text-white text-4xl font-black mb-1" style={{ fontFamily: "'Questrial', sans-serif" }} />
                  <p className="text-white/40 text-xs">Evaluations completed</p>
                </div>
              </motion.div>

              {/* Card 3 — Pending Reviews */}
              <motion.div
                className="rounded-2xl p-5 relative overflow-hidden group"
                style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(251,191,36,0.03) 100%)", border: "1px solid rgba(251,191,36,0.2)" }}
                variants={staggerItem}
                whileHover={{ scale: 1.03, borderColor: "rgba(251,191,36,0.45)", boxShadow: "0 12px 40px rgba(251,191,36,0.15)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-br from-[#FBBF24]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/15 border border-[#FBBF24]/25 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FBBF24]/12 text-[#FBBF24] border border-[#FBBF24]/20">
                      PENDING
                    </span>
                  </div>
                  <AnimatedCounter value={teams.length - scored.length} className="text-white text-4xl font-black mb-1" style={{ fontFamily: "'Questrial', sans-serif" }} />
                  <p className="text-white/40 text-xs">Reviews awaiting scores</p>
                </div>
              </motion.div>

              {/* Card 4 — Average Score */}
              <motion.div
                className="rounded-2xl p-5 relative overflow-hidden group"
                style={{ background: "linear-gradient(135deg, rgba(139,93,246,0.12) 0%, rgba(139,93,246,0.03) 100%)", border: "1px solid rgba(139,93,246,0.2)" }}
                variants={staggerItem}
                whileHover={{ scale: 1.03, borderColor: "rgba(139,93,246,0.45)", boxShadow: "0 12px 40px rgba(139,93,246,0.15)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-br from-[#8B5DF6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#8B5DF6]/15 border border-[#8B5DF6]/25 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5DF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#8B5DF6]/12 text-[#A78BFA] border border-[#8B5DF6]/20">
                      AVG SCORE
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <AnimatedCounter value={scored.length > 0 ? Math.round(scored.reduce((s, t) => s + totalScore(t.scores), 0) / scored.length) : 0} className="text-white text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }} />
                    <span className="text-white/25 text-sm font-medium">/100</span>
                  </div>
                  <p className="text-white/40 text-xs">Average across evaluations</p>
                </div>
              </motion.div>
            </motion.div>
            {/* ── Visualization Widgets (admin-style colored cards) ── */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* ── 1. Evaluation Progress Bar ── */}
              <motion.div
                className="bg-[#B4ED57] rounded-2xl p-5 relative overflow-hidden group"
                variants={staggerItem}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <svg className="w-7 h-7 text-black/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <path d="M22 4L12 14.01 9 11.01" />
                    </svg>
                    <span className="text-black/50 text-[10px] font-bold uppercase tracking-widest">Progress</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <AnimatedCounter value={scored.length} className="text-black text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }} />
                    <span className="text-black/40 text-lg font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>/ {teams.length}</span>
                  </div>
                  <div className="text-black/50 text-sm mb-3">Evaluations Completed</div>
                  {/* Progress bar */}
                  <div className="w-full h-3 bg-black/15 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-black/30"
                      initial={{ width: 0 }}
                      animate={{ width: `${teams.length > 0 ? (scored.length / teams.length) * 100 : 0}%` }}
                      transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-xs text-black/40">
                    <span>{teams.length > 0 ? Math.round((scored.length / teams.length) * 100) : 0}% done</span>
                    <span>{teams.length - scored.length} remaining</span>
                  </div>
                </div>
              </motion.div>

                  {/* ── 2. Countdown Timer ── */}
                  <CountdownTimer />

                  {/* ── 3. Score Average Card ── */}
                  <motion.div
                    className="rounded-2xl p-5 relative overflow-hidden group bg-[#4D58D4]/8 border border-[#4D58D4]/25 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                    variants={staggerItem}
                    whileHover={{ scale: 1.03, y: -5, borderColor: "rgba(180,237,87,0.3)", boxShadow: "0 12px 40px rgba(77,88,212,0.15)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <svg className="w-7 h-7 text-[#B4ED57]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <motion.span
                          className="text-[#B4ED57] text-xs font-medium flex items-center gap-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                        >
                          <span>↑</span> trending
                        </motion.span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <AnimatedCounter
                          value={scored.length > 0 ? Math.round(scored.reduce((s, t) => s + totalScore(t.scores), 0) / scored.length) : 0}
                          className="text-white text-4xl font-black"
                          style={{ fontFamily: "'Questrial', sans-serif" }}
                        />
                        <span className="text-white/30 text-lg" style={{ fontFamily: "'Questrial', sans-serif" }}>/100</span>
                      </div>
                      <div className="text-white/40 text-sm mt-1 mb-3">Avg Score</div>
                      {/* Mini breakdown */}
                      <div className="grid grid-cols-5 gap-1">
                        {CRITERIA.map((c) => {
                          const avg = scored.length > 0 ? Math.round(scored.reduce((s, t) => s + t.scores[c.key], 0) / scored.length) : 0;
                          return (
                            <div key={c.key} className="text-center">
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-1">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-[#4D58D4] to-[#B4ED57]"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${c.max > 0 ? (avg / c.max) * 100 : 0}%` }}
                                  transition={{ duration: 1, delay: 0.8 }}
                                />
                              </div>
                              <span className="text-white/25 text-[9px]">{c.label.split(" ")[0]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
                {/* Quick overview of teams */}
                <motion.div
                  className="rounded-2xl p-6 bg-[#4D58D4]/8 border border-[#4D58D4]/25 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  whileHover={{ borderColor: "rgba(180,237,87,0.3)", boxShadow: "0 12px 40px rgba(77,88,212,0.15)" }}
                >
                  <h3 className="text-white font-bold mb-4" style={{ fontFamily: "'Questrial', sans-serif" }}>Recent Teams</h3>
                  <div className="space-y-2">
                    {teams.slice(0, 4).map((t, i) => (
                      <motion.div
                        key={t.id}
                        className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.08 }}
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                      >
                        <div>
                          <span className="text-white text-sm font-semibold">{t.name}</span>
                          <span className="text-white/30 text-xs ml-2">{t.project}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40">{t.track}</span>
                          <span className={`text-sm font-bold ${totalScore(t.scores) > 0 ? "text-[#B4ED57]" : "text-white/20"}`}>
                            {totalScore(t.scores)}/100
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

        {/* ═══════════ ASSIGNED TEAMS ═══════════ */}
        {activeSection === "assignedTeams" && (
          <AnimatePresence mode="wait">
            {selectedTeam ? (() => {
              const team = teams.find((t) => t.id === selectedTeam);
              if (!team) return null;
              return (
                <motion.div
                  key={selectedTeam}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Back button */}
                  <motion.button
                    onClick={() => setSelectedTeam(null)}
                    className="flex items-center gap-2 text-white/50 hover:text-[#B4ED57] text-sm mb-5 transition-colors"
                    whileHover={{ x: -3 }}
                  >
                    <span>←</span> Back to all teams
                  </motion.button>

                  <div className="rounded-3xl p-8 bg-[#111118] border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    {/* Team header */}
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h2 className="text-white text-2xl font-black tracking-tight" style={{ fontFamily: "'Questrial', sans-serif" }}>{team.name}</h2>
                        <p className="text-white/40 text-base mt-1">{team.project} <span className="text-white/20">·</span> <span className="text-[#4D58D4]">{team.track}</span></p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {team.members.map((m) => (
                            <span key={m} className="text-xs bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-xl text-white/50 font-medium">{m}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#B4ED57] text-4xl font-black tabular-nums leading-none">{totalScore(team.scores)}</div>
                        <div className="text-white/20 text-sm font-medium mt-1">out of 100</div>
                      </div>
                    </div>

                    {/* Section label */}
                    <div className="flex items-center gap-3 mb-5">
                      <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest">Scoring Criteria</h3>
                      <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>

                    <div className="space-y-3 mb-8">
                      {CRITERIA.map((c) => (
                        <ScoreSlider key={c.key} label={c.label} max={c.max} value={team.scores[c.key]} onChange={(v) => updateScore(team.id, c.key, v)} />
                      ))}
                    </div>

                    <motion.button
                      onClick={() => saveScores(team.id)}
                      className="w-full py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold text-base rounded-xl transition-all shadow-lg shadow-[#B4ED57]/20"
                      whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(180,237,87,0.3)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {saved[team.id] ? "Saved!" : "Save Scores"}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })() : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                key="team-grid"
              >
                {teams.map((t, i) => {
                  const gradients = [
                    "from-[#B4ED57]/50 via-[#7cb832]/30 to-[#4D58D4]/20",
                    "from-[#4D58D4]/50 via-[#6B74E8]/30 to-[#B4ED57]/20",
                    "from-[#5C6AE0]/50 via-[#4D58D4]/40 to-[#3a42a0]/20",
                    "from-[#8BC34A]/50 via-[#B4ED57]/30 to-[#4D58D4]/20",
                    "from-[#4D58D4]/40 via-[#B4ED57]/30 to-[#6B74E8]/20",
                    "from-[#B4ED57]/40 via-[#4D58D4]/30 to-[#7cb832]/20",
                  ];
                  const grad = gradients[i % gradients.length];
                  return (
                    <motion.div
                      key={t.id}
                      className="rounded-3xl cursor-pointer group"
                      style={{ background: "#111118" }}
                      variants={staggerItem}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedTeam(t.id)}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {/* ── Top: gradient visual area ── */}
                      <div className={`relative h-28 rounded-t-3xl overflow-hidden bg-gradient-to-br ${grad}`}>
                        {/* Blur blobs for organic feel */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/20 blur-2xl" />
                        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-black/30 blur-xl" />
                        {/* Track badge overlaid top-right */}
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10">
                          <span className="text-white text-[11px] font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>{t.track}</span>
                        </div>
                        {/* Project name overlaid */}
                        <div className="absolute top-3 left-4">
                          <h3 className="text-white font-black text-lg leading-tight drop-shadow-lg" style={{ fontFamily: "'Questrial', sans-serif" }}>{t.project}</h3>
                        </div>
                      </div>

                      {/* ── Middle: team info overlay strip ── */}
                      <div className="relative -mt-5 mx-3 rounded-xl p-3.5 backdrop-blur-xl border border-white/[0.08]" style={{ background: "rgba(30,30,42,0.85)" }}>
                        <h4 className="text-white font-bold text-sm" style={{ fontFamily: "'Questrial', sans-serif" }}>{t.name}</h4>
                        <p className="text-white/35 text-xs mt-0.5">{t.project} · {t.track}</p>
                      </div>

                      {/* ── Bottom: stats & members ── */}
                      <div className="px-4 pt-4 pb-4">
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {t.members.map((m) => (
                            <span key={m} className="text-[10px] bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full text-white/40">{m}</span>
                          ))}
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-black ${totalScore(t.scores) > 0 ? "text-[#B4ED57]" : "text-white/15"}`} style={{ fontFamily: "'Questrial', sans-serif" }}>
                              {totalScore(t.scores) > 0 ? String(totalScore(t.scores)).padStart(2, "0") : "—"}
                            </span>
                            <span className="text-white/25 text-xs font-medium">/100</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${t.status === "submitted" ? "bg-[#B4ED57]" : "bg-yellow-400"}`} />
                            <span className="text-white/30 text-[11px] font-medium">{saved[t.id] ? "Evaluated" : t.status === "submitted" ? "Ready" : "Pending"}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ═══════════ NOTES ═══════════ */}
        {activeSection === "notes" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* ── Excalidraw Whiteboard ── */}
            <div
              className="rounded-2xl border-2 border-[#B4ED57]/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl" style={{ borderBottom: "1px solid rgba(180,237,87,0.15)", background: "rgba(77,88,212,0.12)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">✏️</span>
                  <h3 className="text-white font-bold text-sm" style={{ fontFamily: "'Questrial', sans-serif" }}>Whiteboard</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#B4ED57]/10 text-[#B4ED57] border border-[#B4ED57]/20 uppercase tracking-widest">Excalidraw</span>
              </div>
              <div style={{ height: "calc(100vh - 220px)", minHeight: "400px", position: "relative" }} className="rounded-b-2xl">
                <Excalidraw theme="dark" />
              </div>
            </div>
          </motion.div>
        )}

            {/* ═══════════ LEADERBOARD ═══════════ */}
            {activeSection === "leaderboard" && (
              <div className="space-y-6">
                {ranked.length === 0 ? (
                  <motion.div
                    className="rounded-2xl p-6 bg-[#4D58D4]/8 border border-[#4D58D4]/25 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-center py-16">
                      <motion.span
                        className="text-6xl block mb-4"
                        animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >🏆</motion.span>
                      <h3 className="text-white text-xl font-bold mb-2" style={{ fontFamily: "'Questrial', sans-serif" }}>No Rankings Yet</h3>
                      <p className="text-white/40 text-sm">Start evaluating teams to see them climb the leaderboard!</p>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* ── Podium Section ── */}
                    <motion.div
                      className="rounded-3xl p-8 bg-gradient-to-b from-[#4D58D4]/15 via-[#4D58D4]/8 to-transparent border border-[#4D58D4]/20 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden"
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      {/* Background glow effects */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#4D58D4]/10 rounded-full blur-[100px] pointer-events-none" />
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#B4ED57]/5 rounded-full blur-[80px] pointer-events-none" />

                      {/* Podium top 3 */}
                      <div className="relative z-10 flex items-end justify-center gap-4 md:gap-8 pt-4 pb-6 mb-6">
                        {/* 2nd Place - Left */}
                        {ranked.length > 1 && (() => {
                          const t = ranked[1];
                          const score = totalScore(t.scores);
                          return (
                            <motion.div
                              className="flex flex-col items-center"
                              initial={{ opacity: 0, y: 40 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                            >
                              <motion.div
                                className="relative mb-3"
                                whileHover={{ scale: 1.1, y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#C0C0C0] to-[#8a8a8a] flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg shadow-white/10 border-2 border-white/20" style={{ fontFamily: "'Questrial', sans-serif" }}>
                                  {t.name[0]}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#C0C0C0] rounded-full flex items-center justify-center text-xs font-black shadow-md border-2 border-[#0a0a0a]">2</div>
                              </motion.div>
                              <span className="text-white font-bold text-xs md:text-sm text-center max-w-[90px] truncate">{t.name}</span>
                              <span className="text-white/40 text-[10px] md:text-xs mt-0.5">{score} pts</span>
                              {/* Podium bar */}
                              <motion.div
                                className="w-20 md:w-28 h-20 md:h-24 bg-gradient-to-t from-[#4D58D4]/30 to-[#4D58D4]/15 rounded-t-2xl mt-3 border border-b-0 border-[#4D58D4]/30 flex items-center justify-center"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
                              >
                                <span className="text-3xl">🥈</span>
                              </motion.div>
                            </motion.div>
                          );
                        })()}

                        {/* 1st Place - Center (tallest) */}
                        {ranked.length > 0 && (() => {
                          const t = ranked[0];
                          const score = totalScore(t.scores);
                          return (
                            <motion.div
                              className="flex flex-col items-center -mt-4"
                              initial={{ opacity: 0, y: 50 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                            >
                              {/* Crown */}
                              <motion.span
                                className="text-3xl mb-1"
                                animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                              >👑</motion.span>
                              <motion.div
                                className="relative mb-3"
                                whileHover={{ scale: 1.1, y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#B4ED57] to-[#7cb832] flex items-center justify-center text-black font-black text-2xl md:text-3xl shadow-lg shadow-[#B4ED57]/30 border-3 border-[#B4ED57]/50" style={{ fontFamily: "'Questrial', sans-serif" }}>
                                  {t.name[0]}
                                </div>
                                <motion.div
                                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#B4ED57] rounded-full flex items-center justify-center text-sm font-black text-black shadow-md shadow-[#B4ED57]/30 border-2 border-[#0a0a0a]"
                                  animate={{ boxShadow: ["0 0 0px rgba(180,237,87,0)", "0 0 16px rgba(180,237,87,0.5)", "0 0 0px rgba(180,237,87,0)"] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >1</motion.div>
                              </motion.div>
                              <span className="text-white font-bold text-sm md:text-base text-center max-w-[100px] truncate">{t.name}</span>
                              <motion.span
                                className="text-[#B4ED57] font-black text-sm md:text-base mt-0.5"
                                style={{ fontFamily: "'Questrial', sans-serif" }}
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >{score} pts</motion.span>
                              {/* Podium bar */}
                              <motion.div
                                className="w-24 md:w-32 h-28 md:h-36 bg-gradient-to-t from-[#B4ED57]/20 to-[#B4ED57]/8 rounded-t-2xl mt-3 border border-b-0 border-[#B4ED57]/30 flex items-center justify-center relative"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                              >
                                <motion.span
                                  className="text-4xl"
                                  animate={{ scale: [1, 1.15, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >🏆</motion.span>
                              </motion.div>
                            </motion.div>
                          );
                        })()}

                        {/* 3rd Place - Right */}
                        {ranked.length > 2 && (() => {
                          const t = ranked[2];
                          const score = totalScore(t.scores);
                          return (
                            <motion.div
                              className="flex flex-col items-center"
                              initial={{ opacity: 0, y: 40 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                            >
                              <motion.div
                                className="relative mb-3"
                                whileHover={{ scale: 1.1, y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#CD7F32] to-[#8B5A2B] flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg shadow-orange-500/10 border-2 border-orange-400/30" style={{ fontFamily: "'Questrial', sans-serif" }}>
                                  {t.name[0]}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#CD7F32] rounded-full flex items-center justify-center text-xs font-black shadow-md border-2 border-[#0a0a0a]">3</div>
                              </motion.div>
                              <span className="text-white font-bold text-xs md:text-sm text-center max-w-[90px] truncate">{t.name}</span>
                              <span className="text-white/40 text-[10px] md:text-xs mt-0.5">{score} pts</span>
                              {/* Podium bar */}
                              <motion.div
                                className="w-20 md:w-28 h-16 md:h-20 bg-gradient-to-t from-[#CD7F32]/20 to-[#CD7F32]/8 rounded-t-2xl mt-3 border border-b-0 border-[#CD7F32]/25 flex items-center justify-center"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
                              >
                                <span className="text-3xl">🥉</span>
                              </motion.div>
                            </motion.div>
                          );
                        })()}
                      </div>

                      {/* Podium base line */}
                      <div className="relative z-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    </motion.div>

                    {/* ── Full Rankings List ── */}
                    <motion.div
                      className="rounded-2xl p-6 bg-[#4D58D4]/8 border border-[#4D58D4]/25 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Questrial', sans-serif" }}>
                          Full Rankings
                        </h3>
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#B4ED57]/10 text-[#B4ED57] border border-[#B4ED57]/20 uppercase tracking-widest">
                          {ranked.length} scored
                        </span>
                      </div>
                      <motion.div
                        className="space-y-2"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        {ranked.map((t, i) => {
                          const score = totalScore(t.scores);
                          const podiumColors = [
                            "bg-[#B4ED57]/10 border-[#B4ED57]/30",
                            "bg-white/[0.05] border-white/15",
                            "bg-[#CD7F32]/8 border-[#CD7F32]/20",
                          ];
                          const rankBadgeColors = [
                            "bg-[#B4ED57] text-black",
                            "bg-[#C0C0C0] text-black",
                            "bg-[#CD7F32] text-black",
                          ];
                          return (
                            <motion.div
                              key={t.id}
                              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${i < 3 ? podiumColors[i] : "bg-white/[0.02] border-white/[0.06]"}`}
                              variants={staggerItem}
                              whileHover={{ scale: 1.01, backgroundColor: i < 3 ? undefined : "rgba(255,255,255,0.04)" }}
                            >
                              {/* Rank badge */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${i < 3 ? rankBadgeColors[i] : "bg-white/5 text-white/30"}`}>
                                {i + 1}
                              </div>
                              {/* Avatar */}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${i === 0 ? "bg-gradient-to-br from-[#B4ED57] to-[#7cb832] text-black" :
                                  i === 1 ? "bg-gradient-to-br from-[#C0C0C0] to-[#8a8a8a] text-white" :
                                    i === 2 ? "bg-gradient-to-br from-[#CD7F32] to-[#8B5A2B] text-white" :
                                      "bg-[#4D58D4]/20 text-white/60"
                                }`} style={{ fontFamily: "'Questrial', sans-serif" }}>
                                {t.name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-white font-semibold text-sm">{t.name}</span>
                                    <span className="text-white/30 text-xs ml-2 hidden sm:inline">{t.project}</span>
                                  </div>
                                  <span className={`font-black text-lg ml-3 shrink-0 ${i === 0 ? "text-[#B4ED57]" : "text-white/70"}`} style={{ fontFamily: "'Questrial', sans-serif" }}>
                                    {score}<span className="text-white/20 text-sm">/100</span>
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                                  <motion.div
                                    className={`h-full rounded-full ${i === 0 ? "bg-gradient-to-r from-[#B4ED57]/80 to-[#B4ED57]" : i === 1 ? "bg-gradient-to-r from-[#C0C0C0]/60 to-[#C0C0C0]" : i === 2 ? "bg-gradient-to-r from-[#CD7F32]/60 to-[#CD7F32]" : "bg-gradient-to-r from-[#4D58D4] to-[#B4ED57]"}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score}%` }}
                                    transition={{ duration: 0.8, delay: 0.6 + i * 0.1, ease: "easeOut" }}
                                  />
                                </div>
                              </div>
                              <span className="text-xs px-2.5 py-1 bg-white/5 rounded-full text-white/40 shrink-0 hidden sm:block">{t.track}</span>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </motion.div>
                  </>
                )}

                {/* Unscored teams */}
                {teams.length - scored.length > 0 && (
                  <motion.div
                    className="rounded-2xl p-5 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                  >
                    <p className="text-white/30 text-xs mb-3 uppercase tracking-wider">Awaiting Evaluation</p>
                    <div className="space-y-2">
                      {teams.filter((t) => totalScore(t.scores) === 0).map((t, i) => (
                        <motion.div
                          key={t.id}
                          className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 0.5, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.05 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 text-xs font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>{t.name[0]}</div>
                            <span className="text-white text-sm">{t.name} <span className="text-white/30 text-xs">— {t.project}</span></span>
                          </div>
                          <span className="text-white/20 text-sm font-bold">—/100</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ═══════════ RECRUITMENT (sponsor only) ═══════════ */}
            {activeSection === "recruitment" && isSponsor && (
              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div
                  className={`rounded-2xl p-4 flex items-center gap-3 backdrop-blur-xl bg-[#4D58D4]/10 border border-[#4D58D4]/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]`}
                  variants={staggerItem}
                >
                  <motion.span
                    className="text-2xl"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >💼</motion.span>
                  <div>
                    <p className="text-white text-sm font-semibold">Sponsor Recruitment Mode</p>
                    <p className="text-white/40 text-xs">Shortlist promising talent from participating teams.</p>
                  </div>
                </motion.div>

                {candidates.map((c) => (
                  <motion.div
                    key={c.id}
                    className="rounded-2xl p-5 bg-[#4D58D4]/8 border border-[#4D58D4]/25 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                    variants={staggerItem}
                    whileHover={{ scale: 1.01, borderColor: "rgba(180,237,87,0.3)", boxShadow: "0 12px 40px rgba(77,88,212,0.15)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4D58D4] to-[#B4ED57] flex items-center justify-center text-white font-bold text-xs"
                            whileHover={{ scale: 1.1, rotate: 10 }}
                          >{c.name.split(" ").map((n) => n[0]).join("")}</motion.div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">{c.name}</h4>
                            <p className="text-white/40 text-xs">{c.team} · {c.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          {c.skills.map((s) => (
                            <span key={s} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-white/50">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[#B4ED57] text-sm font-bold mb-2">★ {c.rating}</div>
                        <motion.button
                          onClick={() => toggleShortlist(c.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${c.shortlisted
                              ? "bg-[#B4ED57] text-black shadow-lg shadow-[#B4ED57]/20"
                              : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                            }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {c.shortlisted ? "✓ Shortlisted" : "Shortlist"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ═══════════ PROFILE & SETTINGS ═══════════ */}
            {activeSection === "settings" && (
              <motion.div
                className="space-y-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="rounded-2xl p-6 bg-[#4D58D4]/8 border border-[#4D58D4]/25 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                  whileHover={{ borderColor: "rgba(180,237,87,0.3)", boxShadow: "0 12px 40px rgba(77,88,212,0.15)" }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4D58D4] to-[#B4ED57] flex items-center justify-center text-white font-black text-xl"
                      style={{ fontFamily: "'Questrial', sans-serif" }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {currentUser?.name?.[0] || "J"}
                    </motion.div>
                    <div>
                      <h3 className="text-white text-lg font-bold">{currentUser?.name || "Judge"}</h3>
                      <p className="text-white/40 text-sm">{currentUser?.email || "judge@hackos.com"}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#4D58D4]/15 text-[#8B93F0]">Judge</span>
                        {isSponsor && <span className="text-xs px-2 py-0.5 rounded-full bg-[#B4ED57]/15 text-[#B4ED57]">Sponsor</span>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Hackathon</label>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm">{selectedHackathon?.name || "HackOS 2026"}</div>
                    </div>
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Role Access</label>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm">{isSponsor ? "Judge + Sponsor (Recruitment enabled)" : "Judge only"}</div>
                    </div>
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Teams Assigned</label>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm">{teams.length} teams</div>
                    </div>
                  </div>
                </motion.div>

                <motion.button
                  onClick={logout}
                  className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-xl transition-all text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ↩ Logout
                </motion.button>
              </motion.div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}