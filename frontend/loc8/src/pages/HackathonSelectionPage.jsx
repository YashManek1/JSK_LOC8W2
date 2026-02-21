import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import HeroSection from "../components/hackathon/HeroSection";
import HackathonCard from "../components/hackathon/HackathonCard";
import StatsBar from "../components/hackathon/StatsBar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { HACKATHONS } from "../data/hackathons";
import { X, Calendar, MapPin, Trophy, Clock, Users } from "lucide-react";

export default function HackathonSelectionPage() {
  const { selectHackathon } = useApp();
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Dynamic status logic for timeline
  const getDynamicStatus = (itemDate) => {
    const now = new Date();
    const phaseDate = new Date(itemDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(phaseDate.getFullYear(), phaseDate.getMonth(), phaseDate.getDate());

    if (eventDay < today) return 'completed';
    if (eventDay.getTime() === today.getTime()) return 'active';
    return 'upcoming';
  };

  const handleHackathonClick = (hackathon) => {
    setSelectedHackathon(hackathon);
    setModalOpen(true);
  };

  const handleRegister = (hackathon) => {
    selectHackathon(hackathon);
    setModalOpen(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedHackathon(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      
      <main>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {HACKATHONS.map((hackathon) => (
              <HackathonCard 
                key={hackathon.id} 
                hackathon={hackathon} 
                onClick={() => handleHackathonClick(hackathon)} 
              />
            ))}
          </div>
        </div>
      </main>

      {modalOpen && selectedHackathon && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-[#111] border-b border-white/10 p-6 flex items-start justify-between z-10">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#B4ED57]/10 border border-[#B4ED57]/20 rounded-full px-3 py-1 mb-3">
                  <span className="text-[#B4ED57] text-xs font-bold uppercase">{selectedHackathon.tag}</span>
                </div>
                <h2 className="text-3xl font-black text-white">{selectedHackathon.name}</h2>
              </div>
              <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors p-2">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-8">
              <div className="rounded-xl overflow-hidden border border-white/10">
                <img src={selectedHackathon.image} alt={selectedHackathon.name} className="w-full h-64 object-cover" />
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-2"><MapPin size={16} /><span>Location</span></div>
                  <p className="text-white font-bold">{selectedHackathon.location}</p>
                  <p className="text-white/40 text-xs mt-1">{selectedHackathon.distance}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-2"><Calendar size={16} /><span>Dates</span></div>
                  <p className="text-white font-bold">{selectedHackathon.dates}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-2"><Trophy size={16} /><span>Prize Pool</span></div>
                  <p className="text-[#B4ED57] font-bold text-lg">{selectedHackathon.prize}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-2"><Users size={16} /><span>Team Size</span></div>
                  <p className="text-white font-bold">{selectedHackathon.teamSize}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-[#B4ED57] font-bold uppercase text-sm mb-3 tracking-wider">About</h3>
                <p className="text-white/70 text-sm leading-relaxed">{selectedHackathon.description}</p>
              </div>

              {/* Organizer */}
              <div>
                <h4 className="text-white/60 text-xs uppercase font-bold mb-2 tracking-wider">Organizer</h4>
                <p className="text-white font-semibold">{selectedHackathon.organizer}</p>
              </div>

              {/* Rules & Perks */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-[#B4ED57] font-bold uppercase text-sm mb-3 tracking-wider">Rules</h3>
                  <p className="text-white/70 text-sm leading-relaxed bg-white/5 border border-white/10 rounded-lg p-4">
                    {selectedHackathon.rules}
                  </p>
                </div>
                <div>
                  <h3 className="text-[#B4ED57] font-bold uppercase text-sm mb-3 tracking-wider">Perks & Benefits</h3>
                  <p className="text-white/70 text-sm leading-relaxed bg-white/5 border border-white/10 rounded-lg p-4">
                    {selectedHackathon.perks}
                  </p>
                </div>
              </div>

              {/* Dynamic Timeline */}
              <div>
                <h3 className="text-[#B4ED57] font-bold uppercase text-sm mb-4 tracking-wider flex items-center gap-2">
                  <Clock size={16} /> Timeline
                </h3>
                <div className="space-y-3">
                  {selectedHackathon.timeline.map((item, idx) => {
                    const status = getDynamicStatus(item.date);
                    const isActive = status === 'active';
                    const isCompleted = status === 'completed';

                    return (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full mt-1.5 transition-all duration-500 ${
                            isActive ? 'bg-[#B4ED57] shadow-[0_0_12px_#B4ED57]' : 
                            isCompleted ? 'bg-[#B4ED57]/60' : 'bg-white/20'
                          }`} />
                          {idx < selectedHackathon.timeline.length - 1 && (
                            <div className={`w-0.5 h-12 transition-all duration-500 ${
                              isCompleted ? 'bg-[#B4ED57]/40' : 'bg-white/10'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold transition-colors ${
                            isActive ? 'text-[#B4ED57]' : isCompleted ? 'text-white/80' : 'text-white/40'
                          }`}>
                            {item.phase}
                            {isActive && <span className="ml-2 text-[10px] bg-[#B4ED57] text-black px-1.5 py-0.5 rounded italic">LIVE NOW</span>}
                          </p>
                          <p className={`text-sm transition-colors ${isActive || isCompleted ? 'text-white/50' : 'text-white/20'}`}>
                            {item.date}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => handleRegister(selectedHackathon)}
                className="w-full py-4 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-black rounded-xl transition-all text-lg uppercase tracking-wide"
              >
                Register Now →
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}