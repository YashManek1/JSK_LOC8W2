import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../api";

const CRITERIA = [
    { key: "innovation", label: "Innovation", icon: "💡", color: "#B4ED57" },
    { key: "feasibility", label: "Feasibility", icon: "⚙️", color: "#4D58D4" },
    { key: "impact", label: "Impact", icon: "🌍", color: "#22c55e" },
    { key: "presentation", label: "Presentation", icon: "🎯", color: "#f59e0b" },
    { key: "techStack", label: "Tech Stack", icon: "🔧", color: "#ec4899" },
];

export default function EvaluationStatus() {
    const { token, teamData, navigateTo } = useApp();
    const [status, setStatus] = useState("loading");
    const [scores, setScores] = useState(null);
    const [explanation, setExplanation] = useState("");
    const [animatedScores, setAnimatedScores] = useState({});

    useEffect(() => {
        const pollStatus = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/shortlist/status`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) { setStatus("error"); return; }
                const data = await res.json();
                if (data.status === "complete" || data.scores) {
                    setScores(data.scores || {});
                    setExplanation(data.explanation || data.feedback || "");
                    setStatus("complete");
                } else if (data.status === "pending" || data.status === "evaluating") {
                    setStatus("evaluating");
                } else {
                    setStatus(data.status || "evaluating");
                }
            } catch {
                setStatus("error");
            }
        };
        pollStatus();
        const interval = setInterval(pollStatus, 5000);
        return () => clearInterval(interval);
    }, [token]);

    useEffect(() => {
        if (status !== "complete" || !scores) return;
        CRITERIA.forEach((c, i) => {
            const target = scores[c.key] || 0;
            let current = 0;
            const step = Math.max(1, Math.round(target / 30));
            const timer = setInterval(() => {
                current = Math.min(current + step, target);
                setAnimatedScores((prev) => ({ ...prev, [c.key]: current }));
                if (current >= target) clearInterval(timer);
            }, 30 + i * 10);
        });
    }, [status, scores]);

    const totalScore = scores
        ? CRITERIA.reduce((sum, c) => sum + (scores[c.key] || 0), 0)
        : 0;
    const maxTotal = CRITERIA.length * 100;
    const percentage = Math.round((totalScore / maxTotal) * 100);

    return (
        <div className="space-y-8">
            {/* Hero Banner */}
            <section
                className="relative overflow-hidden rounded-3xl"
                style={{
                    background:
                        "linear-gradient(135deg, #1a1d5e 0%, #2a2f8a 20%, #4D58D4 40%, #6B63D9 60%, #7B6FE0 75%, #5a5fd6 100%)",
                }}
            >
                {/* Vertical lines */}
                <div className="absolute inset-0 opacity-[0.08]">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="absolute w-px bg-white h-full" style={{ left: `${(i + 1) * 5}%` }} />
                    ))}
                </div>
                {/* Glow orbs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#6B63D9]/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4D58D4]/20 rounded-full blur-[100px]" />

                <div className="relative text-center px-8 py-16 max-w-2xl mx-auto">
                    <h1
                        className="text-white text-3xl md:text-[3rem] font-light tracking-tight"
                        style={{ fontFamily: "'Questrial', sans-serif", lineHeight: 1 }}
                    >
                        Evaluation
                    </h1>
                    <span
                        className="text-[#B4ED57] text-5xl md:text-[6rem] leading-none block -my-1"
                        style={{ fontFamily: "'Pixelify Sans', cursive", fontStyle: "italic" }}
                    >
                        Status
                    </span>
                    <p
                        className="text-white/60 text-sm md:text-base max-w-md mx-auto mt-4 leading-relaxed"
                        style={{ fontFamily: "'Fustat', sans-serif" }}
                    >
                        {teamData?.name ? `Team: ${teamData.name}` : "AI-Powered PPT Evaluation Results"}
                    </p>
                </div>
            </section>

            {/* Loading / Evaluating */}
            {(status === "loading" || status === "evaluating") && (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-10 text-center max-w-2xl mx-auto">
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#4D58D4]/20 border-2 border-[#4D58D4]/30 mb-5">
                            <div className="animate-spin text-3xl">⚙️</div>
                        </div>
                        <h2
                            className="text-xl font-bold mb-2 text-white"
                            style={{ fontFamily: "'Questrial', sans-serif" }}
                        >
                            {status === "loading" ? "Loading..." : "AI is Evaluating Your PPT"}
                        </h2>
                        <p className="text-white/40 text-sm" style={{ fontFamily: "'Fustat', sans-serif" }}>
                            Analyzing your presentation across 5 criteria. This usually takes 30-60 seconds.
                        </p>
                    </div>

                    <div className="space-y-4 max-w-md mx-auto">
                        {CRITERIA.map((c, i) => (
                            <div key={c.key} className="flex items-center gap-3">
                                <span className="text-lg">{c.icon}</span>
                                <span
                                    className="text-white/40 text-xs w-28 text-left"
                                    style={{ fontFamily: "'Fustat', sans-serif" }}
                                >
                                    {c.label}
                                </span>
                                <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full animate-pulse"
                                        style={{
                                            backgroundColor: c.color,
                                            width: `${20 + Math.random() * 60}%`,
                                            animationDelay: `${i * 200}ms`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-white/20 text-xs mt-8" style={{ fontFamily: "'Fustat', sans-serif" }}>
                        Auto-refreshing every 5 seconds...
                    </p>
                </div>
            )}

            {/* Complete */}
            {status === "complete" && scores && (
                <div className="space-y-6 max-w-2xl mx-auto">
                    {/* Overall Score Ring */}
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-10 text-center">
                        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-[#B4ED57]/30 mb-5 relative">
                            <div className="absolute inset-0 rounded-full bg-[#B4ED57]/5" />
                            <span
                                className="text-5xl font-black text-[#B4ED57] relative z-10"
                                style={{ fontFamily: "'Questrial', sans-serif" }}
                            >
                                {percentage}%
                            </span>
                        </div>
                        <h2
                            className="text-2xl font-bold mb-1 text-white"
                            style={{ fontFamily: "'Questrial', sans-serif" }}
                        >
                            {percentage >= 70 ? "🎉 Excellent!" : percentage >= 50 ? "👍 Good Job" : "💪 Keep Improving"}
                        </h2>
                        <p className="text-white/40 text-sm" style={{ fontFamily: "'Fustat', sans-serif" }}>
                            Total: {totalScore} / {maxTotal} points
                        </p>
                    </div>

                    {/* Score Breakdown */}
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
                        <h3
                            className="text-white/40 text-[10px] uppercase tracking-widest mb-6 font-bold"
                            style={{ fontFamily: "'Fustat', sans-serif" }}
                        >
                            Score Breakdown
                        </h3>
                        <div className="space-y-5">
                            {CRITERIA.map((c) => {
                                const score = animatedScores[c.key] || 0;
                                return (
                                    <div key={c.key}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="flex items-center gap-2.5">
                                                <span className="text-lg">{c.icon}</span>
                                                <span
                                                    className="text-white/70 text-sm"
                                                    style={{ fontFamily: "'Fustat', sans-serif" }}
                                                >
                                                    {c.label}
                                                </span>
                                            </span>
                                            <span
                                                className="text-white font-bold text-sm"
                                                style={{ fontFamily: "'Questrial', sans-serif" }}
                                            >
                                                {score}/100
                                            </span>
                                        </div>
                                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700 ease-out"
                                                style={{ backgroundColor: c.color, width: `${score}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* AI Feedback */}
                    {explanation && (
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
                            <h3
                                className="text-white/40 text-[10px] uppercase tracking-widest mb-3 font-bold"
                                style={{ fontFamily: "'Fustat', sans-serif" }}
                            >
                                AI Feedback
                            </h3>
                            <p
                                className="text-white/60 text-sm leading-relaxed whitespace-pre-line"
                                style={{ fontFamily: "'Fustat', sans-serif" }}
                            >
                                {explanation}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigateTo("shortlistResult")}
                            className="flex-1 py-4 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-full transition-all hover:scale-[1.01] text-base"
                            style={{ fontFamily: "'Fustat', sans-serif" }}
                        >
                            View Full Results →
                        </button>
                        <button
                            onClick={() => navigateTo("adminDashboard")}
                            className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-medium rounded-full transition-all border border-white/20 backdrop-blur-sm"
                            style={{ fontFamily: "'Fustat', sans-serif" }}
                        >
                            Dashboard
                        </button>
                    </div>
                </div>
            )}

            {/* Error */}
            {status === "error" && (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center max-w-xl mx-auto">
                    <p className="text-5xl mb-4">⚠️</p>
                    <h2
                        className="text-xl font-bold mb-2 text-white"
                        style={{ fontFamily: "'Questrial', sans-serif" }}
                    >
                        Something went wrong
                    </h2>
                    <p className="text-white/40 text-sm mb-8" style={{ fontFamily: "'Fustat', sans-serif" }}>
                        Unable to fetch evaluation status. You may not have submitted a PPT yet.
                    </p>
                    <button
                        onClick={() => navigateTo("shortlistSubmit")}
                        className="px-8 py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-full transition-all hover:scale-105"
                        style={{ fontFamily: "'Fustat', sans-serif" }}
                    >
                        Submit PPT →
                    </button>
                </div>
            )}
        </div>
    );
}
