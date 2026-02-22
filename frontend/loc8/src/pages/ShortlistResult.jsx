import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../api";

export default function ShortlistResult() {
    const { token, navigateTo } = useApp();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState([]);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/shortlist/results`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (res.ok) {
                    const data = await res.json();
                    setResults(Array.isArray(data) ? data : data.results || data.teams || []);
                }
            } catch {
                // fallback to empty
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [token]);

    const filtered = results.filter((r) => {
        if (filter === "shortlisted") return r.shortlisted || r.status === "shortlisted";
        if (filter === "rejected") return !r.shortlisted && r.status !== "shortlisted";
        return true;
    });

    const shortlistedCount = results.filter((r) => r.shortlisted || r.status === "shortlisted").length;

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
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B7FFF]/15 rounded-full blur-[100px]" />

                <div className="relative px-8 py-14 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h1
                            className="text-white text-3xl md:text-[3rem] font-light tracking-tight"
                            style={{ fontFamily: "'Questrial', sans-serif", lineHeight: 1 }}
                        >
                            Shortlist
                        </h1>
                        <span
                            className="text-[#B4ED57] text-5xl md:text-[5.5rem] leading-none block -my-1"
                            style={{ fontFamily: "'Pixelify Sans', cursive", fontStyle: "italic" }}
                        >
                            Results
                        </span>
                        <p
                            className="text-white/60 text-sm md:text-base max-w-md mt-3 leading-relaxed"
                            style={{ fontFamily: "'Fustat', sans-serif" }}
                        >
                            {results.length} teams evaluated · {shortlistedCount} shortlisted
                        </p>
                    </div>

                    {/* Quick stats */}
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center">
                            <p className="text-white text-3xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>
                                {results.length}
                            </p>
                            <p className="text-white/50 text-xs mt-1" style={{ fontFamily: "'Fustat', sans-serif" }}>
                                Total Teams
                            </p>
                        </div>
                        <div className="bg-[#B4ED57]/10 backdrop-blur-sm border border-[#B4ED57]/20 rounded-2xl px-6 py-4 text-center">
                            <p className="text-[#B4ED57] text-3xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>
                                {shortlistedCount}
                            </p>
                            <p className="text-[#B4ED57]/60 text-xs mt-1" style={{ fontFamily: "'Fustat', sans-serif" }}>
                                Shortlisted
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <div className="flex gap-2">
                {["all", "shortlisted", "rejected"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${filter === f
                                ? "bg-[#B4ED57] text-black shadow-lg shadow-[#B4ED57]/20"
                                : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                            }`}
                        style={{ fontFamily: "'Fustat', sans-serif" }}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-white/40" style={{ fontFamily: "'Fustat', sans-serif" }}>Loading results...</p>
                </div>
            )}

            {/* Empty */}
            {!loading && filtered.length === 0 && (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center">
                    <p className="text-5xl mb-4">📋</p>
                    <h2
                        className="text-xl font-bold mb-2 text-white"
                        style={{ fontFamily: "'Questrial', sans-serif" }}
                    >
                        No Results Yet
                    </h2>
                    <p className="text-white/40 text-sm" style={{ fontFamily: "'Fustat', sans-serif" }}>
                        {results.length === 0
                            ? "No teams have been evaluated yet."
                            : `No teams match the "${filter}" filter.`}
                    </p>
                </div>
            )}

            {/* Results List */}
            {!loading && filtered.length > 0 && (
                <div className="space-y-3">
                    {filtered.map((team, idx) => {
                        const isShortlisted = team.shortlisted || team.status === "shortlisted";
                        const totalScore = team.totalScore || team.score || 0;
                        const pct = Math.round((totalScore / 500) * 100);

                        return (
                            <div
                                key={team.id || idx}
                                className={`bg-[#111] border rounded-2xl p-5 flex items-center gap-5 transition-all hover:border-white/20 ${isShortlisted ? "border-[#B4ED57]/20 border-l-4 border-l-[#B4ED57]" : "border-white/10"
                                    }`}
                            >
                                {/* Rank */}
                                <div
                                    className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-white/40 font-bold text-sm shrink-0"
                                    style={{ fontFamily: "'Questrial', sans-serif" }}
                                >
                                    #{idx + 1}
                                </div>

                                {/* Team Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3
                                            className="text-white font-bold text-sm truncate"
                                            style={{ fontFamily: "'Fustat', sans-serif" }}
                                        >
                                            {team.teamName || team.name || `Team ${idx + 1}`}
                                        </h3>
                                        {isShortlisted && (
                                            <span className="bg-[#B4ED57]/15 text-[#B4ED57] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#B4ED57]/20">
                                                SHORTLISTED
                                            </span>
                                        )}
                                        {!isShortlisted && team.status && (
                                            <span className="bg-red-500/10 text-red-400/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-red-500/20">
                                                NOT SELECTED
                                            </span>
                                        )}
                                    </div>
                                    {team.githubUrl && (
                                        <a
                                            href={team.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white/25 text-xs hover:text-[#4D58D4] transition-colors"
                                            style={{ fontFamily: "'Fustat', sans-serif" }}
                                        >
                                            {team.githubUrl}
                                        </a>
                                    )}
                                </div>

                                {/* Score Bar */}
                                <div className="w-44 hidden md:block">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-white/25 text-[10px]">Score</span>
                                        <span
                                            className="text-white/60 text-xs font-bold"
                                            style={{ fontFamily: "'Questrial', sans-serif" }}
                                        >
                                            {totalScore}/500
                                        </span>
                                    </div>
                                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${pct}%`,
                                                backgroundColor: isShortlisted ? "#B4ED57" : "#4D58D4",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Score Badge */}
                                <div
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${isShortlisted
                                            ? "bg-[#B4ED57]/10 text-[#B4ED57] border border-[#B4ED57]/20"
                                            : "bg-white/5 text-white/30 border border-white/10"
                                        }`}
                                    style={{ fontFamily: "'Questrial', sans-serif" }}
                                >
                                    {pct}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
