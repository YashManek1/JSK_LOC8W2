import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { createTeam as createTeamAPI, joinTeam as joinTeamAPI, registerSolo } from "../api";

export default function TeamManagementPage() {
  const { selectedHackathon, currentUser, teamData, teamInviteCode, isTeamLeader, createTeam, joinTeamWithCode, proceedToNextPhase } = useApp();
  const [mode, setMode] = useState(null); // null, "create", "join", or "solo"
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setError("Please enter a team name");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const data = await createTeamAPI(selectedHackathon?.id, teamName);
      
      if (data.inviteCode) {
        // Update local state with team data
        createTeam(teamName);
      } else {
        setError(data.message || "Failed to create team");
      }
    } catch (err) {
      console.error("Create team error:", err);
      setError(err.message || "An error occurred while creating the team");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) {
      setError("Please enter the team code");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const data = await joinTeamAPI(joinCode, selectedHackathon?.id);
      
      if (data.team) {
        // Update local state with team data
        joinTeamWithCode(joinCode);
      } else {
        setError(data.message || "Failed to join team");
      }
    } catch (err) {
      console.error("Join team error:", err);
      setError(err.message || "An error occurred while joining the team");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSolo = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await registerSolo(selectedHackathon?.id);
      
      if (data.team) {
        // Update local state with solo registration
        createTeam(`Solo - ${currentUser?.name}`);
      } else {
        setError(data.message || "Failed to register as solo");
      }
    } catch (err) {
      console.error("Register solo error:", err);
      setError(err.message || "An error occurred while registering");
    } finally {
      setLoading(false);
    }
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
          <>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-6">
                {error}
              </div>
            )}
          
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      disabled={loading}
                    />
                    <button onClick={handleCreateTeam} className={buttonCls} disabled={loading}>
                      {loading ? "Creating..." : "Create Team"}
                    </button>
                    <button onClick={() => { setMode(null); setTeamName(""); setError(""); }} className="w-full py-3 border border-white/10 rounded-xl text-white/60 hover:text-white" disabled={loading}>
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
                      disabled={loading}
                    />
                    <button onClick={handleJoinTeam} className={buttonCls} disabled={loading}>
                      {loading ? "Joining..." : "Join Team"}
                    </button>
                    <button onClick={() => { setMode(null); setJoinCode(""); setError(""); }} className="w-full py-3 border border-white/10 rounded-xl text-white/60 hover:text-white" disabled={loading}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Register Solo */}
              <div className={cardCls}>
                <h2 className="text-2xl font-bold mb-4">Go Solo</h2>
                <p className="text-white/60 text-sm mb-4">
                  Prefer to work alone? Register as a solo participant.
                </p>
                {mode !== "solo" ? (
                  <button onClick={() => setMode("solo")} className={buttonCls}>
                    Register Solo →
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-[#B4ED57]/10 border border-[#B4ED57]/30 rounded-xl p-4 text-sm text-white/80">
                      You'll compete individually in this hackathon.
                    </div>
                    <button onClick={handleRegisterSolo} className={buttonCls} disabled={loading}>
                      {loading ? "Registering..." : "Confirm Solo Registration"}
                    </button>
                    <button onClick={() => { setMode(null); setError(""); }} className="w-full py-3 border border-white/10 rounded-xl text-white/60 hover:text-white" disabled={loading}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
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
