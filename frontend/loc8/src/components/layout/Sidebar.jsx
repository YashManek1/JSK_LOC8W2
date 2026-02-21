import React from "react";
import { useApp } from "../../context/AppContext";

const studentNav = [
  { icon: "⊞", label: "Dashboard", key: "dashboard" },
  { icon: "🏆", label: "Leaderboard", key: "leaderboard" },
  { icon: "👥", label: "My Team", key: "team" },
  { icon: "🌐", label: "Community", key: "community" },
  { icon: "📋", label: "Submissions", key: "submissions" },
  { icon: "🍽", label: "Meal QR", key: "meal" },
];

const adminNav = [
  { icon: "⊞", label: "Overview", key: "overview" },
  { icon: "👥", label: "Teams", key: "teams" },
  { icon: "📊", label: "PPT Evaluation", key: "ppt" },
  { icon: "📱", label: "QR Management", key: "qr" },
  { icon: "🔑", label: "Credential Management", key: "credentials" },
  { icon: "📦", label: "Allocations", key: "allocations" },
];

const judgeNav = [
  { icon: "⊞", label: "Dashboard", key: "dashboard" },
  { icon: "�", label: "Assigned Teams", key: "assignedTeams" },
  { icon: "📝", label: "Evaluation Workspace", key: "evaluation" },
  { icon: "📒", label: "Notes & Feedback", key: "notes" },
  { icon: "🏆", label: "Leaderboard", key: "leaderboard" },
  { icon: "💼", label: "Recruitment", key: "recruitment", sponsorOnly: true },
  { icon: "⚙️", label: "Profile & Settings", key: "settings" },
];

/* ── SVG Icons for admin sidebar ── */
function AdminIcon({ name, active }) {
  const props = {
    width: 20, height: 20, viewBox: "0 0 24 24",
    fill: "none", stroke: active ? "#111" : "currentColor",
    strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round",
  };
  switch (name) {
    case "overview":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "teams":
      return (
        <svg {...props}>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    case "ppt":
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case "qr":
      return (
        <svg {...props}>
          <rect x="2" y="2" width="8" height="8" rx="1" />
          <rect x="14" y="2" width="8" height="8" rx="1" />
          <rect x="2" y="14" width="8" height="8" rx="1" />
          <rect x="14.5" y="14.5" width="3" height="3" rx=".5" />
          <rect x="18.5" y="14.5" width="3" height="3" rx=".5" />
          <rect x="14.5" y="18.5" width="3" height="3" rx=".5" />
          <rect x="18.5" y="18.5" width="3" height="3" rx=".5" />
        </svg>
      );
    case "credentials":
      return (
        <svg {...props}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
          <circle cx="12" cy="16" r="1" />
        </svg>
      );
    case "allocations":
      return (
        <svg {...props}>
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case "profile":
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "logout":
      return (
        <svg {...props}>
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar({ activeSection, setActiveSection, variant = "student", showRecruitment = false }) {
  const { logout, currentUser } = useApp();

  /* ═══════════ ADMIN: Hover-expandable sidebar ═══════════ */
  if (variant === "admin") {
    return (
      <aside
        className="group w-16 hover:w-64 h-screen fixed left-0 top-0 bg-[#181820] flex flex-col z-40 transition-all duration-300 ease-in-out overflow-hidden"
        style={{ fontFamily: "'Fustat', sans-serif" }}
      >
        {/* Logo */}
        <div className="px-2 pt-5 pb-4 flex items-center">
          <div className="w-12 flex items-center justify-center shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#B4ED57] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#111" stroke="none">
                <path d="M12 2l2.12 6.36L21 12l-6.88 3.64L12 22l-2.12-6.36L3 12l6.88-3.64L12 2z" />
                <circle cx="18.5" cy="5" r="1.2" />
                <circle cx="20.5" cy="3" r=".7" />
              </svg>
            </div>
          </div>
          <div className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-1">
            <div className="text-white font-black text-sm tracking-widest leading-none" style={{ fontFamily: "'Questrial', sans-serif" }}>
              HACK<span className="text-white/80">OS</span>
            </div>
            <div className="text-white/40 text-[10px] mt-0.5">Hackathon Portal</div>
          </div>
        </div>

        {/* MAIN label */}
        <div className="px-5 pt-2 pb-2">
          <span className="text-white/30 text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            MAIN
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1">
          {adminNav.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center rounded-xl transition-all duration-200 ${isActive
                    ? "bg-[#B4ED57] text-black font-bold shadow-lg shadow-[#B4ED57]/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
              >
                <span className="w-12 h-10 flex items-center justify-center shrink-0">
                  <AdminIcon name={item.key} active={isActive} />
                </span>
                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom: Profile + Logout */}
        <div className="px-2 pb-4 space-y-1">
          <button className="w-full flex items-center rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200">
            <span className="w-12 h-10 flex items-center justify-center shrink-0">
              <AdminIcon name="profile" />
            </span>
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm">
              Profile
            </span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <span className="w-12 h-10 flex items-center justify-center shrink-0">
              <AdminIcon name="logout" />
            </span>
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm">
              Logout
            </span>
          </button>
        </div>
      </aside>
    );
  }

  /* ═══════════ STUDENT / JUDGE: existing sidebar ═══════════ */
  const rawNav = variant === "judge" ? judgeNav : studentNav;
  const navItems = rawNav.filter((item) => !item.sponsorOnly || showRecruitment);

  return (
    <aside className="w-16 md:w-64 h-screen fixed left-0 top-0 bg-[#0f0f0f] border-r border-white/10 flex flex-col" style={{ fontFamily: "'Questrial', sans-serif" }}>
      {/* Logo */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#B4ED57] flex items-center justify-center flex-shrink-0">
          <span className="text-black font-black text-sm">H</span>
        </div>
        <div className="hidden md:block">
          <div className="text-white font-black text-base tracking-widest leading-none">HACKOS</div>
          <div className="text-white/30 text-[9px] tracking-wider uppercase">{variant} panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveSection(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all ${activeSection === item.key
                ? "bg-[#B4ED57]/15 text-[#B4ED57] border border-[#B4ED57]/20"
                : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-white/10">
        <div className="hidden md:flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B4ED57] to-[#8bc34a] flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
            {currentUser?.name?.[0] || "U"}
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-semibold truncate">{currentUser?.name || "User"}</div>
            <div className="text-white/40 text-xs capitalize">{currentUser?.role}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center md:justify-start gap-2 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-sm transition-all"
        >
          <span>↩</span>
          <span className="hidden md:block">Logout</span>
        </button>
      </div>
    </aside>
  );
}