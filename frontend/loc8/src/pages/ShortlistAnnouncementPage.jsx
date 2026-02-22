import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../api";

export default function ShortlistAnnouncementPage() {
  const { selectedHackathon, teamData, isTeamLeader, setIsShortlisted, proceedToNextPhase, token } = useApp();
  const [announced, setAnnounced] = useState(false);
  const [isShortlistedLocal, setIsShortlistedLocal] = useState(null);
  const [rank, setRank] = useState(null);
  const [score, setScore] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchShortlistStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/shortlist/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          // data is an array of entries sorted by rank
          const entries = Array.isArray(data) ? data : data.entries || data.leaderboard || [];
          const teamName = teamData?.name?.toLowerCase();
          const myEntry = entries.find(
            (e) => e.teamName?.toLowerCase() === teamName
          );

          if (myEntry) {
            const myRank = entries.indexOf(myEntry) + 1;
            setRank(myRank);
            setScore(myEntry.finalScore != null ? Math.round(myEntry.finalScore) : null);
            const shortlisted = myEntry.status !== "ELIMINATED";
            setIsShortlistedLocal(shortlisted);
            setIsShortlisted(shortlisted);
          } else {
            // Team not found in leaderboard — check if leaderboard is published
            if (entries.length > 0) {
              setIsShortlistedLocal(false);
              setIsShortlisted(false);
            } else {
              setError("Results haven't been published yet. Check back soon!");
            }
          }
        } else {
          setError("Results are not available yet.");
        }
      } catch {
        setError("Could not fetch results. Please try again later.");
      }
      setAnnounced(true);
    };

    // Small delay for dramatic effect
    const timer = setTimeout(fetchShortlistStatus, 1500);
    return () => clearTimeout(timer);
  }, []);

  const cardCls = "bg-[#111] border border-white/10 rounded-2xl p-8";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#B4ED57]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black italic mb-2">SHORTLIST ANNOUNCEMENT</h1>
          <p className="text-white/40">Results of PPT Round 1 Evaluation</p>
        </div>

        <div className={cardCls}>
          {!announced ? (
            <div className="text-center py-12">
              <div className="animate-pulse mb-4">
                <p className="text-6xl">📊</p>
              </div>
              <h2 className="text-2xl font-bold mb-4">
                Checking results...
              </h2>
              <p className="text-white/60">Fetching shortlist data from the server</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">⏳</p>
              <h2 className="text-2xl font-bold mb-2">Results Pending</h2>
              <p className="text-white/60">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all"
              >
                ↻ Refresh
              </button>
            </div>
          ) : isShortlistedLocal ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <p className="text-6xl mb-4">🎉</p>
                <h2 className="text-3xl font-black text-[#B4ED57] mb-2">
                  Congratulations!
                </h2>
                <p className="text-white text-lg font-bold">{teamData?.name}</p>
                <p className="text-white/60 mt-2">You have been shortlisted!</p>
              </div>

              <div className="bg-[#B4ED57]/10 border border-[#B4ED57]/30 rounded-xl p-6">
                <p className="text-[#B4ED57] text-sm font-bold mb-4">🏆 YOU'RE IN!</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {rank && (
                    <div className="bg-black/20 rounded-xl p-4 text-center">
                      <p className="text-white/40 text-xs mb-1">YOUR RANK</p>
                      <p className="text-[#B4ED57] text-3xl font-black">#{rank}</p>
                    </div>
                  )}
                  {score != null && (
                    <div className="bg-black/20 rounded-xl p-4 text-center">
                      <p className="text-white/40 text-xs mb-1">SCORE</p>
                      <p className="text-white text-3xl font-black">{score}</p>
                    </div>
                  )}
                </div>
                <ul className="space-y-3 text-white/80">
                  <li className="flex gap-2">
                    <span className="text-[#B4ED57]">✓</span>
                    <span>Your team demonstrates excellent solution architecture</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#B4ED57]">✓</span>
                    <span>Strong presentation and explanation of concepts</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#B4ED57]">✓</span>
                    <span>Innovative approach to problem solving</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-white/60 text-sm mb-2">NEXT STEP</p>
                <p className="text-white font-bold">Your QR code is ready for registration!</p>
              </div>

              <button
                onClick={proceedToNextPhase}
                className="w-full py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all"
              >
                Get QR Code & Enter Event →
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <p className="text-5xl mb-4">📋</p>
                <h2 className="text-2xl font-bold mb-2">Result Announced</h2>
                <p className="text-white/60">Thank you for participating!</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <p className="text-white/60 text-sm mb-3">FEEDBACK</p>
                <p className="text-white/80 text-sm leading-relaxed">
                  While your team didn't make it to the next round this time, we really appreciated your effort and innovation.
                  Please join us for future hackathons and keep building amazing solutions!
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-white/60 text-sm mb-2">ENCOURAGEMENT</p>
                <p className="text-[#B4ED57] font-bold">Every great journey starts with learning. Keep building! 🚀</p>
              </div>

              <button
                onClick={() => window.location.href = "/"}
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
