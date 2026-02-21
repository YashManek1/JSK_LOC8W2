import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import QRPage from "./pages/QRPage";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import JudgeDashboard from "./pages/JudgeDashboard";
// You will create these next:
import CompleteProfilePage from "./pages/CompleteProfilePage"; 
import AdminHackathonsPage from "./pages/AdminHackathonsPage";

function Router() {
  const { currentPage } = useApp();

  const pages = {
    auth: <AuthPage />,
    completeProfile: <CompleteProfilePage />,
    landing: <LandingPage />,
    qr: <QRPage />,
    studentDashboard: <StudentDashboard />,
    adminHackathons: <AdminHackathonsPage />,
    adminDashboard: <AdminDashboard />,
    judgeDashboard: <JudgeDashboard />,
  };

  return pages[currentPage] || <AuthPage />;
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}