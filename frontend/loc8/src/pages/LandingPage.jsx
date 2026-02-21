import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { HACKATHONS } from "../data/hackathons";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/hackathon/HeroSection";
import StatsBar from "../components/hackathon/StatsBar";
import HackathonCard from "../components/hackathon/HackathonCard";
import CTABanner from "../components/hackathon/CTABanner";

export default function LandingPage() {
  const { selectHackathon } = useApp();
  const [filter, setFilter] = useState("All");
  const tags = ["All", "AI/ML", "Web3", "IoT", "Data Science", "HealthTech", "Sustainability"];

  const filtered = filter === "All" ? HACKATHONS : HACKATHONS.filter((h) => h.tag === filter);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <HeroSection />
      <StatsBar />

      {/* Hackathons Section */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-xs text-[#B4ED57] bg-[#B4ED57]/10 border border-[#B4ED57]/20 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 bg-[#B4ED57] rounded-full animate-pulse" />
            Near You
          </span>
          <h2 className="text-white text-4xl font-black mb-2" style={{ fontFamily: "'Questrial', sans-serif" }}>
            Upcoming{" "}
            <span className="text-[#B4ED57] text-5xl" style={{ fontFamily: "'Jersey 15', cursive" }}>
              Hackathons
            </span>
          </h2>
          <p className="text-white/40 text-sm" style={{ fontFamily: "'Fustat', sans-serif" }}>Find and join hackathons happening in Bangalore</p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                filter === tag
                  ? "bg-[#B4ED57] text-black font-bold"
                  : "bg-white/5 text-white/60 hover:text-white border border-white/10"
              }`}
              style={{ fontFamily: "'Fustat', sans-serif" }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((hackathon) => (
            <HackathonCard
              key={hackathon.id}
              hackathon={hackathon}
              onClick={() => selectHackathon(hackathon)}
            />
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-10">
          <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/15 rounded-full text-sm transition-all" style={{ fontFamily: "'Fustat', sans-serif" }}>
            View All Hackathons
          </button>
        </div>
      </section>

      <CTABanner />
      <Footer />
    </div>
  );
}