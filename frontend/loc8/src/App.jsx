import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import QRPage from "./pages/QRPage";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import JudgeDashboard from "./pages/JudgeDashboard";

function Router() {
  const { currentPage } = useApp();

  const pages = {
    landing: <LandingPage />,
    auth: <AuthPage />,
    qr: <QRPage />,
    studentDashboard: <StudentDashboard />,
    adminDashboard: <AdminDashboard />,
    judgeDashboard: <JudgeDashboard />,
  };

  return pages[currentPage] || <LandingPage />;
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}