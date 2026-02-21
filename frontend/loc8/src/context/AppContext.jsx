import React, { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Navigation: Starts at 'auth' now
  const [currentPage, setCurrentPage] = useState("auth"); 
  const [authMode, setAuthMode] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  
  // New States for your workflow
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [teamJoined, setTeamJoined] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  const [generatedQR, setGeneratedQR] = useState(null);

  const navigateTo = (page) => setCurrentPage(page);

  const loginUser = (user) => {
    setCurrentUser(user);
    if (user.role === "student") {
      // Check if profile is complete (simulated)
      navigateTo(isProfileComplete ? "landing" : "completeProfile");
    } else if (user.role === "admin" || user.role === "organiser") {
      navigateTo("adminHackathons"); // New landing for admins
    } else if (user.role === "judge") {
      navigateTo("judgeDashboard");
    }
  };

  const completeProfile = () => {
    setIsProfileComplete(true);
    navigateTo("landing");
  };

  const joinTeam = () => {
    setTeamJoined(true);
    // Only generate QR once team is ready
    setGeneratedQR(`HACKOS-TEAM-READY-${Date.now()}`);
  };

  const scanQR = () => {
    setQrScanned(true);
    navigateTo("studentDashboard");
  };

  const logout = () => {
    setCurrentUser(null);
    setSelectedHackathon(null);
    setIsProfileComplete(false);
    setTeamJoined(false);
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
        teamJoined,
        navigateTo,
        setAuthMode,
        loginUser,
        completeProfile,
        joinTeam,
        scanQR,
        logout,
        setSelectedHackathon,
        setCurrentUser,
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