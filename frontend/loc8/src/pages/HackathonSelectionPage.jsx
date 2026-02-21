import React from "react";
import { useApp } from "../context/AppContext";
import HeroSection from "../components/hackathon/HeroSection";
import HackathonCard from "../components/hackathon/HackathonCard";
import StatsBar from "../components/hackathon/StatsBar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { HACKATHONS } from "../data/hackathons";

export default function HackathonSelectionPage() {
  const { selectHackathon } = useApp();

  const handleHackathonSelect = (hackathon) => {
    selectHackathon(hackathon);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      
      <main>
        {/* Visual Hero and Global Stats */}
        <HeroSection />
        <StatsBar />
        
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black italic mb-2 tracking-tighter text-lime-400">
                UPCOMING HACKATHONS
              </h2>
              <p className="text-white/40 text-sm">
                Find and join your next challenges. Build amazing things.
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white/60">
                All Categories
              </span>
              <span className="px-4 py-2 bg-lime-400/10 border border-lime-400/20 rounded-full text-xs text-lime-400 font-bold">
                Open Now
              </span>
            </div>
          </div>

          {/* Hackathon Listing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {HACKATHONS.map((hackathon) => (
              <HackathonCard 
                key={hackathon.id} 
                hackathon={hackathon} 
                onClick={() => handleHackathonSelect(hackathon)} 
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
