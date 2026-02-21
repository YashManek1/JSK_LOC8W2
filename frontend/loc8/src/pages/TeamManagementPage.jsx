import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function TeamManagementPage() {
  const { selectedHackathon, currentUser, teamData, teamInviteCode, isTeamLeader, createTeam, joinTeamWithCode, proceedToNextPhase } = useApp();
  const [mode, setMode] = useState(null); // null, "create", or "join"
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      alert("Please enter a team name");
      return;
    }
    createTeam(teamName);
    setTeamName("");
  };

  const handleJoinTeam = () => {
    if (!joinCode.trim()) {
      alert("Please enter the team code");
      return;
    }
    joinTeamWithCode(joinCode);
    setJoinCode("");
  };

  const cardCls = "bg-[#111] border border-white/10 rounded-2xl p-8";
  const buttonCls = "w-full py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all";

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
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30"
                  />
                  <button onClick={handleCreateTeam} className={buttonCls}>
                    Create Team
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30"
                  />
                  <button onClick={handleJoinTeam} className={buttonCls}>
                    Join Team
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
            <h2 className="text-2xl font-bold mb-4">✓ Team Created</h2>
            <div className="space-y-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-1">Team Name</p>
                <p className="text-white font-bold text-lg">{teamData.name}</p>
              </div>
              {isTeamLeader && (
                <div className="bg-[#B4ED57]/10 border border-[#B4ED57]/30 rounded-xl p-4">
                  <p className="text-[#B4ED57] text-xs mb-1">INVITE CODE</p>
                  <p className="text-white font-mono text-2xl font-bold">{teamInviteCode}</p>
                  <p className="text-white/50 text-xs mt-2">Share this code with your teammates</p>
                </div>
              )}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-2">TEAM MEMBERS ({teamData.members.length})</p>
                <div className="space-y-2">
                  {teamData.members.map((member, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-white text-sm">{member.name || member.email}</span>
                      {idx === 0 && <span className="text-[#B4ED57] text-xs font-bold">LEADER</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={proceedToNextPhase}
              className={buttonCls}
            >
              Proceed to Problem Selection →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
