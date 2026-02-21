import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function ProblemStatementPreferencesPage() {
  const { selectedHackathon, teamData, saveProblemsPreference, proceedToNextPhase } = useApp();

  // Mock problem statements
  const mockProblems = [
    { id: "p1", domain: "AI/ML", title: "Optimize Image Recognition", difficulty: "Hard" },
    { id: "p2", domain: "AI/ML", title: "Build Chatbot", difficulty: "Medium" },
    { id: "p3", domain: "Web Dev", title: "Create Real-time Dashboard", difficulty: "Hard" },
    { id: "p4", domain: "Web Dev", title: "Build Todo App with APIs", difficulty: "Easy" },
    { id: "p5", domain: "Blockchain", title: "Smart Contract Audit", difficulty: "Hard" },
    { id: "p6", domain: "Blockchain", title: "Build DeFi Protocol", difficulty: "Very Hard" },
  ];

  const [preferences, setPreferences] = useState([]);

  const togglePreference = (problem) => {
    setPreferences((prev) => {
      const exists = prev.find((p) => p.id === problem.id);
      if (exists) {
        return prev.filter((p) => p.id !== problem.id);
      } else if (prev.length < 3) {
        return [...prev, problem];
      }
      return prev;
    });
  };

  const handleSubmit = () => {
    if (preferences.length === 0) {
      alert("Please select at least one problem");
      return;
    }
    saveProblemsPreference(preferences);
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
          <h1 className="text-4xl font-black italic mb-2">PROBLEM SELECTION</h1>
          <p className="text-white/40">
            Choose your preferred problem statements for <span className="text-[#B4ED57] font-bold">{selectedHackathon?.name}</span>
          </p>
          <p className="text-white/60 text-sm mt-2">Team: {teamData?.name}</p>
        </div>

        <div className={cardCls}>
          <h2 className="text-xl font-bold mb-2">Available Problem Statements</h2>
          <p className="text-white/60 text-sm mb-6">Select up to 3 problems in order of preference</p>

          {/* Problems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {mockProblems.map((problem) => {
              const isSelected = preferences.find((p) => p.id === problem.id);
              const rank = preferences.findIndex((p) => p.id === problem.id) + 1;

              return (
                <button
                  key={problem.id}
                  onClick={() => togglePreference(problem)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? "bg-[#B4ED57]/10 border-[#B4ED57]"
                      : "bg-white/5 border-white/10 hover:border-[#B4ED57]/40"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-white/60 text-xs mb-1">{problem.domain}</p>
                      <p className="text-white font-bold">{problem.title}</p>
                    </div>
                    {isSelected && (
                      <span className="bg-[#B4ED57] text-black text-xs font-bold px-2 py-1 rounded-full ml-2">
                        #{rank}
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-xs">Difficulty: {problem.difficulty}</p>
                </button>
              );
            })}
          </div>

          {/* Selected Problems */}
          {preferences.length > 0 && (
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <p className="text-white/60 text-xs mb-3">Your Preferences</p>
              <div className="space-y-2">
                {preferences.map((p, idx) => (
                  <div key={p.id} className="flex justify-between items-center">
                    <span className="text-white text-sm">
                      #{idx + 1} - {p.title}
                    </span>
                    <span className="text-[#B4ED57] text-xs">{p.domain}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={preferences.length === 0}
            className="w-full py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] disabled:opacity-50 text-black font-bold rounded-xl transition-all"
          >
            Submit Preferences →
          </button>
        </div>
      </div>
    </div>
  );
}
