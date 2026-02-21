import React from "react";
import { useApp } from "../../context/AppContext";

export default function Navbar() {
  const { currentUser, logout, navigateTo } = useApp();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#0a0a0a]/80 backdrop-blur-md" style={{ fontFamily: "'Fustat', sans-serif" }}>
      {/* Logo */}
      <button
        onClick={() => navigateTo("landing")}
        className="flex items-center gap-2 group"
      >
        <div className="w-9 h-9 rounded-lg bg-[#B4ED57] flex items-center justify-center">
          <span className="text-black font-black text-sm">H</span>
        </div>
        <div>
          <div className="text-white font-black text-lg tracking-widest leading-none">HACKOS</div>
          <div className="text-white/40 text-[9px] tracking-widest uppercase">Smart Hackathon System</div>
        </div>
      </button>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        <button onClick={() => navigateTo("landing")} className="text-white/70 hover:text-white text-sm transition-colors">Hackathons</button>
        <a href="#features" className="text-white/70 hover:text-white text-sm transition-colors">Features</a>
        <a href="#about" className="text-white/70 hover:text-white text-sm transition-colors">About</a>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-3">
        {currentUser ? (
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-sm">
              Hi, <span className="text-[#B4ED57] font-semibold">{currentUser.name?.split(" ")[0]}</span>
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-white/70 hover:text-white border border-white/20 rounded-full transition-all hover:border-white/40"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => navigateTo("auth")}
              className="px-4 py-2 text-sm text-white/80 hover:text-white border border-white/20 rounded-full transition-all hover:border-white/40"
            >
              ↩ Login
            </button>
            <button
              onClick={() => navigateTo("auth")}
              className="px-4 py-2 text-sm text-black font-semibold bg-[#B4ED57] hover:bg-[#c5f278] rounded-full transition-all"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}