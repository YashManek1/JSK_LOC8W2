import React, { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Navigation: Starts at 'auth' now
  const [currentPage, setCurrentPage] = useState("auth"); 
  const [authMode, setAuthMode] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  
  // Profile and Team States
  const [isProfileComplete, setIsProfileComplete] = useState(false);
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

  const loginUser = (user) => {
    setCurrentUser(user);
    if (user.role === "student") {
      navigateTo(isProfileComplete ? "hackathonSelection" : "completeProfile");
    } else if (user.role === "admin" || user.role === "organiser") {
      navigateTo("adminHackathons");
    } else if (user.role === "judge") {
      navigateTo("judgeDashboard");
    }
  };

  const completeProfile = () => {
    setIsProfileComplete(true);
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
    const phases = ["teamFormation", "problemSelection", "pptRound1", "shortlist", "qrGeneration"];
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

  const logout = () => {
    setCurrentUser(null);
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
        loginUser,
        completeProfile,
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