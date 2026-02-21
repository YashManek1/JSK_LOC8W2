import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function AdminHackathonsPage() {
  const { navigateTo, setSelectedHackathon } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
    poster: null,
    sponsors: "",
    sponsorLogos: null,
    prizePool: "",
    totalTeams: "",
    teamSize: "3",
    totalRemoteTeams: "",
    totalOfflineTeams: "",
    rooms: "",
    labs: "",
    teamsPerRoom: "",
    teamsPerLab: "",
    mapUrl: "",
    totalDomains: "",
    problemsPerDomain: "",
    problemStatementsText: "",
    timeline: "",
    rules: "",
    ndaRequired: false,
  });

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handlePublish = () => {
    // For now just log the form and close the modal — persistence can be added later
    const prepared = {
      ...form,
      sponsors: form.sponsors.split("\n").map((s) => s.trim()).filter(Boolean),
      problemStatements: form.problemStatementsText.split("\n").map((p) => p.trim()).filter(Boolean),
    };
    console.log("Publishing hackathon:", prepared);
    setShowCreateForm(false);
  };

  const myHackathons = [
    { id: 'h1', name: 'HackOS 2025', date: 'Oct 12', status: 'Completed' },
    { id: 'h2', name: 'Loc8 2026', date: 'Feb 20', status: 'Active' },
  ];

  const handleEnterDashboard = (hack) => {
    setSelectedHackathon(hack);
    navigateTo("adminDashboard");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black italic">MY HACKATHONS</h1>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-lime-400 text-black font-bold rounded-xl hover:scale-105 transition-transform"
          >
            + Create New Hackathon
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myHackathons.map(hack => (
            <div key={hack.id} className="bg-[#111] border border-white/10 p-6 rounded-2xl hover:border-lime-400/50 transition-colors">
              <h3 className="text-xl font-bold mb-1">{hack.name}</h3>
              <p className="text-white/40 text-sm mb-6">{hack.date} · {hack.status}</p>
              <button 
                onClick={() => handleEnterDashboard(hack)}
                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold transition-colors"
              >
                Manage Hackathon →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-[#111] border border-white/10 w-full max-w-3xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create Hackathon</h2>

            <div className="space-y-4 mb-4">
              <input value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" placeholder="Hackathon Name" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={form.startDate} onChange={(e) => update('startDate', e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-3" placeholder="Start Date" type="date" />
                <input value={form.endDate} onChange={(e) => update('endDate', e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-3" placeholder="End Date" type="date" />
              </div>

              <input value={form.location} onChange={(e) => update('location', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" placeholder="Location (venue/address)" />

              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" placeholder="Short description" rows={3} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-white/60 mb-2 block">Poster (optional)</label>
                <input type="file" accept="image/*" onChange={(e) => update('poster', e.target.files[0] || null)} className="w-full text-sm text-white/60" />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-2 block">Sponsors (one per line)</label>
                <textarea value={form.sponsors} onChange={(e) => update('sponsors', e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" placeholder="Sponsor A\nSponsor B" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input value={form.prizePool} onChange={(e) => update('prizePool', e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-3" placeholder="Prize Pool (e.g. ₹1,00,000)" />
              <input value={form.totalTeams} onChange={(e) => update('totalTeams', e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-3" placeholder="Total number of teams" type="number" />
              <select value={form.teamSize} onChange={(e) => update('teamSize', e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <option value="3">Team Size: 3</option>
                <option value="4">Team Size: 4</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input value={form.totalRemoteTeams} onChange={(e) => update('totalRemoteTeams', e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-3" placeholder="Total remote teams" type="number" />
              <input value={form.totalOfflineTeams} onChange={(e) => update('totalOfflineTeams', e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-3" placeholder="Total offline teams" type="number" />
              <input value={form.mapUrl} onChange={(e) => update('mapUrl', e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-3" placeholder="Map URL (optional)" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input value={form.rooms} onChange={(e) => update('rooms', e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-3" placeholder="No. of rooms" type="number" />
              <input value={form.labs} onChange={(e) => update('labs', e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-3" placeholder="No. of labs" type="number" />
              <input value={form.teamsPerRoom} onChange={(e) => update('teamsPerRoom', e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-3" placeholder="Teams per room" type="number" />
              <input value={form.teamsPerLab} onChange={(e) => update('teamsPerLab', e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-3" placeholder="Teams per lab" type="number" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input value={form.totalDomains} onChange={(e) => update('totalDomains', e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-3" placeholder="Total domains" type="number" />
              <input value={form.problemsPerDomain} onChange={(e) => update('problemsPerDomain', e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-3" placeholder="Problems per domain" type="number" />
              <input type="file" accept="image/*" onChange={(e) => update('sponsorLogos', e.target.files[0] || null)} className="w-full text-sm text-white/60" />
            </div>

            <div className="mb-4">
              <label className="text-xs text-white/60 mb-2 block">Problem statements (one per line)</label>
              <textarea value={form.problemStatementsText} onChange={(e) => update('problemStatementsText', e.target.value)} rows={5} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" placeholder="Problem 1\nProblem 2" />
            </div>

            <div className="mb-4">
              <label className="text-xs text-white/60 mb-2 block">Timeline (mentor rounds, food, etc.)</label>
              <textarea value={form.timeline} onChange={(e) => update('timeline', e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" placeholder="e.g. Day 1: Registration, Day 1 Evening: Mentor Rounds" />
            </div>

            <div className="mb-4">
              <label className="text-xs text-white/60 mb-2 block">Rules & Regulations (include GitHub commit intervals, repo format, T&C)</label>
              <textarea value={form.rules} onChange={(e) => update('rules', e.target.value)} rows={5} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" placeholder="- Commits every X hours\n- Repo format: org/repo-name" />
            </div>

            <div className="flex items-center gap-4 mb-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.ndaRequired} onChange={(e) => update('ndaRequired', e.target.checked)} />
                <span className="text-white/60 text-sm">Require NDA</span>
              </label>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowCreateForm(false)} className="flex-1 py-3 border border-white/10 rounded-xl font-bold text-white/60">Cancel</button>
              <button onClick={handlePublish} className="flex-1 py-3 bg-lime-400 text-black rounded-xl font-bold">Publish Hackathon</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}