import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10 py-10 flex flex-col items-center gap-2" style={{ fontFamily: "'Fustat', sans-serif" }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#B4ED57] flex items-center justify-center">
          <span className="text-black font-black text-xs">H</span>
        </div>
        <span className="text-white font-black text-base tracking-widest">HACKOS</span>
      </div>
      <p className="text-white/30 text-xs tracking-wider">Smart Hackathon Management System</p>
      <p className="text-white/20 text-xs mt-2">© 2026 HackOS. All rights reserved.</p>
    </footer>
  );
}