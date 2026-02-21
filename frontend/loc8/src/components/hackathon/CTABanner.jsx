import React from "react";
import { useApp } from "../../context/AppContext";

export default function CTABanner() {
  const { navigateTo } = useApp();
  return (
    <section className="mx-4 my-16 rounded-3xl bg-[#4D58D4] p-12 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#B4ED57]/10 rounded-full blur-3xl" />
      <div className="relative">
        <h2 className="text-white text-4xl font-black mb-3" style={{ fontFamily: "'Questrial', sans-serif" }}>
          Ready to Join the
          <br />
          <span className="text-[#B4ED57] text-5xl italic" style={{ fontFamily: "'Pixelify Sans', cursive" }}>
            Next Hackathon?
          </span>
        </h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto" style={{ fontFamily: "'Fustat', sans-serif" }}>
          Sign up now and get verified in minutes. Skip the hassle for all future hackathons.
        </p>
        <button
          onClick={() => navigateTo("auth")}
          className="px-8 py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-full transition-all hover:scale-105 inline-flex items-center gap-2"
          style={{ fontFamily: "'Fustat', sans-serif" }}
        >
          Create Your Profile →
        </button>
      </div>
    </section>
  );
}