import React from "react";
import { STATS } from "../../data/hackathons";

export default function StatsBar() {
  return (
    <div className="flex flex-wrap justify-center gap-4 px-4 mb-16">
      {STATS.map((stat, i) => (
        <div
          key={i}
          className="flex-1 min-w-[140px] max-w-[240px] bg-[#111] border border-white/10 rounded-2xl p-6"
        >
          <div className={`text-3xl font-black ${stat.color} mb-1`}>{stat.value}</div>
          <div className="text-white/40 text-sm">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}