import React, { createContext, useContext, useState, useEffect } from "react";

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

  const createTeam = (teamName, members = []) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setTeamData({
      id: `team_${Date.now()}`,
      name: teamName,
      leader: currentUser,
      members: [currentUser, ...members],
      createdAt: new Date(),
    });
    setTeamInviteCode(code);
    setIsTeamLeader(true);
    setTeamId(`team_${Date.now()}`);
    console.log(`[SIMULATED EMAIL] Team created with code: ${code}`);
    navigateTo("teamManagement");
  };

  const joinTeamWithCode = (code) => {
    setTeamData((prev) => ({
      ...prev,
      members: [...(prev?.members || []), currentUser],
    }));
    console.log(`[SIMULATED EMAIL] Team is complete and ready to proceed!`);
    navigateTo("teamManagement");
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

  const saveProblemsPreference = (problems) => {
    setSelectedProblems(problems);
    setAllocatedProblem(problems[0]);
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
