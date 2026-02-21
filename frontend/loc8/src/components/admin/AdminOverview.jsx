import React, { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════════ */
/*  DATA                                                               */
/* ═══════════════════════════════════════════════════════════════════ */

const TIMELINE = [
  { time: "09:00", label: "Registration &\nVerification", status: "completed" },
  { time: "10:30", label: "Opening\nCeremony", status: "completed" },
  { time: "11:00", label: "Hacking\nBegins", status: "completed" },
  { time: "13:00", label: "Lunch Break", status: "active" },
  { time: "18:00", label: "Mentor\nSessions", status: "upcoming" },
  { time: "20:00", label: "Dinner", status: "upcoming" },
  { time: "23:59", label: "PPT Submission\nLock", status: "upcoming" },
];

const MENTOR_JUDGE_ACTIVITY = [
  { label: "Dr. Priya Sharma", role: "Judge", completed: 22, assigned: 25, color: "#B4ED57" },
  { label: "Rahul Mehra", role: "Judge", completed: 18, assigned: 25, color: "#B4ED57" },
  { label: "Prof. Anand Rao", role: "Mentor", completed: 15, assigned: 20, color: "#4D58D4" },
  { label: "Sneha Iyer", role: "Mentor", completed: 12, assigned: 20, color: "#4D58D4" },
  { label: "Vikram Desai", role: "Judge", completed: 10, assigned: 25, color: "#B4ED57" },
];

const DONUT_DATA = [
  { label: "Approved", value: 980, pct: "78.4", color: "#B4ED57" },
  { label: "Pending", value: 124, pct: "9.9", color: "#4D58D4" },
  { label: "Rejected", value: 86, pct: "6.9", color: "#f87171" },
  { label: "Flagged", value: 60, pct: "4.8", color: "#f59e0b" },
];

const MEALS = [
  { name: "Breakfast", consumed: 733, registered: 856, remaining: 123, rate: 84.5, status: "completed" },
  { name: "Lunch", consumed: 613, registered: 856, remaining: 244, rate: 71.5, status: "active" },
  { name: "Dinner", consumed: 0, registered: 856, remaining: 856, rate: 0, status: "upcoming" },
];

/* ═══════════════════════════════════════════════════════════════════ */
/*  DONUT CHART                                                        */
/* ═══════════════════════════════════════════════════════════════════ */

function DonutChart() {
  const size = 190;
  const sw = 30;
  const r = (size - sw) / 2;
  const C = 2 * Math.PI * r;
  const total = DONUT_DATA.reduce((s, d) => s + d.value, 0);
  const gap = 5;
  let cum = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {DONUT_DATA.map((d, i) => {
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

export default function AdminOverview() {
  /* live clock */
  const [clock, setClock] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");
  const clockStr = `${pad(clock.getHours())}:${pad(clock.getMinutes())}:${pad(clock.getSeconds())}`;

  /* active timeline index */
  const activeIdx = TIMELINE.findIndex((e) => e.status === "active");

  return (
    <div className="space-y-6" style={{ fontFamily: "'Fustat', sans-serif" }}>
      {/* ────────────────── Header ────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-3xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>
            Admin{" "}
            <span className="text-[#B4ED57] italic" style={{ fontFamily: "'Pixelify Sans', cursive" }}>
              Dashboard
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Real-time hackathon monitoring &amp; analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              autoRefresh
                ? "border-[#B4ED57] text-[#B4ED57] bg-[#B4ED57]/5"
                : "border-white/20 text-white/40 bg-white/5"
            }`}
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
          </button>
          <div className="flex items-center gap-2 bg-[#111] border border-white/10 rounded-xl px-4 py-2.5">
            <span className="w-2 h-2 bg-[#B4ED57] rounded-full animate-pulse" />
            <span className="text-white font-bold text-sm tracking-wider" style={{ fontFamily: "'Questrial', sans-serif" }}>
              {clockStr}
            </span>
          </div>
        </div>
      </div>

      {/* ────────────────── Stats Cards ────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Registered */}
        <div className="bg-[#B4ED57] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-5">
            <svg className="w-7 h-7 text-black/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="7" r="4" />
              <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
              <circle cx="17" cy="9" r="3" />
              <path d="M21 21v-2a3 3 0 00-3-3h-1" />
            </svg>
            <span className="text-black/50 text-xs font-medium flex items-center gap-1">
              <span>↑</span> 24 today
            </span>
          </div>
          <div className="text-black text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>318</div>
          <div className="text-black/50 text-sm mt-1">Registered</div>
        </div>

        {/* Verified */}
        <div className="bg-[#4D58D4] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-5">
            <svg className="w-7 h-7 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01 9 11.01" />
            </svg>
            <span className="text-white/50 text-xs font-medium">92.6% RATE</span>
          </div>
          <div className="text-white text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>289</div>
          <div className="text-white/50 text-sm mt-1">Verified</div>
        </div>

        {/* Teams */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
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
          <div className="text-white text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>74</div>
          <div className="text-white/40 text-sm mt-1">6 RSVP pending</div>
        </div>

        {/* Meals */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-5">
            <svg className="w-7 h-7 text-[#4D58D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
            </svg>
            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Meals</span>
          </div>
          <div className="text-white text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>186</div>
          <div className="text-white/40 text-sm mt-1">Lunch: 64%</div>
        </div>
      </div>

      {/* ────────────────── Event Timeline ────────────────── */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
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
              style={{ left: `${(activeIdx / (TIMELINE.length - 1)) * 100}%`, transform: "translateX(-50%)" }}
            />
          </div>

          <div className="flex gap-4 pt-6 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {TIMELINE.map((ev, i) => {
              const done = ev.status === "completed";
              const now = ev.status === "active";
              const soon = ev.status === "upcoming";

              return (
                <div
                  key={i}
                  className={`flex-shrink-0 w-[156px] rounded-2xl p-4 text-center flex flex-col items-center justify-between min-h-[150px] transition-all ${
                    now
                      ? "bg-[#B4ED57]/10 border-2 border-[#B4ED57]/40"
                      : done
                      ? "bg-white/[0.03] border border-white/10"
                      : "bg-[#4D58D4]/8 border border-[#4D58D4]/25"
                  }`}
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
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ────────────────── Mentor & Judge Activity + Verification Status ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Mentor & Judge Activity Funnel */}
        {(() => {
          const totalCompleted = MENTOR_JUDGE_ACTIVITY.reduce((s, m) => s + m.completed, 0);
          const totalAssigned = MENTOR_JUDGE_ACTIVITY.reduce((s, m) => s + m.assigned, 0);
          const overallPct = ((totalCompleted / totalAssigned) * 100).toFixed(1);
          const maxAssigned = Math.max(...MENTOR_JUDGE_ACTIVITY.map((m) => m.assigned));
          return (
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
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
                {MENTOR_JUDGE_ACTIVITY.map((m, i) => {
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
            </div>
          );
        })()}

        {/* Verification Status */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
          <h3 className="text-white text-lg font-bold mb-1" style={{ fontFamily: "'Questrial', sans-serif" }}>
            Verification Status
          </h3>
          <p className="text-white/40 text-xs mb-6">Current status distribution</p>

          <div className="flex items-center justify-center gap-10">
            <DonutChart />
            <div className="space-y-5">
              {DONUT_DATA.map((d, i) => (
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
        </div>
      </div>

      {/* ────────────────── Meal Usage Analysis ────────────────── */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
        <h3 className="text-white text-lg font-bold mb-1" style={{ fontFamily: "'Questrial', sans-serif" }}>
          Meal Usage Analysis
        </h3>
        <p className="text-white/40 text-xs mb-5">Registered vs consumed meals comparison</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MEALS.map((meal, i) => {
            const isActive = meal.status === "active";
            const isUpcoming = meal.status === "upcoming";
            const pct = meal.registered > 0 ? (meal.consumed / meal.registered) * 100 : 0;

            return (
              <div
                key={i}
                className={`rounded-2xl p-5 border transition-all ${
                  isActive
                    ? "bg-[#B4ED57]/5 border-[#B4ED57]/30"
                    : "bg-white/[0.02] border-white/10"
                }`}
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
