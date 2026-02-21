import React from "react";

const statusStyles = {
  green: "bg-[#B4ED57]/20 text-[#B4ED57] border border-[#B4ED57]/30",
  yellow: "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30",
  blue: "bg-[#4D58D4]/20 text-[#4D58D4] border border-[#4D58D4]/30",
};

export default function HackathonCard({ hackathon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden bg-[#111] border border-white/10 hover:border-[#B4ED57]/40 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#B4ED57]/10"
      style={{ fontFamily: "'Fustat', sans-serif" }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={hackathon.image}
          alt={hackathon.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />

        {/* Tag */}
        <span className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full bg-black/60 text-white/80 border border-white/20 backdrop-blur-sm font-mono">
          {hackathon.tag}
        </span>

        {/* Status Badge */}
        <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-semibold ${statusStyles[hackathon.statusColor]}`}>
          {hackathon.status}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-bold text-lg leading-tight mb-1 group-hover:text-[#c5f278] transition-colors" style={{ fontFamily: "'Questrial', sans-serif" }}>
          {hackathon.name}
        </h3>
        <p className="text-white/50 text-xs mb-3 line-clamp-2">{hackathon.description}</p>

        {/* Meta */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <span>📍</span>
            <span>{hackathon.location}</span>
            <span className="ml-auto text-[#B4ED57]/70 text-[10px] bg-[#B4ED57]/10 px-2 py-0.5 rounded-full">{hackathon.distance}</span>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <span>📅</span>
            <span>{hackathon.dates}</span>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <span>👥</span>
            <span>{hackathon.participants} Participants</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div>
            <div className="text-xs text-white/40">Prize Pool</div>
            <div className="text-[#B4ED57] font-bold text-xl" style={{ fontFamily: "'Questrial', sans-serif" }}>{hackathon.prize}</div>
          </div>
          <button className="px-4 py-2 bg-[#B4ED57] hover:bg-[#c5f278] text-black text-xs font-bold rounded-xl transition-all flex items-center gap-1">
            Register →
          </button>
        </div>
      </div>
    </div>
  );
}