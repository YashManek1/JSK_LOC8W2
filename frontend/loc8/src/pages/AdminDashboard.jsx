import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import Sidebar from "../components/layout/Sidebar";
import { ParticipantsTable, CreateJudgeWidget, AdminStatsBar } from "../components/admin/AdminWidgets";

const sections = {
  overview: "Overview",
  participants: "Participants",
  judges: "Judges",
  submissions: "Submissions",
  announcements: "Announcements",
};

export default function AdminDashboard() {
  const { currentUser, selectedHackathon } = useApp();
  const [activeSection, setActiveSection] = useState("overview");
  const [announcement, setAnnouncement] = useState("");
  const [announcements, setAnnouncements] = useState([
    { id: 1, text: "Lunch is ready at Counter B. Please show your meal QR.", time: "12:45 PM" },
    { id: 2, text: "Final submissions close in 30 minutes!", time: "3:30 PM" },
  ]);

  const postAnnouncement = () => {
    if (!announcement.trim()) return;
    setAnnouncements((prev) => [
      { id: Date.now(), text: announcement, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ...prev,
    ]);
    setAnnouncement("");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} variant="admin" />

      <main className="flex-1 ml-16 md:ml-64 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl font-black">
              {sections[activeSection]}
            </h1>
            <p className="text-white/40 text-sm mt-0.5">
              {selectedHackathon?.name || "HackOS 2026"} · Admin Panel
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-lime-400 text-xs bg-lime-400/10 border border-lime-400/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
              LIVE
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-sm">
              {currentUser?.name?.[0] || "A"}
            </div>
          </div>
        </div>

        {/* Content */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            <AdminStatsBar hackathon={selectedHackathon} />
            <ParticipantsTable />
          </div>
        )}

        {activeSection === "participants" && (
          <div>
            <ParticipantsTable />
          </div>
        )}

        {activeSection === "judges" && <CreateJudgeWidget />}

        {activeSection === "submissions" && (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center">
            <span className="text-5xl block mb-4">📦</span>
            <h3 className="text-white font-bold text-xl mb-2">Project Submissions</h3>
            <p className="text-white/40 text-sm">62 projects submitted · Review panel opens at 4 PM</p>
          </div>
        )}

        {activeSection === "announcements" && (
          <div className="space-y-5">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Post Announcement</h3>
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Type your announcement to all participants..."
                rows={3}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-lime-400/60 transition-colors resize-none mb-3"
              />
              <button onClick={postAnnouncement} className="px-6 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-bold text-sm rounded-xl transition-all">
                📢 Broadcast
              </button>
            </div>
            <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <h3 className="text-white font-semibold">Recent Announcements</h3>
              </div>
              <div className="divide-y divide-white/5">
                {announcements.map((a) => (
                  <div key={a.id} className="px-5 py-4 flex items-start gap-3">
                    <span className="text-lg mt-0.5">📢</span>
                    <div className="flex-1">
                      <p className="text-white/80 text-sm">{a.text}</p>
                      <span className="text-white/30 text-xs">{a.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}