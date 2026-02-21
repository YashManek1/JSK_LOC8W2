import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

export default function ShortlistAnnouncementPage() {
  const { selectedHackathon, teamData, isTeamLeader, setIsShortlisted, proceedToNextPhase } = useApp();
  const [announced, setAnnounced] = useState(false);
  const [isShortlistedLocal, setIsShortlistedLocal] = useState(null);

  useEffect(() => {
    // Simulate announcement after delay
    const timer = setTimeout(() => {
      setAnnounced(true);
      // Randomly shortlist or not (70% chance of shortlisting)
      const shortlisted = Math.random() > 0.3;
      setIsShortlistedLocal(shortlisted);
      setIsShortlisted(shortlisted);
      if (shortlisted && isTeamLeader) {
        console.log(`[SIMULATED EMAIL] Congratulations! ${teamData?.name} has been shortlisted!`);
      }
    }, 2000);
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
                Evaluating presentations...
              </h2>
              <p className="text-white/60">Our judges are reviewing all submissions</p>
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
