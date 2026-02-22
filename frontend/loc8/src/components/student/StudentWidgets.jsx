import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL, getHackathonTime, getStudentScore, getStudentMeals } from "../../api";

export function CountdownWidget({ hackathonId }) {
  const [time, setTime] = useState({ h: 11, m: 24, s: 50 });
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const data = await getHackathonTime(hackathonId);
        if (data?.endTime) {
          setEndTime(new Date(data.endTime));
        }
      } catch { /* use local countdown */ }
    };
    if (hackathonId) fetchTime();
  }, [hackathonId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (endTime) {
        const diff = Math.max(0, endTime - Date.now());
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTime({ h, m, s });
      } else {
        setTime((prev) => {
          let { h, m, s } = prev;
          s--;
          if (s < 0) { s = 59; m--; }
          if (m < 0) { m = 59; h--; }
          if (h < 0) { h = 0; m = 0; s = 0; }
          return { h, m, s };
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div
      className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4"
      style={{ fontFamily: "'Fustat', sans-serif" }}
    >
      <h3
        className="text-white font-semibold"
        style={{ fontFamily: "'Questrial', sans-serif" }}
      >
        Countdown & Alerts
      </h3>
      <div className="bg-[#0a0a0a] rounded-xl p-4">
        <div className="text-white/40 text-xs mb-1">Current Time</div>
        <div
          className="text-white text-2xl font-bold"
          style={{ fontFamily: "'Questrial', sans-serif" }}
        >
          {pad(13)}:{pad(28)}:{pad(50)}
        </div>
      </div>
      <div className="bg-[#161616] rounded-xl p-4">
        <div className="text-white/40 text-xs mb-1">Remaining</div>
        <div
          className="text-[#B4ED57] text-xl font-bold italic"
          style={{ fontFamily: "'Pixelify Sans', cursive" }}
        >
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
  const FALLBACK_SCORES = [
    { label: "Innovation", score: 92, max: 20 },
    { label: "Feasibility", score: 88, max: 20 },
    { label: "Tech Depth", score: 95, max: 25 },
    { label: "Clarity", score: 85, max: 20 },
    { label: "Impact", score: 90, max: 15 },
  ];
  const [scores, setScores] = useState(FALLBACK_SCORES);
  const [aiReasoning, setAiReasoning] = useState(
    '"High Technical Depth due to mentions of federated learning, model quantization, and real-time inference pipeline in slides 7–9."'
  );

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const data = await getStudentScore();
        if (data?.scores) {
          setScores(data.scores);
        }
        if (data?.aiReasoning) {
          setAiReasoning(data.aiReasoning);
        }
      } catch { /* use fallback */ }
    };
    fetchScore();
  }, []);

  return (
    <div
      className="bg-[#111] border border-white/10 rounded-2xl p-6"
      style={{ fontFamily: "'Fustat', sans-serif" }}
    >
      <h3
        className="text-white font-semibold mb-4"
        style={{ fontFamily: "'Questrial', sans-serif" }}
      >
        Your PPT Score · AI Transparency Breakdown
      </h3>
      <div className="rounded-xl overflow-hidden border border-white/10">
        <div className="grid grid-cols-3 text-white/40 text-xs px-4 py-2 border-b border-white/10 bg-white/5">
          <span>Criteria</span>
          <span className="text-right">Score</span>
          <span className="text-right">Weight</span>
        </div>
        {scores.map((s) => (
          <div
            key={s.label}
            className="grid grid-cols-3 items-center px-4 py-3 border-b border-white/5 last:border-0"
          >
            <span className="text-white/80 text-sm">{s.label}</span>
            <span
              className="text-[#B4ED57] font-bold text-right"
              style={{ fontFamily: "'Questrial', sans-serif" }}
            >
              {s.score}
            </span>
            <span className="text-white/40 text-sm text-right">/{s.max}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 bg-[#B4ED57]/5 border border-[#B4ED57]/20 rounded-xl p-4">
        <div className="text-[#B4ED57]/60 text-xs mb-1">⚡ AI Reasoning</div>
        <p className="text-white/60 text-xs leading-relaxed">
          {aiReasoning}
        </p>
      </div>
    </div>
  );
}

export function MealQRWidget() {
  const FALLBACK_MEALS = [
    { name: "Breakfast", time: "06:00–09:00", status: "Used" },
    { name: "Lunch", time: "13:00–14:30", status: "Active" },
    { name: "Dinner", time: "20:00–21:30", status: "Locked" },
  ];
  const [meals, setMeals] = useState(FALLBACK_MEALS);
  const [notice, setNotice] = useState("Notice: Counter A busy → Go to Counter B");

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const data = await getStudentMeals();
        if (data?.meals && Array.isArray(data.meals)) {
          setMeals(data.meals);
        }
        if (data?.notice) setNotice(data.notice);
      } catch { /* use fallback */ }
    };
    fetchMeals();
  }, []);

  const statusStyle = {
    Used: "bg-white/10 text-white/40",
    Active: "bg-[#B4ED57] text-black",
    Locked: "bg-white/5 text-white/25",
  };

  return (
    <div
      className="bg-[#111] border border-white/10 rounded-2xl p-6"
      style={{ fontFamily: "'Fustat', sans-serif" }}
    >
      <h3
        className="text-white font-semibold mb-4"
        style={{ fontFamily: "'Questrial', sans-serif" }}
      >
        Meal QRs
      </h3>
      <div className="space-y-2">
        {meals.map((meal) => (
          <div
            key={meal.name}
            className={`flex items-center justify-between p-4 rounded-xl ${
              meal.status === "Active"
                ? "bg-[#B4ED57]/10 border border-[#B4ED57]/20"
                : "bg-white/5"
            }`}
          >
            <div>
              <div
                className={`text-sm font-semibold ${meal.status === "Active" ? "text-white" : "text-white/50"}`}
              >
                {meal.name}
              </div>
              <div className="text-white/30 text-xs">{meal.time}</div>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${statusStyle[meal.status]}`}
            >
              {meal.status}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-yellow-400/70 text-xs bg-yellow-400/5 border border-yellow-400/15 rounded-xl p-3">
        <span>⚠️</span>
        <span>{notice}</span>
      </div>
    </div>
  );
}

export function TeamCommitsWidget({ teamName }) {
  const [contributors, setContributors] = useState([]);
  const [totalCommits, setTotalCommits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamName) { setLoading(false); return; }
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/github/stats/${teamName}`);
        if (res.ok) {
          const data = await res.json();
          const sorted = (data.contributors || []).sort((a, b) => b.commits - a.commits);
          setContributors(sorted);
          setTotalCommits(data.totalCommits || sorted.reduce((s, c) => s + c.commits, 0));
        }
      } catch (err) {
        console.error("Failed to fetch team commits:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [teamName]);

  const colors = ["bg-[#B4ED57]", "bg-[#4D58D4]", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-cyan-500"];
  const maxCommits = contributors[0]?.commits || 1;

  return (
    <div
      className="bg-[#111] border border-white/10 rounded-2xl p-6"
      style={{ fontFamily: "'Fustat', sans-serif" }}
    >
      <div className="flex items-center justify-between mb-1">
        <h3
          className="text-white font-semibold"
          style={{ fontFamily: "'Questrial', sans-serif" }}
        >
          Team Commits · {teamName || "No Team"}
        </h3>
        <button className="text-[#B4ED57] text-xs hover:underline">
          View details →
        </button>
      </div>
      <p className="text-white/40 text-xs mb-4">
        Total:{" "}
        <span
          style={{ fontFamily: "'Questrial', sans-serif" }}
          className="font-bold text-white/70"
        >
          {totalCommits}
        </span>{" "}
        commits
      </p>
      {loading ? (
        <p className="text-white/30 text-xs animate-pulse">Loading commits...</p>
      ) : contributors.length === 0 ? (
        <p className="text-white/30 text-xs">No data yet. Sync your GitHub repo first.</p>
      ) : (
      <div className="space-y-3">
        {contributors.slice(0, 5).map((m, idx) => (
          <div key={m.author} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {m.avatarUrl ? (
                  <img src={m.avatarUrl} alt={m.author} className="w-7 h-7 rounded-full" />
                ) : (
                  <div className={`w-7 h-7 ${colors[idx % colors.length]} rounded-full flex items-center justify-center text-xs font-bold text-black`}>
                    {m.author[0]}
                  </div>
                )}
                <span className="text-white text-sm">
                  {m.author}
                  {idx === 0 && <span className="text-xs ml-1">👑 King</span>}
                </span>
              </div>
              <span
                className="text-white font-bold text-sm"
                style={{ fontFamily: "'Questrial', sans-serif" }}
              >
                {m.commits}
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-1000`}
                style={{ width: `${(m.commits / maxCommits) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      )}
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
    <div
      className="bg-[#B4ED57] rounded-2xl p-6"
      style={{ fontFamily: "'Fustat', sans-serif" }}
    >
      <h3
        className="text-black font-bold mb-4"
        style={{ fontFamily: "'Questrial', sans-serif" }}
      >
        Hacker Cockpit
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-black/10 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-black/60 text-xs mb-1">
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </div>
            <div
              className="text-black font-bold text-xl mb-2"
              style={{ fontFamily: "'Questrial', sans-serif" }}
            >
              {s.value}%
            </div>
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
        <div className="bg-black/80 rounded-xl p-3 flex items-center gap-2 text-[#B4ED57] text-xs font-semibold">
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

export function VoiceAssistantWidget({ userEmail }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start session on mount
  useEffect(() => {
    if (!userEmail) return;
    const startSession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chat/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        });
        const data = await res.json();
        if (res.ok) {
          setSessionId(data.sessionId);
          setMessages([{ from: "ai", text: data.greeting }]);
        }
      } catch (err) {
        setMessages([
          {
            from: "ai",
            text: "Could not connect to AI assistant. Please try again later.",
          },
        ]);
      }
    };
    startSession();
  }, [userEmail]);

  // Send text message
  const send = async () => {
    if (!input.trim() || !sessionId || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { from: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: userMsg }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { from: "ai", text: data.text }]);
        if (data.extractedData) setExtractedData(data.extractedData);
        if (data.isComplete) setIsComplete(true);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "ai", text: "Something went wrong. Try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await sendAudio(blob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const sendAudio = async (blob) => {
    if (!sessionId) return;
    setMessages((prev) => [
      ...prev,
      { from: "user", text: "🎤 [Voice message]" },
    ]);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("audio", blob, "recording.webm");
      fd.append("sessionId", sessionId);
      const res = await fetch(`${API_BASE_URL}/chat/voice`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { from: "ai", text: data.text }]);
        if (data.extractedData) setExtractedData(data.extractedData);
        if (data.isComplete) setIsComplete(true);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "ai", text: "Could not process audio. Try typing instead." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "Network error processing audio." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-[#4D58D4] rounded-2xl p-6 flex flex-col gap-4"
      style={{ fontFamily: "'Fustat', sans-serif" }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚡</span>
        <div>
          <h3
            className="text-white font-semibold text-sm"
            style={{ fontFamily: "'Questrial', sans-serif" }}
          >
            Voice Assistant Profile Completion AI
          </h3>
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <span>Model: Gemini 2.5 Flash</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${sessionId ? "bg-[#B4ED57] animate-pulse" : "bg-red-400"}`}
            />
            <span className={sessionId ? "text-[#B4ED57]" : "text-red-400"}>
              {sessionId ? "Connected" : "Offline"}
            </span>
          </div>
        </div>
      </div>
      {isComplete && (
        <div className="bg-[#B4ED57]/20 border border-[#B4ED57]/40 rounded-xl p-2 text-[#B4ED57] text-xs font-bold text-center">
          Registration Complete!
        </div>
      )}
      <div className="flex-1 space-y-2 max-h-36 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl text-sm ${m.from === "ai" ? "bg-white/10 text-white" : "bg-white/20 text-white ml-6"}`}
          >
            {m.from === "ai" && (
              <span className="text-xs text-[#B4ED57]/80 mr-1">⚡</span>
            )}
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="p-3 rounded-xl text-sm bg-white/10 text-white/60 animate-pulse">
            ⚡ Gemini is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={
            isComplete ? "Registration complete!" : "Type your answer..."
          }
          disabled={isComplete || loading}
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40 disabled:opacity-50"
        />
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={isComplete || loading}
          className={`w-10 h-10 ${recording ? "bg-red-500 hover:bg-red-400" : "bg-white/20 hover:bg-white/30"} text-white rounded-xl flex items-center justify-center font-bold transition-colors disabled:opacity-50`}
          title={recording ? "Stop recording" : "Start recording"}
        >
          🎤
        </button>
        <button
          onClick={send}
          disabled={isComplete || loading}
          className="w-10 h-10 bg-[#B4ED57] hover:bg-[#c5f278] text-black rounded-xl flex items-center justify-center font-bold transition-colors disabled:opacity-50"
        >
          →
        </button>
      </div>
    </div>
  );
}
