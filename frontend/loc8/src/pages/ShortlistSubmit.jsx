import React, { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../api";

export default function ShortlistSubmit() {
    const { token, teamData, navigateTo } = useApp();
    const [teamName, setTeamName] = useState(teamData?.name || "");
    const [githubUrl, setGithubUrl] = useState("");
    const [pptxFile, setPptxFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file?.name.endsWith(".pptx")) {
            setPptxFile(file);
            setError("");
        } else {
            setError("Only .pptx files are accepted.");
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!teamName.trim()) return setError("Team name is required.");
        if (!pptxFile) return setError("Please upload your PPT (.pptx).");

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("teamName", teamName.trim());
            if (githubUrl.trim()) fd.append("githubUrl", githubUrl.trim());
            fd.append("pptx", pptxFile);

            const res = await fetch(`${API_BASE_URL}/shortlist/submit`, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: fd,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Submission failed.");
            }
            navigateTo("evaluationStatus");
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

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
                        <div
                            key={i}
                            className="absolute w-px bg-white h-full"
                            style={{ left: `${(i + 1) * 5}%` }}
                        />
                    ))}
                </div>

                {/* Glow orbs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#6B63D9]/30 rounded-full blur-[120px]" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B7FFF]/15 rounded-full blur-[100px]" />

                {/* Content */}
                <div className="relative text-center px-8 py-16 max-w-2xl mx-auto">
                    <h1
                        className="text-white text-3xl md:text-[3rem] font-light tracking-tight"
                        style={{ fontFamily: "'Questrial', sans-serif", lineHeight: 1 }}
                    >
                        Submit Your
                    </h1>
                    <span
                        className="text-[#B4ED57] text-5xl md:text-[6rem] leading-none block -my-1"
                        style={{ fontFamily: "'Pixelify Sans', cursive", fontStyle: "italic" }}
                    >
                        Pitch Deck
                    </span>
                    <p
                        className="text-white/60 text-sm md:text-base max-w-md mx-auto mt-4 leading-relaxed"
                        style={{ fontFamily: "'Fustat', sans-serif" }}
                    >
                        Round 1 — AI-powered evaluation with full XAI transparency across 5 strict criteria
                    </p>
                </div>
            </section>

            {/* Form Card */}
            <form
                onSubmit={handleSubmit}
                className="bg-[#111] border border-white/10 rounded-2xl p-8 space-y-6 max-w-xl mx-auto"
            >
                {/* Team Name */}
                <div>
                    <label
                        className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold"
                        style={{ fontFamily: "'Fustat', sans-serif" }}
                    >
                        Team Name
                    </label>
                    <input
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g. Team Orion"
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none focus:border-[#B4ED57]/50 transition-colors text-sm"
                        style={{ fontFamily: "'Fustat', sans-serif" }}
                    />
                </div>

                {/* GitHub URL */}
                <div>
                    <label
                        className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold"
                        style={{ fontFamily: "'Fustat', sans-serif" }}
                    >
                        GitHub Repo <span className="text-white/20">(optional)</span>
                    </label>
                    <input
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/your-org/your-repo"
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none focus:border-[#B4ED57]/50 transition-colors text-sm"
                        style={{ fontFamily: "'Fustat', sans-serif" }}
                    />
                </div>

                {/* PPTX Drop Zone */}
                <div>
                    <label
                        className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold"
                        style={{ fontFamily: "'Fustat', sans-serif" }}
                    >
                        Pitch Deck (.pptx)
                    </label>
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("pptx-input").click()}
                        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all p-10 text-center ${dragging
                                ? "border-[#4D58D4] bg-[#4D58D4]/10"
                                : pptxFile
                                    ? "border-[#B4ED57]/40 bg-[#B4ED57]/5"
                                    : "border-white/10 hover:border-[#4D58D4]/40 hover:bg-white/[0.02]"
                            }`}
                    >
                        <input
                            id="pptx-input"
                            type="file"
                            accept=".pptx"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                    setPptxFile(f);
                                    setError("");
                                }
                            }}
                        />
                        {pptxFile ? (
                            <div className="space-y-1">
                                <p className="text-3xl">✅</p>
                                <p
                                    className="text-white font-bold text-sm"
                                    style={{ fontFamily: "'Fustat', sans-serif" }}
                                >
                                    {pptxFile.name}
                                </p>
                                <p className="text-white/40 text-xs">
                                    {(pptxFile.size / 1024 / 1024).toFixed(1)} MB
                                </p>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPptxFile(null);
                                    }}
                                    className="mt-2 text-xs text-white/40 hover:text-red-400 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-4xl">📎</p>
                                <p
                                    className="text-white/50 text-sm"
                                    style={{ fontFamily: "'Fustat', sans-serif" }}
                                >
                                    Drag & drop your .pptx here
                                </p>
                                <p className="text-white/30 text-xs">or click to browse · max 50 MB</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-full transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2 text-base"
                    style={{ fontFamily: "'Fustat', sans-serif" }}
                >
                    {submitting ? (
                        <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Submitting…
                        </>
                    ) : (
                        "🚀 Submit for Evaluation"
                    )}
                </button>

                <p
                    className="text-center text-xs text-white/30"
                    style={{ fontFamily: "'Fustat', sans-serif" }}
                >
                    Your PPT will be scored by AI across 5 strict criteria with full XAI transparency
                </p>
            </form>
        </div>
    );
}
