import React from "react";
import { STATS } from "../../data/hackathons";

export default function StatsBar() {
  return (
    <div className="flex justify-center gap-5 px-4 mb-16">
      {STATS.map((stat, i) => (
        <div
          key={i}
          className={`bg-[#141414] border border-white/10 ${stat.border} border-l-2 rounded-xl px-6 py-5 min-w-[180px]`}
        >
          <div className={`text-3xl font-bold ${stat.color} mb-1`} style={{ fontFamily: "'Questrial', sans-serif" }}>{stat.value}</div>
          <div className="text-white/40 text-sm" style={{ fontFamily: "'Fustat', sans-serif" }}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}