import React, { useState, useEffect } from "react";

export function CountdownWidget() {
  const [time, setTime] = useState({ h: 11, m: 24, s: 50 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-semibold">Countdown & Alerts</h3>
      <div className="bg-[#0a0a0a] rounded-xl p-4">
        <div className="text-white/40 text-xs mb-1">Current Time</div>
        <div className="text-white font-mono text-2xl font-bold">
          {pad(13)}:{pad(28)}:{pad(50)}
        </div>
      </div>
      <div className="bg-[#161616] rounded-xl p-4">
        <div className="text-white/40 text-xs mb-1">Remaining</div>
        <div className="text-lime-400 font-mono text-xl font-bold">
          {pad(time.h)}h {pad(time.m)}m remaining
        </div>
      </div>
      <div className="bg-[#0f0f1a] rounded-xl p-4 flex items-center gap-3">
        <span className="text-xl">🌙</span>
        <div>
          <div className="text-white/40 text-xs">Night Owl Mode</div>
          <div className="text-white/70 text-sm">Activates in 9h</div>
        </div>
      </div>
    </div>
  );
}

export function PPTScoreWidget() {
  const scores = [
    { label: "Innovation", score: 92, max: 20 },
    { label: "Feasibility", score: 88, max: 20 },
    { label: "Tech Depth", score: 95, max: 25 },
    { label: "Clarity", score: 85, max: 20 },
    { label: "Impact", score: 90, max: 15 },
  ];

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-4">Your PPT Score · AI Transparency Breakdown</h3>
      <div className="rounded-xl overflow-hidden border border-white/10">
        <div className="grid grid-cols-3 text-white/40 text-xs px-4 py-2 border-b border-white/10 bg-white/5">
          <span>Criteria</span>
          <span className="text-right">Score</span>
          <span className="text-right">Weight</span>
        </div>
        {scores.map((s) => (
          <div key={s.label} className="grid grid-cols-3 items-center px-4 py-3 border-b border-white/5 last:border-0">
            <span className="text-white/80 text-sm">{s.label}</span>
            <span className="text-lime-400 font-bold text-right">{s.score}</span>
            <span className="text-white/40 text-sm text-right">/{s.max}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 bg-lime-400/5 border border-lime-400/20 rounded-xl p-4">
        <div className="text-lime-400/60 text-xs mb-1">⚡ AI Reasoning</div>
        <p className="text-white/60 text-xs leading-relaxed">
          "High Technical Depth due to mentions of federated learning, model quantization, and real-time inference pipeline in slides 7–9."
        </p>
      </div>
    </div>
  );
}

export function MealQRWidget() {
  const meals = [
    { name: "Breakfast", time: "06:00–09:00", status: "Used" },
    { name: "Lunch", time: "13:00–14:30", status: "Active" },
    { name: "Dinner", time: "20:00–21:30", status: "Locked" },
  ];

  const statusStyle = {
    Used: "bg-white/10 text-white/40",
    Active: "bg-lime-400 text-black",
    Locked: "bg-white/5 text-white/25",
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-4">Meal QRs</h3>
      <div className="space-y-2">
        {meals.map((meal) => (
          <div
            key={meal.name}
            className={`flex items-center justify-between p-4 rounded-xl ${
              meal.status === "Active" ? "bg-lime-400/10 border border-lime-400/20" : "bg-white/5"
            }`}
          >
            <div>
              <div className={`text-sm font-semibold ${meal.status === "Active" ? "text-white" : "text-white/50"}`}>
                {meal.name}
              </div>
              <div className="text-white/30 text-xs">{meal.time}</div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusStyle[meal.status]}`}>
              {meal.status}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-yellow-400/70 text-xs bg-yellow-400/5 border border-yellow-400/15 rounded-xl p-3">
        <span>⚠️</span>
        <span>Notice: Counter A busy → Go to Counter B</span>
      </div>
    </div>
  );
}

export function TeamCommitsWidget({ teamName }) {
  const members = [
    { name: "Ananya", commits: 45, color: "bg-lime-400", isYou: true, badge: "👑 King" },
    { name: "Ravi", commits: 32, color: "bg-blue-500", isYou: false },
    { name: "Sara", commits: 28, color: "bg-purple-500", isYou: false },
    { name: "Kiran", commits: 8, color: "bg-gray-600", isYou: false },
  ];
  const total = members.reduce((s, m) => s + m.commits, 0);

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white font-semibold">Team Commits · {teamName || "404 Found"}</h3>
        <button className="text-lime-400 text-xs hover:underline">View details →</button>
      </div>
      <p className="text-white/40 text-xs mb-4">Total: {total} commits</p>
      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.name} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 ${m.isYou ? "bg-lime-400" : m.color} rounded-full flex items-center justify-center text-xs font-bold text-black`}>
                  {m.name[0]}
                </div>
                <span className="text-white text-sm">
                  {m.name}
                  {m.isYou && <span className="text-lime-400/70 text-xs ml-1">(You)</span>}
                  {m.badge && <span className="text-xs ml-1">{m.badge}</span>}
                </span>
              </div>
              <span className="text-white font-bold text-sm">{m.commits}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full ${m.color} rounded-full transition-all duration-1000`}
                style={{ width: `${(m.commits / 45) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HackerCockpitWidget() {
  const stats = [
    { label: "Hydration", value: 60, icon: "💧", warn: false },
    { label: "Last Break", value: 80, icon: "☕", warn: false },
    { label: "Eye Rest", value: 35, icon: "👁", warn: true },
    { label: "Energy", value: 72, icon: "⚡", warn: false },
  ];

  return (
    <div className="bg-lime-400 rounded-2xl p-6">
      <h3 className="text-black font-bold mb-4">Hacker Cockpit</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-black/10 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-black/60 text-xs mb-1">
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </div>
            <div className="text-black font-bold text-xl mb-2">{s.value}%</div>
            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${s.warn ? "bg-red-600" : "bg-black/50"}`}
                style={{ width: `${s.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="bg-black/80 rounded-xl p-3 flex items-center gap-2 text-lime-400 text-xs font-semibold">
          <span>⚠️</span> Drink water NOW
        </div>
        <div className="bg-black/40 rounded-xl p-3 flex items-center gap-2 text-black/70 text-xs">
          <span>🕐</span> Stretch in 15 min
        </div>
        <div className="bg-black/20 rounded-xl p-3 flex items-center gap-2 text-black/60 text-xs">
          <span>💡</span> Last commit: 12 min ago
        </div>
      </div>
    </div>
  );
}

export function VoiceAssistantWidget() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hey Ananya! I'm HackOS AI. Let's complete your hackathon profile. What's your full name and year?" },
  ]);

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { from: "user", text: input },
      { from: "ai", text: "Got it! Your profile has been updated. Anything else I can help with?" },
    ]);
    setInput("");
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚡</span>
        <div>
          <h3 className="text-white font-semibold text-sm">Voice Assistant Profile Completion AI</h3>
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <span>Model: PersonaPlex-7b</span>
            <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
            <span className="text-lime-400">NER Active</span>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-2 max-h-36 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-xl text-sm ${m.from === "ai" ? "bg-white/10 text-white" : "bg-white/20 text-white ml-6"}`}>
            {m.from === "ai" && <span className="text-xs text-lime-400/80 mr-1">⚡</span>}
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your answer..."
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40"
        />
        <button onClick={send} className="w-10 h-10 bg-lime-400 hover:bg-lime-300 text-black rounded-xl flex items-center justify-center font-bold transition-colors">
          →
        </button>
      </div>
    </div>
  );
}