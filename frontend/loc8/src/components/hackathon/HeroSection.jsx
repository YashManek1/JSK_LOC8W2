import React from "react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden rounded-3xl mx-4 mt-[64px] mb-12" style={{ background: "linear-gradient(135deg, #1a1d5e 0%, #2a2f8a 20%, #4D58D4 40%, #6B63D9 60%, #7B6FE0 75%, #5a5fd6 100%)" }}>
      {/* Vertical background lines */}
      <div className="absolute inset-0 opacity-[0.08]">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px bg-white h-full"
            style={{ left: `${(i + 1) * 5}%` }}
          />
        ))}
      </div>

      {/* Glow orbs for depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6B63D9]/30 rounded-full blur-[120px]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B7FFF]/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#4D58D4]/20 rounded-full blur-[100px]" />

      {/* Content */}
      <div className="relative text-center px-8 max-w-4xl flex flex-col items-center justify-center">
        <h1 className="text-white text-5xl md:text-[4.5rem] font-light tracking-tight" style={{ fontFamily: "'Questrial', sans-serif", lineHeight: 1 }}>
          The Future of
        </h1>
        <span
          className="text-[#B4ED57] text-7xl md:text-[10rem] leading-none block -my-2"
          style={{ fontFamily: "'Pixelify Sans', cursive", fontStyle: 'italic' }}
        >
          Hackathon
        </span>
        <h1 className="text-white text-5xl md:text-[4.5rem] font-light tracking-tight mb-6" style={{ fontFamily: "'Questrial', sans-serif", lineHeight: 1 }}>
          Management
        </h1>
        <p className="text-white/60 text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed" style={{ fontFamily: "'Fustat', sans-serif" }}>
          Experience seamless hackathon participation with AI-powered
          verification, smart team matching, and real-time event tracking.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="px-8 py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-full transition-all hover:scale-105 flex items-center gap-2 text-base" style={{ fontFamily: "'Fustat', sans-serif" }}>
            Get Started Free &nbsp;→
          </button>
          <button className="px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-full transition-all border border-white/20 backdrop-blur-sm text-base" style={{ fontFamily: "'Fustat', sans-serif" }}>
            Explore Hackathons
          </button>
        </div>
      </div>
    </section>
  );
}