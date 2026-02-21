import React from "react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden rounded-3xl mx-4 mt-24 mb-12 bg-gradient-to-br from-indigo-600 via-blue-700 to-violet-800">
      {/* Animated background lines */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-white to-transparent"
            style={{
              left: `${(i + 1) * 8.33}%`,
              height: "100%",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-lime-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative text-center px-8 max-w-3xl">
        <h1 className="text-white text-5xl md:text-7xl font-black leading-tight mb-6">
          The Future of
          <br />
          <span
            className="text-lime-400 font-black"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            Hackathon
          </span>
          <br />
          Management
        </h1>
        <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Experience seamless hackathon participation with AI-powered verification,
          smart team matching, and real-time event tracking.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="px-8 py-3.5 bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-full transition-all hover:scale-105 flex items-center gap-2">
            Get Started Free →
          </button>
          <button className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-all border border-white/20 backdrop-blur-sm">
            Explore Hackathons
          </button>
        </div>
      </div>
    </section>
  );
}