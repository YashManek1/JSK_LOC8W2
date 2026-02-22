import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { getAdminOverviewStats } from "../../api";

/* ── Animation variants ── */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.3, ease: "easeOut" } },
};

const glassStyle = "backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]";

/* ═══════════════════════════════════════════════════════════════════ */
/*  DATA                                                               */
/* ═══════════════════════════════════════════════════════════════════ */

const FALLBACK_TIMELINE = [
  { time: "09:00", label: "Registration &\nVerification", status: "completed" },
  { time: "10:30", label: "Opening\nCeremony", status: "completed" },
  { time: "11:00", label: "Hacking\nBegins", status: "completed" },
  { time: "13:00", label: "Lunch Break", status: "active" },
  { time: "18:00", label: "Mentor\nSessions", status: "upcoming" },
  { time: "20:00", label: "Dinner", status: "upcoming" },
  { time: "23:59", label: "PPT Submission\nLock", status: "upcoming" },
];

const FALLBACK_MENTOR_JUDGE_ACTIVITY = [
  { label: "Dr. Priya Sharma", role: "Judge", completed: 22, assigned: 25, color: "#B4ED57" },
  { label: "Rahul Mehra", role: "Judge", completed: 18, assigned: 25, color: "#B4ED57" },
  { label: "Prof. Anand Rao", role: "Mentor", completed: 15, assigned: 20, color: "#4D58D4" },
  { label: "Sneha Iyer", role: "Mentor", completed: 12, assigned: 20, color: "#4D58D4" },
  { label: "Vikram Desai", role: "Judge", completed: 10, assigned: 25, color: "#B4ED57" },
];

const FALLBACK_DONUT_DATA = [
  { label: "Approved", value: 980, pct: "78.4", color: "#B4ED57" },
  { label: "Pending", value: 124, pct: "9.9", color: "#4D58D4" },
  { label: "Rejected", value: 86, pct: "6.9", color: "#f87171" },
  { label: "Flagged", value: 60, pct: "4.8", color: "#f59e0b" },
];

const FALLBACK_MEALS = [
  { name: "Breakfast", consumed: 733, registered: 856, remaining: 123, rate: 84.5, status: "completed" },
  { name: "Lunch", consumed: 613, registered: 856, remaining: 244, rate: 71.5, status: "active" },
  { name: "Dinner", consumed: 0, registered: 856, remaining: 856, rate: 0, status: "upcoming" },
];

/* ═══════════════════════════════════════════════════════════════════ */
/*  DONUT CHART                                                        */
/* ═══════════════════════════════════════════════════════════════════ */

function DonutChart({ data }) {
  const size = 190;
  const sw = 30;
  const r = (size - sw) / 2;
  const C = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);
  const gap = 5;
  let cum = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {data.map((d, i) => {
          const arc = (d.value / total) * C;
          const dash = `${arc - gap} ${C - arc + gap}`;
          const off = -cum;
          cum += arc;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={sw}
              strokeDasharray={dash}
              strokeDashoffset={off}
            />
          );
        })}
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN OVERVIEW                                                      */
/* ═══════════════════════════════════════════════════════════════════ */

/* ── Animated Counter Component ── */
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

export default function AdminOverview() {
  /* live clock */
  const [clock, setClock] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const statsRef = useRef(null);

  /* API-fetched state with fallbacks */
  const [statsData, setStatsData] = useState({ registered: 318, verified: 289, teams: 74, meals: 186, verifiedRate: "92.6", todayNew: 24, rsvpPending: 6, lunchPct: "64" });
  const [timeline, setTimeline] = useState(FALLBACK_TIMELINE);
  const [mentorJudgeActivity, setMentorJudgeActivity] = useState(FALLBACK_MENTOR_JUDGE_ACTIVITY);
  const [donutData, setDonutData] = useState(FALLBACK_DONUT_DATA);
  const [meals, setMeals] = useState(FALLBACK_MEALS);

  /* Fetch overview stats from API */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminOverviewStats();
        if (data && !data.error && !data.statusCode) {
          if (data.stats) {
            setStatsData(prev => ({
              registered: data.stats.registered ?? prev.registered,
              verified: data.stats.verified ?? prev.verified,
              teams: data.stats.teams ?? prev.teams,
              meals: data.stats.mealsServed ?? data.stats.meals ?? prev.meals,
              verifiedRate: data.stats.verifiedRate ?? prev.verifiedRate,
              todayNew: data.stats.todayNew ?? prev.todayNew,
              rsvpPending: data.stats.rsvpPending ?? prev.rsvpPending,
              lunchPct: data.stats.lunchPct ?? prev.lunchPct,
            }));
          }
          if (data.timeline?.length) setTimeline(data.timeline);
          if (data.mentorJudgeActivity?.length) setMentorJudgeActivity(data.mentorJudgeActivity);
          if (data.verification?.length) setDonutData(data.verification);
          if (data.meals?.length) setMeals(data.meals);
        }
      } catch (err) {
        console.warn("Admin overview stats API unavailable, using fallback:", err.message);
      }
    };
    fetchStats();
    // Auto refresh every 30s if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchStats, 30000);
    }
    return () => interval && clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");
  const clockStr = `${pad(clock.getHours())}:${pad(clock.getMinutes())}:${pad(clock.getSeconds())}`;

  /* active timeline index */
  const activeIdx = timeline.findIndex((e) => e.status === "active");

  return (
    <motion.div
      className="space-y-6"
      style={{ fontFamily: "'Fustat', sans-serif" }}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* ────────────────── Header ────────────────── */}
      <motion.div className="flex items-center justify-between" variants={fadeInUp} custom={0}>
        <div>
          <motion.h1
            className="text-white text-3xl font-black"
            style={{ fontFamily: "'Questrial', sans-serif" }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Admin{" "}
            <motion.span
              className="text-[#B4ED57] italic"
              style={{ fontFamily: "'Pixelify Sans', cursive" }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Dashboard
            </motion.span>
          </motion.h1>
          <motion.p
            className="text-white/40 text-sm mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Real-time hackathon monitoring &amp; analytics
          </motion.p>
        </div>
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all backdrop-blur-md ${
              autoRefresh
                ? "border-[#B4ED57] text-[#B4ED57] bg-[#B4ED57]/5"
                : "border-white/20 text-white/40 bg-white/5"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`}
              style={{ animationDuration: "3s" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0115-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 01-15 6.7L3 16" />
            </svg>
            Auto Refresh
          </motion.button>
          <motion.div
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 ${glassStyle}`}
            animate={{ boxShadow: ["0 0 0px rgba(180,237,87,0)", "0 0 15px rgba(180,237,87,0.15)", "0 0 0px rgba(180,237,87,0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="w-2 h-2 bg-[#B4ED57] rounded-full animate-pulse" />
            <span className="text-white font-bold text-sm tracking-wider" style={{ fontFamily: "'Questrial', sans-serif" }}>
              {clockStr}
            </span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ────────────────── Stats Cards ────────────────── */}
      <motion.div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={staggerContainer}>
        {/* Registered */}
        <motion.div
          className="bg-[#B4ED57] rounded-2xl p-5 relative overflow-hidden group"
          variants={fadeInUp}
          custom={1}
          whileHover={{ scale: 1.03, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-5">
              <svg className="w-7 h-7 text-black/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="7" r="4" />
                <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                <circle cx="17" cy="9" r="3" />
                <path d="M21 21v-2a3 3 0 00-3-3h-1" />
              </svg>
              <motion.span
                className="text-black/50 text-xs font-medium flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <span>↑</span> {statsData.todayNew} today
              </motion.span>
            </div>
            <AnimatedCounter value={statsData.registered} className="text-black text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }} />
            <div className="text-black/50 text-sm mt-1">Registered</div>
          </div>
        </motion.div>

        {/* Verified */}
        <motion.div
          className="bg-[#4D58D4] rounded-2xl p-5 relative overflow-hidden group"
          variants={fadeInUp}
          custom={2}
          whileHover={{ scale: 1.03, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-5">
              <svg className="w-7 h-7 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01 9 11.01" />
              </svg>
              <span className="text-white/50 text-xs font-medium">{statsData.verifiedRate}% RATE</span>
            </div>
            <AnimatedCounter value={statsData.verified} className="text-white text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }} />
            <div className="text-white/50 text-sm mt-1">Verified</div>
          </div>
        </motion.div>

        {/* Teams */}
        <motion.div
          className={`rounded-2xl p-5 relative overflow-hidden group ${glassStyle}`}
          variants={fadeInUp}
          custom={3}
          whileHover={{ scale: 1.03, y: -5, borderColor: "rgba(180,237,87,0.3)" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-5">
              <svg className="w-7 h-7 text-[#B4ED57]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
                <path d="M18 2H6v7a6 6 0 0012 0V2z" />
              </svg>
              <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Teams</span>
            </div>
            <AnimatedCounter value={statsData.teams} className="text-white text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }} />
            <div className="text-white/40 text-sm mt-1">{statsData.rsvpPending} RSVP pending</div>
          </div>
        </motion.div>

        {/* Meals */}
        <motion.div
          className={`rounded-2xl p-5 relative overflow-hidden group ${glassStyle}`}
          variants={fadeInUp}
          custom={4}
          whileHover={{ scale: 1.03, y: -5, borderColor: "rgba(77,88,212,0.3)" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-5">
              <svg className="w-7 h-7 text-[#4D58D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
              </svg>
              <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Meals</span>
            </div>
            <AnimatedCounter value={statsData.meals} className="text-white text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }} />
            <div className="text-white/40 text-sm mt-1">Lunch: {statsData.lunchPct}%</div>
          </div>
        </motion.div>
      </motion.div>

      {/* ────────────────── Event Timeline ────────────────── */}
      <motion.div
        className={`rounded-2xl p-6 ${glassStyle}`}
        variants={fadeInUp}
        custom={5}
      >
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-5 h-5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h3 className="text-white text-lg font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>
            Event Timeline &middot;{" "}
            <span className="text-[#B4ED57] italic" style={{ fontFamily: "'Pixelify Sans', cursive" }}>
              Day 1
            </span>
          </h3>
        </div>

        {/* horizontal scrollable timeline */}
        <div className="relative">
          {/* connector line */}
          <div className="absolute top-0 left-4 right-4 h-px bg-white/10 z-0">
            {/* green dot on the active card */}
            <div
              className="absolute -top-[5px] w-3 h-3 bg-[#B4ED57] rounded-full shadow-lg shadow-[#B4ED57]/40 z-10"
              style={{ left: `${(activeIdx / (timeline.length - 1)) * 100}%`, transform: "translateX(-50%)" }}
            />
          </div>

          <div className="flex gap-4 pt-6 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {timeline.map((ev, i) => {
              const done = ev.status === "completed";
              const now = ev.status === "active";
              const soon = ev.status === "upcoming";

              return (
                <motion.div
                  key={i}
                  className={`flex-shrink-0 w-[156px] rounded-2xl p-4 text-center flex flex-col items-center justify-between min-h-[150px] transition-all cursor-pointer ${
                    now
                      ? "bg-[#B4ED57]/10 border-2 border-[#B4ED57]/40"
                      : done
                      ? "bg-white/[0.03] border border-white/10"
                      : "bg-[#4D58D4]/8 border border-[#4D58D4]/25"
                  }`}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.4, ease: "easeOut" }}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    boxShadow: now
                      ? "0 12px 40px rgba(180,237,87,0.2)"
                      : "0 12px 40px rgba(77,88,212,0.15)",
                  }}
                >
                  {now ? (
                    <>
                      <span className="text-[10px] font-bold tracking-widest text-[#B4ED57] bg-[#B4ED57]/20 px-3 py-1 rounded-full uppercase">
                        Now
                      </span>
                      <div className="text-[#B4ED57] text-2xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>
                        {ev.time}
                      </div>
                      <div className="text-white text-sm font-semibold whitespace-pre-line leading-tight" style={{ fontFamily: "'Questrial', sans-serif" }}>
                        {ev.label}
                      </div>
                    </>
                  ) : (
                    <>
                      <span
                        className={`text-xs px-3 py-1 rounded-full border ${
                          done ? "text-white/40 border-white/15" : "text-[#B4ED57] border-[#B4ED57]/30"
                        }`}
                        style={{ fontFamily: "'Questrial', sans-serif" }}
                      >
                        {ev.time}
                      </span>
                      <div
                        className={`text-sm font-bold leading-tight whitespace-pre-line ${
                          done ? "text-white/40" : "text-white"
                        }`}
                        style={{ fontFamily: "'Questrial', sans-serif" }}
                      >
                        {ev.label}
                      </div>
                      {done ? (
                        <svg className="w-5 h-5 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                          <path d="M22 4L12 14.01 9 11.01" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-[#4D58D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                      )}
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ────────────────── Mentor & Judge Activity + Verification Status ────────────────── */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-5" variants={staggerContainer}>
        {/* Mentor & Judge Activity Funnel */}
        {(() => {
          const totalCompleted = mentorJudgeActivity.reduce((s, m) => s + m.completed, 0);
          const totalAssigned = mentorJudgeActivity.reduce((s, m) => s + m.assigned, 0);
          const overallPct = ((totalCompleted / totalAssigned) * 100).toFixed(1);
          const maxAssigned = Math.max(...mentorJudgeActivity.map((m) => m.assigned));
          return (
            <motion.div
              className={`rounded-2xl p-6 ${glassStyle}`}
              variants={fadeInUp}
              custom={6}
              whileHover={{ borderColor: "rgba(180,237,87,0.2)" }}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white text-lg font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>
                  Mentor &amp; Judge Activity
                </h3>
                <span className="text-xs font-bold text-black bg-[#B4ED57] px-3 py-1.5 rounded-full">
                  {overallPct}% Evaluated
                </span>
              </div>
              <p className="text-white/40 text-xs mb-5">Evaluation progress across mentors &amp; judges</p>

              <div className="space-y-4">
                {mentorJudgeActivity.map((m, i) => {
                  const pct = ((m.completed / m.assigned) * 100).toFixed(1);
                  const pending = m.assigned - m.completed;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-white/60 text-sm">{m.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                            m.role === "Judge" ? "bg-[#B4ED57]/10 text-[#B4ED57]" : "bg-[#4D58D4]/15 text-[#4D58D4]"
                          }`}>{m.role}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {pending > 0 && (
                            <span className="text-yellow-400 text-xs">-{pending} pending</span>
                          )}
                          <span className="text-white font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>
                            {m.completed}/{m.assigned}
                          </span>
                          <span className="text-white/30 text-xs">({pct}%)</span>
                        </div>
                      </div>
                      <div className="h-9 bg-white/5 rounded-lg overflow-hidden">
                        <div
                          className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-1000"
                          style={{ width: `${(m.completed / maxAssigned) * 100}%`, backgroundColor: m.color }}
                        >
                          <span className="text-black text-sm font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>
                            {m.completed}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}

        {/* Verification Status */}
        <motion.div
          className={`rounded-2xl p-6 ${glassStyle}`}
          variants={fadeInUp}
          custom={7}
          whileHover={{ borderColor: "rgba(77,88,212,0.2)" }}
        >
          <h3 className="text-white text-lg font-bold mb-1" style={{ fontFamily: "'Questrial', sans-serif" }}>
            Verification Status
          </h3>
          <p className="text-white/40 text-xs mb-6">Current status distribution</p>

          <div className="flex items-center justify-center gap-10">
            <DonutChart data={donutData} />
            <div className="space-y-5">
              {donutData.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <div>
                    <div className="text-white/50 text-xs">{d.label}</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-white text-lg font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>
                        {d.value}
                      </span>
                      <span className="text-white/30 text-xs">({d.pct}%)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ────────────────── Meal Usage Analysis ────────────────── */}
      <motion.div
        className={`rounded-2xl p-6 ${glassStyle}`}
        variants={fadeInUp}
        custom={8}
      >
        <h3 className="text-white text-lg font-bold mb-1" style={{ fontFamily: "'Questrial', sans-serif" }}>
          Meal Usage Analysis
        </h3>
        <p className="text-white/40 text-xs mb-5">Registered vs consumed meals comparison</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {meals.map((meal, i) => {
            const isActive = meal.status === "active";
            const isUpcoming = meal.status === "upcoming";
            const pct = meal.registered > 0 ? (meal.consumed / meal.registered) * 100 : 0;

            return (
              <motion.div
                key={i}
                className={`rounded-2xl p-5 border transition-all ${
                  isActive
                    ? "bg-[#B4ED57]/5 border-[#B4ED57]/30"
                    : "bg-white/[0.02] border-white/10"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
                whileHover={{ scale: 1.03, y: -4, boxShadow: isActive ? "0 8px 30px rgba(180,237,87,0.15)" : "0 8px 30px rgba(255,255,255,0.05)" }}
              >
                {/* Meal header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className={`w-5 h-5 ${isActive ? "text-[#B4ED57]" : isUpcoming ? "text-white/25" : "text-[#B4ED57]/60"}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
                    </svg>
                    <span
                      className={`font-bold ${isUpcoming ? "text-white/40" : "text-white"}`}
                      style={{ fontFamily: "'Questrial', sans-serif" }}
                    >
                      {meal.name}
                    </span>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-bold tracking-widest text-[#B4ED57] bg-[#B4ED57]/20 px-2.5 py-1 rounded-full uppercase">
                      Active
                    </span>
                  )}
                  {isUpcoming && (
                    <span className="text-[10px] font-bold tracking-widest text-white/30 bg-white/10 px-2.5 py-1 rounded-full uppercase">
                      Upcoming
                    </span>
                  )}
                </div>

                {/* Consumed */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isUpcoming ? "text-white/25" : "text-white/60"}`}>Consumed</span>
                  <span
                    className={`text-2xl font-black ${isUpcoming ? "text-white/15" : "text-[#B4ED57]"}`}
                    style={{ fontFamily: "'Questrial', sans-serif" }}
                  >
                    {meal.consumed}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${isUpcoming ? "bg-white/5" : "bg-[#B4ED57]"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Sub stats */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className={`text-[10px] ${isUpcoming ? "text-white/15" : "text-white/40"}`}>Registered</div>
                    <div
                      className={`font-black text-sm ${isUpcoming ? "text-white/15" : "text-white"}`}
                      style={{ fontFamily: "'Questrial', sans-serif" }}
                    >
                      {meal.registered}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className={`text-[10px] ${isUpcoming ? "text-white/15" : "text-white/40"}`}>Remaining</div>
                    <div
                      className={`font-black text-sm ${isUpcoming ? "text-white/15" : "text-white"}`}
                      style={{ fontFamily: "'Questrial', sans-serif" }}
                    >
                      {meal.remaining}
                    </div>
                  </div>
                </div>

                {/* Consumption rate */}
                <div
                  className={`text-xs px-3 py-2 rounded-lg ${
                    isActive
                      ? "bg-[#B4ED57]/10 text-[#B4ED57]"
                      : isUpcoming
                      ? "bg-white/5 text-white/15"
                      : "bg-white/5 text-white/50"
                  }`}
                >
                  Consumption Rate: <span className="font-bold">{meal.rate}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
