import React from "react";
import { useApp } from "../context/AppContext";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";

export default function AuthPage() {
  const { authMode, setAuthMode, selectedHackathon, navigateTo } = useApp();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 via-transparent to-lime-900/10" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-lime-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back */}
        <button
          onClick={() => navigateTo("landing")}
          className="mb-6 text-white/40 hover:text-white text-sm flex items-center gap-2 transition-colors"
        >
          ← Back to Hackathons
        </button>

        {/* Card */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
          {/* Hackathon Badge */}
          {selectedHackathon && (
            <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <img src={selectedHackathon.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">{selectedHackathon.name}</div>
                <div className="text-white/40 text-xs">{selectedHackathon.dates} · {selectedHackathon.location}</div>
              </div>
            </div>
          )}

          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center">
              <span className="text-black font-black text-xs">H</span>
            </div>
            <span className="text-white font-black tracking-widest text-sm">HACKOS</span>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                authMode === "login"
                  ? "bg-lime-400 text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode("signup")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                authMode === "signup"
                  ? "bg-lime-400 text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <h2 className="text-white text-xl font-bold mb-1">
            {authMode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-white/40 text-sm mb-6">
            {authMode === "login"
              ? "Sign in to access your hackathon dashboard"
              : "Join the hackathon and start building"}
          </p>

          {authMode === "login" ? <LoginForm /> : <SignupForm />}
        </div>
      </div>
    </div>
  );
}