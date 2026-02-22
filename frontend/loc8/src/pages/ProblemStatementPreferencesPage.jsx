import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

export default function ProblemStatementPreferencesPage() {
  const { selectedHackathon, teamData, saveProblemsPreference, proceedToNextPhase, fetchProblemStatements } = useApp();

  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState([]);

  useEffect(() => {
    const loadPS = async () => {
      if (!selectedHackathon?.id) {
        setLoading(false);
        return;
      }
      const result = await fetchProblemStatements(selectedHackathon.id);
      if (result?.success) {
        setDomains(result.data.domains || []);
      } else {
        setError(result?.message || "Cannot load problem statements");
      }
      setLoading(false);
    };
    loadPS();
  }, [selectedHackathon?.id]);

  // Flatten domains into a list of selectable problems
  const allProblems = domains.flatMap((domain) =>
    (domain.problems || []).map((title, idx) => ({
      id: `${domain.id || domain.name}-${idx}`,
      domain: domain.name,
      title,
    }))
  );

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-white/40">Loading problem statements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <p className="text-5xl mb-4">🔒</p>
          <h2 className="text-2xl font-bold mb-2">Problem Statements Not Available</h2>
          <p className="text-white/40">{error}</p>
        </div>
      </div>
    );
  }

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

          {/* Domain sections */}
          {domains.map((domain) => (
            <div key={domain.id || domain.name} className="mb-6">
              <h3 className="text-[#B4ED57] text-xs font-bold uppercase tracking-widest mb-3">{domain.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(domain.problems || []).map((title, idx) => {
                  const problemId = `${domain.id || domain.name}-${idx}`;
                  const isSelected = preferences.find((p) => p.id === problemId);
                  const rank = preferences.findIndex((p) => p.id === problemId) + 1;

                  return (
                    <button
                      key={problemId}
                      onClick={() => togglePreference({ id: problemId, domain: domain.name, title })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected
                        ? "bg-[#B4ED57]/10 border-[#B4ED57]"
                        : "bg-white/5 border-white/10 hover:border-[#B4ED57]/40"
                        }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-white font-bold text-sm">{title}</p>
                        {isSelected && (
                          <span className="bg-[#B4ED57] text-black text-xs font-bold px-2 py-1 rounded-full ml-2">
                            #{rank}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

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
