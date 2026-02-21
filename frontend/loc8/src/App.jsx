import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import QRPage from "./pages/QRPage";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import JudgeDashboard from "./pages/JudgeDashboard";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import AdminHackathonsPage from "./pages/AdminHackathonsPage";
import HackathonSelectionPage from "./pages/HackathonSelectionPage";
import TeamManagementPage from "./pages/TeamManagementPage";
import ProblemStatementPreferencesPage from "./pages/ProblemStatementPreferencesPage";
import PPTRound1Page from "./pages/PPTRound1Page";
import ShortlistAnnouncementPage from "./pages/ShortlistAnnouncementPage";
import CommunityPage from "./pages/CommunityPage";
import GeminiLivePage from "./pages/GeminiLivePage";

function Router() {
  const { currentPage } = useApp();

  const pages = {
    auth: <AuthPage />,
    voiceProfile: <GeminiLivePage />,
    completeProfile: <CompleteProfilePage />,
    hackathonSelection: <HackathonSelectionPage />,
    teamManagement: <TeamManagementPage />,
    problemStatementPreferences: <ProblemStatementPreferencesPage />,
    pptRound1: <PPTRound1Page />,
    shortlistAnnouncement: <ShortlistAnnouncementPage />,
    community: <CommunityPage />,
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
