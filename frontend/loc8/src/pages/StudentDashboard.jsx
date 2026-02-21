import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import Sidebar from "../components/layout/Sidebar";
import QRCodeDisplay from "../components/ui/QRCodeDisplay";
import {
  CountdownWidget,
  PPTScoreWidget,
  MealQRWidget,
  TeamCommitsWidget,
  HackerCockpitWidget,
  VoiceAssistantWidget,
} from "../components/student/StudentWidgets";

export default function StudentDashboard() {
  const { currentUser, generatedQR, selectedHackathon } = useApp();
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        variant="student"
      />

      {/* Main Content */}
      <main className="flex-1 ml-16 md:ml-64 p-6 min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="bg-[#111] border border-white/15 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
              {selectedHackathon?.name?.split(" ").slice(0, 2).join(" ").toUpperCase() || "HACKOS 2026"}
            </span>
            <span className="bg-[#111] border border-white/15 text-white/60 text-xs px-3 py-1.5 rounded-lg">
              DAY 1
            </span>
            <span className="flex items-center gap-1.5 text-lime-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-white/50 hover:text-white transition-colors">
              🔔
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white">2</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-lime-400 to-green-600 flex items-center justify-center text-black font-black text-sm">
              {currentUser?.name?.[0] || "A"}
            </div>
          </div>
        </div>

        {/* Welcome */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-white text-3xl font-black">
              Welcome back,{" "}
              <span className="text-lime-400">{currentUser?.name?.split(" ")[0] || "Hacker"}</span>
            </h1>
            <div className="flex items-center gap-3 mt-1 text-white/40 text-sm">
              <span>Team: <span className="text-white/70">{currentUser?.teamName || "404 Found"}</span></span>
              <span>·</span>
              <span>Project: <span className="text-white/70">HealthTrack ML</span></span>
              <span>·</span>
              <span>Current Rank: <span className="text-lime-400 font-bold">#1</span></span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button className="px-4 py-2 bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-semibold rounded-xl hover:bg-lime-400/20 transition-colors">
              🏆 Rank #1
            </button>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-white/5 border border-white/15 text-white/70 text-xs rounded-lg">
                ✅ Verified
              </button>
              <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg font-semibold flex items-center gap-1">
                👑 Commit King
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <CountdownWidget />
          <VoiceAssistantWidget />
          {/* Entry QR */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Your Entry QR</h3>
              <button className="text-white/30 hover:text-white transition-colors text-sm">↻</button>
            </div>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white rounded-xl">
                <QRCodeDisplay data={generatedQR || "HACKOS-STUDENT"} size={140} />
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
                <span className="text-lime-400 font-semibold">Entry Granted</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Type</span>
                <span className="text-white/60">Dynamic · refreshes every 60s</span>
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
      </main>
    </div>
  );
}