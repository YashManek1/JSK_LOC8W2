import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Sidebar from "../components/layout/Sidebar";
import QRCodeDisplay from "../components/ui/QRCodeDisplay";
import GitHubAnalytics from "../components/student/GitHubAnalytics";
import { getPublicLeaderboard, getStudentDashboardData } from "../api";
import {
  CountdownWidget,
  PPTScoreWidget,
  MealQRWidget,
  TeamCommitsWidget,
  HackerCockpitWidget,
  VoiceAssistantWidget,
} from "../components/student/StudentWidgets";

function LeaderboardSection({ teamName }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPublicLeaderboard();
        const list = Array.isArray(data) ? data : data.entries || data.leaderboard || [];
        setEntries(list);
      } catch {
        setError("Leaderboard not available yet.");
      }
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const myTeam = teamName?.toLowerCase();
  const myRank = entries.findIndex((e) => e.teamName?.toLowerCase() === myTeam);

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-12 text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-white/40">Loading leaderboard...</p>
      </div>
    );
  }

  if (error || entries.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-12 text-center">
        <p className="text-5xl mb-4">🏆</p>
        <h2 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "'Questrial', sans-serif" }}>Leaderboard</h2>
        <p className="text-white/40">{error || "No rankings published yet. Check back after evaluations!"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-2xl font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>Leaderboard</h2>
        {myRank >= 0 && (
          <div className="flex items-center gap-2 bg-[#B4ED57]/10 border border-[#B4ED57]/20 px-4 py-2 rounded-xl">
            <span className="text-white/60 text-sm">Your Rank:</span>
            <span className="text-[#B4ED57] font-black text-lg" style={{ fontFamily: "'Pixelify Sans', cursive" }}>#{myRank + 1}</span>
          </div>
        )}
      </div>

      {/* Top 3 podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-2">
          {[1, 0, 2].map((idx) => {
            const e = entries[idx];
            if (!e) return null;
            const medals = ["🥇", "🥈", "🥉"];
            const heights = ["h-32", "h-40", "h-28"];
            const isMe = e.teamName?.toLowerCase() === myTeam;
            return (
              <div key={idx} className="flex flex-col items-center justify-end">
                <span className="text-3xl mb-2">{medals[idx]}</span>
                <p className={`text-sm font-bold mb-1 ${isMe ? "text-[#B4ED57]" : "text-white"}`} style={{ fontFamily: "'Questrial', sans-serif" }}>
                  {e.teamName}
                </p>
                <p className="text-white/60 text-xs mb-2">{e.finalScore != null ? Math.round(e.finalScore) : "—"} pts</p>
                <div className={`w-full ${heights[idx]} rounded-t-xl ${isMe ? "bg-[#B4ED57]/20 border border-[#B4ED57]/30" : "bg-white/5 border border-white/10"}`} />
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-5 py-3 text-left text-white/30 text-xs uppercase tracking-wider font-bold">Rank</th>
              <th className="px-5 py-3 text-left text-white/30 text-xs uppercase tracking-wider font-bold">Team</th>
              <th className="px-5 py-3 text-left text-white/30 text-xs uppercase tracking-wider font-bold">Score</th>
              <th className="px-5 py-3 text-left text-white/30 text-xs uppercase tracking-wider font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => {
              const isMe = e.teamName?.toLowerCase() === myTeam;
              return (
                <tr key={e.id || i} className={`border-b border-white/5 transition-colors ${isMe ? "bg-[#B4ED57]/5" : "hover:bg-white/[0.02]"}`}>
                  <td className="px-5 py-3">
                    <span className={`inline-flex w-7 h-7 rounded-lg items-center justify-center text-xs font-bold ${i < 3 ? "bg-[#B4ED57]/10 text-[#B4ED57]" : "bg-white/5 text-white/30"}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`font-bold ${isMe ? "text-[#B4ED57]" : "text-white"}`} style={{ fontFamily: "'Fustat', sans-serif" }}>
                      {e.teamName} {isMe && "⭐"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-white font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>
                      {e.finalScore != null ? Math.round(e.finalScore) : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      e.status === "ELIMINATED" ? "bg-red-500/10 text-red-400" :
                      e.status === "EVALUATED" ? "bg-[#B4ED57]/10 text-[#B4ED57]" :
                      "bg-white/5 text-white/40"
                    }`}>
                      {e.status || "EVALUATED"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { currentUser, generatedQR, selectedHackathon, navigateTo } = useApp();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [dashData, setDashData] = useState({
    day: "DAY 1",
    project: null,
    rank: null,
    notifications: 0,
    badges: [],
    verified: false,
  });

  useEffect(() => {
    const fetchDash = async () => {
      try {
        const data = await getStudentDashboardData();
        if (data) {
          setDashData({
            day: data.day || "DAY 1",
            project: data.project || data.projectName || null,
            rank: data.rank ?? null,
            notifications: data.notifications ?? data.notificationCount ?? 0,
            badges: data.badges || [],
            verified: data.verified ?? false,
          });
        }
      } catch { /* use fallback */ }
    };
    fetchDash();
  }, []);

  const handleSectionChange = (section) => {
    if (section === "community") {
      navigateTo("community");
      return;
    }
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
        variant="student"
      />

      {/* Main Content */}
      <main className="flex-1 ml-16 md:ml-64 p-6 min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span
              className="bg-[#111] border border-white/15 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ fontFamily: "'Questrial', sans-serif" }}
            >
              {selectedHackathon?.name
                ?.split(" ")
                .slice(0, 2)
                .join(" ")
                .toUpperCase() || "HACKOS 2026"}
            </span>
            <span className="bg-[#111] border border-white/15 text-white/60 text-xs px-3 py-1.5 rounded-lg">
              {dashData.day}
            </span>
            <span className="flex items-center gap-1.5 text-[#B4ED57] text-xs font-semibold">
              <span className="w-1.5 h-1.5 bg-[#B4ED57] rounded-full animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-white/50 hover:text-white transition-colors">
              🔔
              {dashData.notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white">
                {dashData.notifications}
              </span>
              )}
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B4ED57] to-[#8bc34a] flex items-center justify-center text-black font-black text-sm">
              {currentUser?.name?.[0] || "A"}
            </div>
          </div>
        </div>

        {/* Welcome */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1
              className="text-white text-3xl font-black"
              style={{ fontFamily: "'Questrial', sans-serif" }}
            >
              Welcome back,{" "}
              <span
                className="text-[#B4ED57] italic"
                style={{ fontFamily: "'Pixelify Sans', cursive" }}
              >
                {currentUser?.name?.split(" ")[0] || "Hacker"}
              </span>
            </h1>
            <div
              className="flex items-center gap-3 mt-1 text-white/40 text-sm"
              style={{ fontFamily: "'Fustat', sans-serif" }}
            >
              <span>
                Team:{" "}
                <span className="text-white/70">
                  {currentUser?.teamName || "404 Found"}
                </span>
              </span>
              <span>·</span>
              <span>
                Project: <span className="text-white/70">{dashData.project || currentUser?.projectName || "Not assigned"}</span>
              </span>
              <span>·</span>
              <span>
                Current Rank:{" "}
                <span
                  className="text-[#B4ED57] font-bold italic"
                  style={{ fontFamily: "'Pixelify Sans', cursive" }}
                >
                  {dashData.rank != null ? `#${dashData.rank}` : "—"}
                </span>
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {dashData.rank != null && (
            <button
              className="px-4 py-2 bg-[#B4ED57]/10 border border-[#B4ED57]/30 text-[#B4ED57] text-xs font-semibold italic rounded-xl hover:bg-[#B4ED57]/20 transition-colors"
              style={{ fontFamily: "'Pixelify Sans', cursive" }}
            >
              🏆 Rank #{dashData.rank}
            </button>
            )}
            <div className="flex gap-2">
              {dashData.verified && (
              <button className="px-3 py-1.5 bg-white/5 border border-white/15 text-white/70 text-xs rounded-lg">
                ✅ Verified
              </button>
              )}
              {dashData.badges?.includes("commitKing") && (
              <button className="px-3 py-1.5 bg-[#4D58D4] text-white text-xs rounded-lg font-semibold flex items-center gap-1">
                👑 Commit King
              </button>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        {activeSection === "dashboard" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
              <CountdownWidget />
              <VoiceAssistantWidget userEmail={currentUser?.email} />
              {/* Entry QR */}
              <div
                className="bg-[#111] border border-white/10 rounded-2xl p-6"
                style={{ fontFamily: "'Fustat', sans-serif" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-white font-semibold"
                    style={{ fontFamily: "'Questrial', sans-serif" }}
                  >
                    Your Entry QR
                  </h3>
                  <button className="text-white/30 hover:text-white transition-colors text-sm">
                    ↻
                  </button>
                </div>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-white rounded-xl">
                    <QRCodeDisplay
                      data={generatedQR || "HACKOS-STUDENT"}
                      size={140}
                    />
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/40">Code Prefix</span>
                    <span className="text-white font-mono">H</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">QR ID</span>
                    <span className="text-white font-mono">HACKOS-2025-...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Status</span>
                    <span className="text-[#B4ED57] font-semibold">
                      Entry Granted
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Type</span>
                    <span className="text-white/60">
                      Dynamic · refreshes every 60s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              <PPTScoreWidget />
              <MealQRWidget />
            </div>

            {/* Third Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <TeamCommitsWidget teamName={currentUser?.teamName} />
              <HackerCockpitWidget />
            </div>
          </>
        )}

        {/* GitHub Analytics Section */}
        {activeSection === "submissions" && (
          <div>
            <h2 className="text-white text-2xl font-bold mb-6" style={{ fontFamily: "'Questrial', sans-serif" }}>
              GitHub Repository Analytics
            </h2>
            <GitHubAnalytics teamName={currentUser?.teamName} />
          </div>
        )}

        {/* Leaderboard Section */}
        {activeSection === "leaderboard" && <LeaderboardSection teamName={currentUser?.teamName} />}

        {activeSection === "team" && (
          <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white text-2xl font-bold mb-4" style={{ fontFamily: "'Questrial', sans-serif" }}>
              My Team
            </h2>
            <p className="text-white/60" style={{ fontFamily: "'Fustat', sans-serif" }}>
              View your team members, roles, and contributions.
            </p>
          </div>
        )}

        {activeSection === "meal" && (
          <div>
            <h2 className="text-white text-2xl font-bold mb-6" style={{ fontFamily: "'Questrial', sans-serif" }}>
              Meal QR Code
            </h2>
            <MealQRWidget fullScreen={true} />
          </div>
        )}
      </main>
    </div>
  );
}
