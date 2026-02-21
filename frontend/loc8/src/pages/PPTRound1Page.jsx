import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function PPTRound1Page() {
  const { selectedHackathon, teamData, allocatedProblem, setPptScore, proceedToNextPhase } = useApp();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitPPT = () => {
    // Simulate PPT submission
    setPptScore((Math.random() * 100).toFixed(2));
    setSubmitted(true);
  };

  const handleProceed = () => {
    proceedToNextPhase();
  };

  const cardCls = "bg-[#111] border border-white/10 rounded-2xl p-8";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#B4ED57]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black italic mb-2">PPT ROUND 1</h1>
          <p className="text-white/40">
            Present your solution to <span className="text-[#B4ED57] font-bold">{allocatedProblem?.title}</span>
          </p>
          <p className="text-white/60 text-sm mt-2">Team: {teamData?.name}</p>
        </div>

        {!submitted ? (
          <div className={cardCls}>
            <h2 className="text-2xl font-bold mb-6">Prepare Your Presentation</h2>

            <div className="space-y-6 mb-8">
              {/* Problem Statement */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-2">ALLOCATED PROBLEM</p>
                <p className="text-white font-bold text-lg">{allocatedProblem?.title}</p>
                <p className="text-white/60 text-sm mt-2">Domain: {allocatedProblem?.domain}</p>
              </div>

              {/* Timeline Info */}
              <div className="bg-[#B4ED57]/10 border border-[#B4ED57]/30 rounded-xl p-4">
                <p className="text-[#B4ED57] text-xs font-bold mb-3">PRESENTATION TIMELINE</p>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>📌 <strong>Presentation Time:</strong> 5 minutes</li>
                  <li>📌 <strong>Q&amp;A Time:</strong> 3 minutes</li>
                  <li>📌 <strong>Evaluation Criteria:</strong> Innovation, Feasibility, Presentation</li>
                  <li>📌 <strong>Judges:</strong> Industry experts &amp; mentors</li>
                </ul>
              </div>

              {/* How to Submit */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-3">HOW TO SUBMIT</p>
                <ol className="space-y-2 text-sm text-white/80">
                  <li>1. Upload your PPT presentation</li>
                  <li>2. Ensure all team members are present</li>
                  <li>3. Be ready for Q&amp;A from judges</li>
                  <li>4. Click "Submit for Evaluation"</li>
                </ol>
              </div>
            </div>

            <button
              onClick={handleSubmitPPT}
              className="w-full py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all"
            >
              Submit PPT for Evaluation →
            </button>
          </div>
        ) : (
          <div className={cardCls}>
            <div className="text-center mb-8">
              <p className="text-5xl mb-4">✓</p>
              <h2 className="text-2xl font-bold mb-2">PPT Submitted Successfully</h2>
              <p className="text-white/60">Your presentation has been received for evaluation</p>
            </div>

            <div className="bg-[#B4ED57]/10 border border-[#B4ED57]/30 rounded-xl p-4 mb-8">
              <p className="text-[#B4ED57] text-xs font-bold mb-2">WHAT'S NEXT?</p>
              <p className="text-white/80 text-sm">
                Our judges will evaluate all presentations. Shortlisted teams will be announced shortly. 
                Keep checking your dashboard for updates!
              </p>
            </div>

            <button
              onClick={handleProceed}
              className="w-full py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all"
            >
              Check Shortlist Results →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
