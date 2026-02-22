import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Auth: Restore token & user from localStorage on mount
  const [token, setTokenState] = useState(() =>
    localStorage.getItem("accessToken"),
  );
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch {
      return null;
    }
  });

  // Always start on the auth (signup/login) page.
  // Post-login navigation is handled by loginUser().
  const [currentPage, setCurrentPage] = useState("auth");
  const [authMode, setAuthMode] = useState("login");
  const [selectedHackathon, setSelectedHackathon] = useState(null);

  // Profile and Team States
  const [isProfileComplete, setIsProfileComplete] = useState(
    () => localStorage.getItem("isProfileComplete") === "true",
  );
  const [teamId, setTeamId] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [teamInviteCode, setTeamInviteCode] = useState(null);
  const [isTeamLeader, setIsTeamLeader] = useState(false);

  // Hackathon Workflow States
  const [hackathonPhase, setHackathonPhase] = useState("teamFormation");
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [allocatedProblem, setAllocatedProblem] = useState(null);
  const [pptScore, setPptScore] = useState(null);
  const [isShortlisted, setIsShortlisted] = useState(null);
  const [qrScanned, setQrScanned] = useState(false);
  const [generatedQR, setGeneratedQR] = useState(null);

  const navigateTo = (page) => setCurrentPage(page);

  // Persist token helper
  const setToken = (t) => {
    if (t) {
      localStorage.setItem("accessToken", t);
    } else {
      localStorage.removeItem("accessToken");
    }
    setTokenState(t);
  };

  const loginUser = (user, accessToken) => {
    // Store user & token in state + localStorage
    if (accessToken) setToken(accessToken);
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));

    if (user.role === "student" || user.role === "Participant") {
      if (isProfileComplete) {
        navigateTo("hackathonSelection");
      } else {
        // Only send to voice session if they haven't done it yet
        const voiceData = localStorage.getItem("voiceExtractedData");
        navigateTo(voiceData ? "completeProfile" : "voiceProfile");
      }
    } else if (user.role === "admin" || user.role === "organiser") {
      navigateTo("adminHackathons");
    } else if (user.role === "judge") {
      navigateTo("judgeDashboard");
    }
  };

  const completeProfile = () => {
    setIsProfileComplete(true);
    localStorage.setItem("isProfileComplete", "true");
    navigateTo("hackathonSelection");
  };

  const selectHackathon = (hackathon) => {
    setSelectedHackathon(hackathon);
    navigateTo("teamManagement");
  };

  const createTeam = async (teamName, dynamicAnswers = {}) => {
    if (!selectedHackathon?.id) {
      alert("No hackathon selected");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/registration/team`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          hackathonId: selectedHackathon.id,
          teamName,
          dynamicAnswers,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const team = data.team;
        setTeamData({
          id: team.id,
          name: team.teamName,
          leader: currentUser,
          members: team.participants || [currentUser],
          memberEmails: team.memberEmails || [],
          status: team.status || "INCOMPLETE",
          inviteCode: team.inviteCode,
        });
        setTeamInviteCode(team.inviteCode);
        setIsTeamLeader(true);
        setTeamId(team.id);
      } else {
        alert(data.message || "Failed to create team");
      }
    } catch {
      alert("Network error creating team");
    }
  };

  const joinTeamWithCode = async (code, dynamicAnswers = {}) => {
    try {
      const res = await fetch(`${API_BASE_URL}/registration/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          inviteCode: code,
          dynamicAnswers,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const team = data.team;
        setTeamData({
          id: team.id,
          name: team.teamName,
          leader: team.participants?.[0] || null,
          members: team.participants || [],
          memberEmails: team.memberEmails || [],
          status: team.status || "REGISTERED",
          inviteCode: team.inviteCode,
        });
        setTeamId(team.id);
        setTeamInviteCode(team.inviteCode || code);
        setIsTeamLeader(false);
      } else {
        alert(data.message || "Failed to join team");
      }
    } catch {
      alert("Network error joining team");
    }
  };

  const registerSolo = async (dynamicAnswers = {}) => {
    if (!selectedHackathon?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/registration/solo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          hackathonId: selectedHackathon.id,
          dynamicAnswers,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to register solo" };
      }
    } catch {
      return { success: false, message: "Network error" };
    }
  };

  const fetchCommunityPool = async (hackathonId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/registration/community/${hackathonId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        // API returns array of { id, status, participant: { id, fullName, ... } }
        return Array.isArray(data) ? data : [];
      }
      return [];
    } catch {
      return [];
    }
  };

  const updateTeamName = async (newName) => {
    if (!teamId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/registration/team/${teamId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ teamName: newName }),
      });
      const data = await res.json();
      if (res.ok) {
        setTeamData((prev) => ({ ...prev, name: newName }));
        return { success: true };
      } else {
        return { success: false, message: data.message || "Failed to update" };
      }
    } catch {
      return { success: false, message: "Network error" };
    }
  };

  const deleteTeam = async () => {
    if (!teamId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/registration/team/${teamId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setTeamData(null);
        setTeamId(null);
        setTeamInviteCode(null);
        setIsTeamLeader(false);
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, message: data.message || "Failed to delete" };
      }
    } catch {
      return { success: false, message: "Network error" };
    }
  };

  const inviteSoloToTeam = async (userId) => {
    if (!teamId) return { success: false, message: "No team found" };
    try {
      const res = await fetch(`${API_BASE_URL}/registration/invite/${teamId}/${userId}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        const team = data.team;
        if (team) {
          setTeamData((prev) => ({
            ...prev,
            members: team.participants || prev.members,
            status: team.status || prev.status,
          }));
        }
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || "Failed to invite" };
      }
    } catch {
      return { success: false, message: "Network error" };
    }
  };

  const finalizeTeam = async () => {
    if (!teamId) return { success: false, message: "No team found" };
    try {
      const res = await fetch(`${API_BASE_URL}/registration/team/finalize/${teamId}`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        const team = data.team;
        if (team) {
          setTeamData((prev) => ({
            ...prev,
            status: team.status || "REGISTERED",
            members: team.participants || prev.members,
          }));
        }
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || "Failed to finalize" };
      }
    } catch {
      return { success: false, message: "Network error" };
    }
  };

  const fetchProblemStatements = async (hackathonId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/ps/${hackathonId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Cannot access problem statements" };
      }
    } catch {
      return { success: false, message: "Network error" };
    }
  };

  const subscribePush = async (subscription) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(subscription),
      });
      const data = await res.json();
      return res.ok ? { success: true } : { success: false, message: data.message };
    } catch {
      return { success: false, message: "Network error" };
    }
  };

  const proceedToNextPhase = () => {
    const phases = [
      "teamFormation",
      "problemSelection",
      "pptRound1",
      "shortlist",
      "qrGeneration",
    ];
    const idx = phases.indexOf(hackathonPhase);
    if (idx < phases.length - 1) {
      const nextPhase = phases[idx + 1];
      setHackathonPhase(nextPhase);
      navigateToPhase(nextPhase);
    }
  };

  const navigateToPhase = (phase) => {
    if (phase === "problemSelection") navigateTo("problemStatementPreferences");
    else if (phase === "pptRound1") navigateTo("pptRound1");
    else if (phase === "shortlist") navigateTo("shortlistAnnouncement");
    else if (phase === "qrGeneration") navigateTo("qr");
  };

  const saveProblemsPreference = async (problems) => {
    setSelectedProblems(problems);
    setAllocatedProblem(problems[0]);

    // Persist preferences to backend
    if (selectedHackathon?.id) {
      try {
        const preferenceIds = problems.map((p) => p.id);
        const res = await fetch(`${API_BASE_URL}/ps/${selectedHackathon.id}/preferences`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ preferences: preferenceIds }),
        });
        const data = await res.json();
        if (!res.ok) {
          console.error("Failed to save preferences:", data.message);
        }
      } catch (err) {
        console.error("Network error saving preferences:", err);
      }
    }
  };

  const scanQR = () => {
    setQrScanned(true);
    navigateTo("studentDashboard");
  };

  const completeIdentityVerification = () => {
    // After identity verification, proceed to complete profile
    navigateTo("completeProfile");
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isProfileComplete");
    localStorage.removeItem("voiceExtractedData");
    setSelectedHackathon(null);
    setIsProfileComplete(false);
    setTeamId(null);
    setTeamData(null);
    setTeamInviteCode(null);
    setIsTeamLeader(false);
    setHackathonPhase("teamFormation");
    setSelectedProblems([]);
    setAllocatedProblem(null);
    setQrScanned(false);
    setCurrentPage("auth");
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        selectedHackathon,
        authMode,
        currentUser,
        token,
        generatedQR,
        qrScanned,
        isProfileComplete,
        teamId,
        teamData,
        teamInviteCode,
        isTeamLeader,
        hackathonPhase,
        selectedProblems,
        allocatedProblem,
        pptScore,
        isShortlisted,
        navigateTo,
        setAuthMode,
        setToken,
        loginUser,
        completeProfile,
        completeIdentityVerification,
        selectHackathon,
        createTeam,
        joinTeamWithCode,
        registerSolo,
        fetchCommunityPool,
        updateTeamName,
        deleteTeam,
        inviteSoloToTeam,
        finalizeTeam,
        fetchProblemStatements,
        subscribePush,
        proceedToNextPhase,
        saveProblemsPreference,
        setPptScore,
        setIsShortlisted,
        scanQR,
        logout,
        setSelectedHackathon,
        setCurrentUser,
        setHackathonPhase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
