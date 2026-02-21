import React from "react";
import { useApp } from "../../context/AppContext";

export default function CTABanner() {
  const { navigateTo } = useApp();
  return (
    <section className="mx-4 my-16 rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-700 to-violet-800 p-12 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/10 rounded-full blur-3xl" />
      <div className="relative">
        <h2 className="text-white text-4xl font-black mb-3">
          Ready to Join the
          <br />
          <span className="text-lime-400" style={{ fontFamily: "'Courier New', monospace" }}>
            Next Hackathon?
          </span>
        </h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">
          Sign up now and get verified in minutes. Skip the hassle for all future hackathons.
        </p>
        <button
          onClick={() => navigateTo("auth")}
          className="px-8 py-3.5 bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-full transition-all hover:scale-105 inline-flex items-center gap-2"
        >
          Create Your Profile →
        </button>
      </div>
    </section>
  );
}