import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function TeamManagementPage() {
  const {
    selectedHackathon, currentUser, teamData, teamInviteCode,
    isTeamLeader, createTeam, joinTeamWithCode,
    updateTeamName, deleteTeam, finalizeTeam, proceedToNextPhase,
  } = useApp();

  const [mode, setMode] = useState(null); // null, "create", or "join"
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Dynamic answers
  const [githubUrl, setGithubUrl] = useState("");
  const [dietaryPref, setDietaryPref] = useState("Veg");

  // Edit team name
  const [editingName, setEditingName] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  const buildDynamicAnswers = () => ({
    ...(githubUrl.trim() ? { githubUrl: githubUrl.trim() } : {}),
    dietaryPref,
  });

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert("Please enter a team name");
      return;
    }
    setLoading(true);
    await createTeam(teamName, buildDynamicAnswers());
    setLoading(false);
    setTeamName("");
  };

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) {
      alert("Please enter the team code");
      return;
    }
    setLoading(true);
    await joinTeamWithCode(joinCode, buildDynamicAnswers());
    setLoading(false);
    setJoinCode("");
  };

  const handleUpdateName = async () => {
    if (!newTeamName.trim()) return;
    setLoading(true);
    const result = await updateTeamName(newTeamName);
    if (result?.success) {
      setEditingName(false);
      setNewTeamName("");
    } else {
      alert(result?.message || "Failed to update team name");
    }
    setLoading(false);
  };

  const handleDeleteTeam = async () => {
    if (!confirm("Delete this team? All members will be moved to the community pool.")) return;
    setLoading(true);
    const result = await deleteTeam();
    if (!result?.success) {
      alert(result?.message || "Failed to delete team");
    }
    setLoading(false);
  };

  const cardCls = "bg-[#111] border border-white/10 rounded-2xl p-8";
  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-[#B4ED57]/50 transition-colors";
  const buttonCls = "w-full py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all disabled:opacity-50";

  // Dynamic answer fields component
  const DynamicFields = () => (
    <div className="space-y-3 mb-4">
      <div>
        <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-1.5 font-bold">GitHub URL</label>
        <input
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/username"
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-1.5 font-bold">Dietary Preference</label>
        <select value={dietaryPref} onChange={(e) => setDietaryPref(e.target.value)} className={inputCls}>
          <option value="Veg">Veg</option>
          <option value="Non-Veg">Non-Veg</option>
          <option value="Vegan">Vegan</option>
          <option value="No Preference">No Preference</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#B4ED57]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black italic mb-2">TEAM FORMATION</h1>
          <p className="text-white/40">
            Register for <span className="text-[#B4ED57] font-bold">{selectedHackathon?.name}</span>
          </p>
        </div>

        {!teamData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Team */}
            <div className={cardCls}>
              <h2 className="text-2xl font-bold mb-4">Create New Team</h2>
              <p className="text-white/60 text-sm mb-4">
                Be the team leader and invite others to join your team using a unique code.
              </p>
              {mode !== "create" ? (
                <button onClick={() => setMode("create")} className={buttonCls}>
                  Create Team →
                </button>
              ) : (
                <div className="space-y-4">
                  <input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter your team name"
                    className={inputCls}
                  />
                  <DynamicFields />
                  <button onClick={handleCreateTeam} disabled={loading} className={buttonCls}>
                    {loading ? "Creating..." : "Create Team"}
                  </button>
                  <button onClick={() => { setMode(null); setTeamName(""); }} className="w-full py-3 border border-white/10 rounded-xl text-white/60 hover:text-white">
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Join Team */}
            <div className={cardCls}>
              <h2 className="text-2xl font-bold mb-4">Join Existing Team</h2>
              <p className="text-white/60 text-sm mb-4">
                Got an invite code from your team leader? Join their team here.
              </p>
              {mode !== "join" ? (
                <button onClick={() => setMode("join")} className={buttonCls}>
                  Join Team →
                </button>
              ) : (
                <div className="space-y-4">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    className={inputCls}
                  />
                  <DynamicFields />
                  <button onClick={handleJoinTeam} disabled={loading} className={buttonCls}>
                    {loading ? "Joining..." : "Join Team"}
                  </button>
                  <button onClick={() => { setMode(null); setJoinCode(""); }} className="w-full py-3 border border-white/10 rounded-xl text-white/60 hover:text-white">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={cardCls}>
            <h2 className="text-2xl font-bold mb-4">✓ Team {teamData.status === "REGISTERED" ? "Registered" : "Created"}</h2>
            <div className="space-y-4 mb-6">
              {/* Team Name (editable for leader) */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-1">Team Name</p>
                {editingName && isTeamLeader ? (
                  <div className="flex gap-2 mt-1">
                    <input
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder={teamData.name}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <button onClick={handleUpdateName} disabled={loading} className="px-4 py-2 bg-[#B4ED57] text-black text-xs font-bold rounded-lg">
                      {loading ? "..." : "Save"}
                    </button>
                    <button onClick={() => setEditingName(false)} className="px-3 py-2 bg-white/5 text-white/60 text-xs rounded-lg">
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-white font-bold text-lg">{teamData.name}</p>
                    {isTeamLeader && (
                      <button
                        onClick={() => { setEditingName(true); setNewTeamName(teamData.name); }}
                        className="text-white/30 hover:text-[#B4ED57] text-xs transition-colors"
                      >
                        ✏️ Rename
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Status badge */}
              {teamData.status && (
                <div className={`rounded-xl p-3 text-center text-sm font-bold ${teamData.status === "REGISTERED"
                  ? "bg-[#B4ED57]/10 border border-[#B4ED57]/30 text-[#B4ED57]"
                  : "bg-yellow-400/10 border border-yellow-400/30 text-yellow-400"
                  }`}>
                  Status: {teamData.status}
                  {teamData.status === "INCOMPLETE" && " — Waiting for teammates to join"}
                </div>
              )}

              {/* Invite Code */}
              {isTeamLeader && teamInviteCode && (
                <div className="bg-[#B4ED57]/10 border border-[#B4ED57]/30 rounded-xl p-4">
                  <p className="text-[#B4ED57] text-xs mb-1">INVITE CODE</p>
                  <p className="text-white font-mono text-2xl font-bold">{teamInviteCode}</p>
                  <p className="text-white/50 text-xs mt-2">Share this code with your teammates</p>
                </div>
              )}

              {/* Members */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-2">
                  TEAM MEMBERS ({teamData.members?.length || 0})
                </p>
                <div className="space-y-2">
                  {(teamData.members || []).map((member, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-white text-sm">
                        {member.name || member.fullName || member.email || `Member ${idx + 1}`}
                      </span>
                      {idx === 0 && <span className="text-[#B4ED57] text-xs font-bold">LEADER</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {teamData.status === "REGISTERED" ? (
                <button onClick={proceedToNextPhase} className={buttonCls}>
                  Proceed to Problem Selection →
                </button>
              ) : isTeamLeader ? (
                <button
                  onClick={async () => {
                    setLoading(true);
                    const result = await finalizeTeam();
                    if (result?.success) {
                      alert(result.message || "Team finalized!");
                    } else {
                      alert(result?.message || "Cannot finalize yet");
                    }
                    setLoading(false);
                  }}
                  disabled={loading}
                  className="w-full py-3.5 bg-[#4D58D4] hover:bg-[#5a65e0] text-white font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {loading ? "Finalizing..." : "Finalize Team ✓"}
                </button>
              ) : (
                <div className="w-full py-3.5 bg-white/5 border border-white/10 text-white/40 font-bold rounded-xl text-center text-sm">
                  Waiting for leader to finalize the team
                </div>
              )}

              {isTeamLeader && (
                <button
                  onClick={handleDeleteTeam}
                  disabled={loading}
                  className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete Team"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
