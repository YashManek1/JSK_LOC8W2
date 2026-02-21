import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Sidebar from "../components/layout/Sidebar";
import { ParticipantsTable, CreateJudgeWidget, AdminStatsBar } from "../components/admin/AdminWidgets";

const sections = {
  overview: "Overview",
  participants: "Participants",
  judges: "Judges",
  submissions: "Submissions",
  timeline: "Timeline",
  announcements: "Announcements",
};

/* Sample timeline data — in production this would come from the hackathon object */
const TIMELINE_EVENTS = [
  { time: "9:00 AM", event: "Registration & Check-in", status: "completed" },
  { time: "10:00 AM", event: "Opening Ceremony", status: "completed" },
  { time: "10:30 AM", event: "Hacking Begins", status: "completed" },
  { time: "1:00 PM", event: "Lunch Break — Counter B", status: "active" },
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
    /* Stagger-animate each card appearing */
    if (visibleCount < TIMELINE_EVENTS.length) {
      const t = setTimeout(() => setVisibleCount((c) => c + 1), 120);
      return () => clearTimeout(t);
    }
  }, [visibleCount]);

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8">
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

      {/* Timeline track */}
      <div className="relative">
        {/* Vertical line */}
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
                style={{
                  opacity: show ? 1 : 0,
                  transform: show ? "translateX(0)" : "translateX(-20px)",
                }}
              >
                {/* Node */}
                <div className="absolute left-2.5 top-4 z-10">
                  {isActive ? (
                    <span className="relative flex h-[14px] w-[14px]">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4D58D4] opacity-75" />
                      <span className="relative inline-flex rounded-full h-[14px] w-[14px] bg-[#4D58D4] border-2 border-[#111]" />
                    </span>
                  ) : (
                    <span
                      className={`block w-[14px] h-[14px] rounded-full border-2 border-[#111] transition-colors ${
                        isCompleted ? "bg-[#B4ED57]" : "bg-white/20"
                      }`}
                    />
                  )}
                </div>

                {/* Card */}
                <div
                  className={`flex-1 rounded-xl px-5 py-3 border transition-colors ${
                    isActive
                      ? "bg-[#4D58D4]/15 border-[#4D58D4]/40"
                      : isCompleted
                      ? "bg-[#B4ED57]/5 border-[#B4ED57]/15"
                      : "bg-white/[0.02] border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold min-w-[72px] ${
                          isActive ? "text-[#4D58D4]" : isCompleted ? "text-[#B4ED57]" : "text-white/30"
                        }`}
                        style={{ fontFamily: "'Questrial', sans-serif" }}
                      >
                        {ev.time}
                      </span>
                      <span
                        className={`text-sm ${isActive ? "text-white font-semibold" : isCompleted ? "text-white/60" : "text-white/40"}`}
                        style={{ fontFamily: "'Fustat', sans-serif" }}
                      >
                        {ev.event}
                      </span>
                    </div>
                    {isCompleted && <span className="text-[#B4ED57] text-xs">✓</span>}
                    {isActive && (
                      <span className="text-[10px] font-bold tracking-wider text-[#4D58D4] bg-[#4D58D4]/20 px-2 py-0.5 rounded-full">
                        NOW
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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

      <main className="flex-1 ml-16 p-6" style={{ fontFamily: "'Fustat', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>
              {sections[activeSection]}
            </h1>
            <p className="text-white/40 text-sm mt-0.5">
              {selectedHackathon?.name || "HackOS 2026"} · Admin Panel
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[#B4ED57] text-xs bg-[#B4ED57]/10 border border-[#B4ED57]/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#B4ED57] rounded-full animate-pulse" />
              LIVE
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4D58D4] to-[#B4ED57] flex items-center justify-center text-white font-black text-sm" style={{ fontFamily: "'Questrial', sans-serif" }}>
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
            <h3 className="text-white font-bold text-xl mb-2" style={{ fontFamily: "'Questrial', sans-serif" }}>Project Submissions</h3>
            <p className="text-white/40 text-sm">62 projects submitted · Review panel opens at 4 PM</p>
          </div>
        )}

        {activeSection === "timeline" && <TimelineSection />}

        {activeSection === "announcements" && (
          <div className="space-y-5">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4" style={{ fontFamily: "'Questrial', sans-serif" }}>Post Announcement</h3>
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Type your announcement to all participants..."
                rows={3}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#B4ED57]/60 transition-colors resize-none mb-3"
              />
              <button onClick={postAnnouncement} className="px-6 py-2.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold text-sm rounded-xl transition-all">
                📢 Broadcast
              </button>
            </div>
            <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <h3 className="text-white font-semibold" style={{ fontFamily: "'Questrial', sans-serif" }}>Recent Announcements</h3>
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