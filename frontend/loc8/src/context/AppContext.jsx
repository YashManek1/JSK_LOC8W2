import React, { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentPage, setCurrentPage] = useState("landing");
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // login | signup
  const [currentUser, setCurrentUser] = useState(null);
  const [generatedQR, setGeneratedQR] = useState(null);
  const [qrScanned, setQrScanned] = useState(false);

  const navigateTo = (page) => setCurrentPage(page);

  const selectHackathon = (hackathon) => {
    setSelectedHackathon(hackathon);
    setCurrentPage("auth");
  };

  const loginUser = (user) => {
    setCurrentUser(user);
    if (user.role === "student") {
      // Generate QR for student
      const qr = `HACKOS-${user.hackathonId}-${user.id}-${Date.now()}`;
      setGeneratedQR(qr);
      setCurrentPage("qr");
    } else if (user.role === "admin" || user.role === "organiser") {
      setCurrentPage("adminDashboard");
    } else if (user.role === "judge") {
      setCurrentPage("judgeDashboard");
    }
  };

  const scanQR = () => {
    setQrScanned(true);
    setCurrentPage("studentDashboard");
  };

  const logout = () => {
    setCurrentUser(null);
    setGeneratedQR(null);
    setQrScanned(false);
    setSelectedHackathon(null);
    setCurrentPage("landing");
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
        navigateTo,
        selectHackathon,
        setAuthMode,
        loginUser,
        scanQR,
        logout,
        setSelectedHackathon,
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