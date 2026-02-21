import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import Sidebar from "../components/layout/Sidebar";

const PROJECTS = [
  { id: "p1", name: "HealthTrack ML", team: "404 Found", track: "AI/ML", scores: { innovation: 0, feasibility: 0, techDepth: 0, clarity: 0, impact: 0 }, submitted: true },
  { id: "p2", name: "DefiVault", team: "ChainHackers", track: "Web3", scores: { innovation: 0, feasibility: 0, techDepth: 0, clarity: 0, impact: 0 }, submitted: true },
  { id: "p3", name: "SmartHome Hub", team: "IoTSquad", track: "IoT", scores: { innovation: 0, feasibility: 0, techDepth: 0, clarity: 0, impact: 0 }, submitted: false },
];

function ScoreSlider({ label, value, max, onChange }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="text-lime-400 font-bold">{value} / {max}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-lime-400"
      />
    </div>
  );
}

export default function JudgeDashboard() {
  const { currentUser, selectedHackathon } = useApp();
  const [activeSection, setActiveSection] = useState("projects");
  const [projects, setProjects] = useState(PROJECTS);
  const [selectedProject, setSelectedProject] = useState(null);
  const [saved, setSaved] = useState({});

  const updateScore = (projectId, key, value) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, scores: { ...p.scores, [key]: value } } : p
      )
    );
  };

  const saveScores = (projectId) => {
    setSaved((prev) => ({ ...prev, [projectId]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [projectId]: false })), 2000);
  };

  const totalScore = (scores) =>
    scores.innovation + scores.feasibility + scores.techDepth + scores.clarity + scores.impact;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} variant="judge" />

      <main className="flex-1 ml-16 md:ml-64 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl font-black">Judge Panel</h1>
            <p className="text-white/40 text-sm mt-0.5">
              {selectedHackathon?.name || "HackOS 2026"} ·{" "}
              <span className="text-lime-400">{currentUser?.name || "Judge"}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-lime-400 text-xs bg-lime-400/10 border border-lime-400/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
            Judging Live
          </div>
        </div>

        {activeSection === "projects" || activeSection === "dashboard" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Project List */}
            <div className="space-y-3">
              <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Projects to Judge</h3>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProject(p.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedProject === p.id
                      ? "bg-lime-400/10 border-lime-400/30"
                      : "bg-[#111] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-white font-semibold text-sm">{p.name}</div>
                      <div className="text-white/40 text-xs mt-0.5">by {p.team}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-white/40 whitespace-nowrap">
                      {p.track}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs ${totalScore(p.scores) > 0 ? "text-lime-400" : "text-white/30"}`}>
                      Score: {totalScore(p.scores)}/100
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.submitted ? "bg-lime-400/10 text-lime-400" : "bg-yellow-400/10 text-yellow-400"}`}>
                      {p.submitted ? "Submitted" : "Pending"}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Scoring Panel */}
            <div className="lg:col-span-2">
              {selectedProject ? (() => {
                const project = projects.find((p) => p.id === selectedProject);
                return (
                  <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-white text-xl font-bold">{project.name}</h2>
                        <p className="text-white/40 text-sm">Team: {project.team} · {project.track}</p>
                      </div>
                      <span className="text-lime-400 text-3xl font-black">{totalScore(project.scores)}<span className="text-lg text-white/30">/100</span></span>
                    </div>

                    <div className="space-y-5 mb-6">
                      <ScoreSlider label="Innovation" max={20} value={project.scores.innovation} onChange={(v) => updateScore(project.id, "innovation", v)} />
                      <ScoreSlider label="Feasibility" max={20} value={project.scores.feasibility} onChange={(v) => updateScore(project.id, "feasibility", v)} />
                      <ScoreSlider label="Tech Depth" max={25} value={project.scores.techDepth} onChange={(v) => updateScore(project.id, "techDepth", v)} />
                      <ScoreSlider label="Clarity & Presentation" max={20} value={project.scores.clarity} onChange={(v) => updateScore(project.id, "clarity", v)} />
                      <ScoreSlider label="Impact" max={15} value={project.scores.impact} onChange={(v) => updateScore(project.id, "impact", v)} />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => saveScores(project.id)}
                        className="flex-1 py-3 bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-xl transition-all"
                      >
                        {saved[project.id] ? "✓ Saved!" : "Save Scores"}
                      </button>
                    </div>
                  </div>
                );
              })() : (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                  <span className="text-5xl mb-4">⚖️</span>
                  <h3 className="text-white font-bold text-lg mb-2">Select a Project</h3>
                  <p className="text-white/40 text-sm">Choose a project from the list to start judging</p>
                </div>
              )}
            </div>
          </div>
        ) : activeSection === "scoring" ? (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center">
            <span className="text-5xl block mb-4">⭐</span>
            <h3 className="text-white font-bold text-xl mb-2">Scoring Summary</h3>
            <p className="text-white/40 text-sm">All project scores in one view</p>
            <div className="mt-6 space-y-3">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <span className="text-white text-sm">{p.name}</span>
                  <span className={`font-bold ${totalScore(p.scores) > 0 ? "text-lime-400" : "text-white/30"}`}>
                    {totalScore(p.scores)}/100
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center">
            <span className="text-5xl block mb-4">📊</span>
            <h3 className="text-white font-bold text-xl">Results Panel</h3>
            <p className="text-white/40 text-sm mt-2">Final results visible after judging closes</p>
          </div>
        )}
      </main>
    </div>
  );
}