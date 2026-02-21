import React from "react";
import { useApp } from "../../context/AppContext";

const studentNav = [
  { icon: "⊞", label: "Dashboard", key: "dashboard" },
  { icon: "🏆", label: "Leaderboard", key: "leaderboard" },
  { icon: "👥", label: "My Team", key: "team" },
  { icon: "📋", label: "Submissions", key: "submissions" },
  { icon: "🍽", label: "Meal QR", key: "meal" },
];

const adminNav = [
  { icon: "⊞", label: "Overview", key: "overview" },
  { icon: "👥", label: "Participants", key: "participants" },
  { icon: "⚖️", label: "Judges", key: "judges" },
  { icon: "📊", label: "Submissions", key: "submissions" },
  { icon: "📢", label: "Announcements", key: "announcements" },
];

const judgeNav = [
  { icon: "⊞", label: "Dashboard", key: "dashboard" },
  { icon: "📋", label: "Projects", key: "projects" },
  { icon: "⭐", label: "Scoring", key: "scoring" },
  { icon: "📊", label: "Results", key: "results" },
];

export default function Sidebar({ activeSection, setActiveSection, variant = "student" }) {
  const { logout, currentUser } = useApp();
  const navItems = variant === "admin" ? adminNav : variant === "judge" ? judgeNav : studentNav;

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
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all ${
              activeSection === item.key
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