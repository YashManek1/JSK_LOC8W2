import React, { useState, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { API_BASE_URL } from "../../api";

/* ═══════════════════════════════════════════════════ */
/*  PPT Evaluation Admin Tab                          */
/*  Mass upload PPTs, configure GitHub, view results  */
/* ═══════════════════════════════════════════════════ */

const CRITERIA = [
    { key: "innovation", label: "Innovation", icon: "💡", color: "#B4ED57" },
    { key: "feasibility", label: "Feasibility", icon: "⚙️", color: "#4D58D4" },
    { key: "impact", label: "Impact", icon: "🌍", color: "#22c55e" },
    { key: "presentation", label: "Presentation", icon: "🎯", color: "#f59e0b" },
    { key: "techStack", label: "Tech Stack", icon: "🔧", color: "#ec4899" },
];

export default function PPTEvaluationTab() {
    const { token } = useApp();
    const [activeView, setActiveView] = useState("mass"); // mass | github | status
    const [teamName, setTeamName] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [pptxFile, setPptxFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [evalId, setEvalId] = useState("");
    const [evalResult, setEvalResult] = useState(null);
    const [polling, setPolling] = useState(false);

    // ── Mass upload state ──
    const [massFiles, setMassFiles] = useState([]);
    const [massResults, setMassResults] = useState([]);
    const [massUploading, setMassUploading] = useState(false);

    // ── GitHub config state ──
    const [ghOwner, setGhOwner] = useState("");
    const [ghRepo, setGhRepo] = useState("");
    const [ghToken, setGhToken] = useState("");
    const [ghConfigSaved, setGhConfigSaved] = useState(false);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file?.name.match(/\.(pptx|pdf)$/i)) {
            setPptxFile(file);
            setError("");
        } else {
            setError("Only .pptx / .pdf files are accepted.");
        }
    }, []);

    const handleMassDrop = useCallback((e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.name.match(/\.(pptx|pdf)$/i)
        );
        setMassFiles((prev) => [...prev, ...files]);
    }, []);

    // ── Submit single evaluation ──
    const handleSubmit = async () => {
        setError("");
        if (!teamName.trim()) return setError("Team name is required.");
        if (!pptxFile) return setError("Upload a PPTX or PDF file.");

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("teamName", teamName.trim());
            if (githubUrl.trim()) fd.append("githubUrl", githubUrl.trim());
            fd.append("pptx", pptxFile);

            const res = await fetch(`${API_BASE_URL}/api/evaluate`, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: fd,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Submission failed.");
            }
            const data = await res.json();
            setEvalId(data.id || data.entryId || data.evaluationId || "");
            setActiveView("status");
            setTeamName("");
            setGithubUrl("");
            setPptxFile(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Mass upload ──
    const handleMassUpload = async () => {
        if (massFiles.length === 0) return;
        setMassUploading(true);
        const results = [];

        for (const file of massFiles) {
            try {
                const fd = new FormData();
                const name = file.name.replace(/\.(pptx|pdf)$/i, "");
                fd.append("teamName", name);
                if (ghOwner && ghRepo) {
                    fd.append("githubUrl", `https://github.com/${ghOwner}/${ghRepo}`);
                }
                fd.append("pptx", file);

                const res = await fetch(`${API_BASE_URL}/api/evaluate`, {
                    method: "POST",
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    body: fd,
                });
                const data = await res.json().catch(() => ({}));
                results.push({
                    file: file.name,
                    status: res.ok ? "success" : "error",
                    id: data.id || data.entryId || data.evaluationId || null,
                    message: data.message || (res.ok ? "Submitted" : "Failed"),
                });
            } catch {
                results.push({ file: file.name, status: "error", message: "Network error" });
            }
        }

        setMassResults(results);
        setMassUploading(false);
        setMassFiles([]);
    };

    // ── Poll evaluation status ──
    const pollEvaluation = async () => {
        if (!evalId) return setError("Enter an evaluation ID.");
        setPolling(true);
        setEvalResult(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/evaluate/${evalId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            setEvalResult(data);
        } catch {
            setError("Failed to fetch evaluation status.");
        } finally {
            setPolling(false);
        }
    };

    const inputCls =
        "w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none focus:border-[#B4ED57]/50 transition-colors text-sm";

    return (
        <div className="space-y-6">
            {/* Hero */}
            <section
                className="relative overflow-hidden rounded-3xl"
                style={{
                    background:
                        "linear-gradient(135deg, #1a1d5e 0%, #2a2f8a 20%, #4D58D4 40%, #6B63D9 60%, #7B6FE0 75%, #5a5fd6 100%)",
                }}
            >
                <div className="absolute inset-0 opacity-[0.08]">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="absolute w-px bg-white h-full" style={{ left: `${(i + 1) * 5}%` }} />
                    ))}
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#6B63D9]/30 rounded-full blur-[120px]" />

                <div className="relative px-8 py-12 max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h1 className="text-white text-2xl md:text-[2.5rem] font-light tracking-tight" style={{ fontFamily: "'Questrial', sans-serif", lineHeight: 1 }}>
                            PPT
                        </h1>
                        <span className="text-[#B4ED57] text-4xl md:text-[4.5rem] leading-none block -my-1" style={{ fontFamily: "'Pixelify Sans', cursive", fontStyle: "italic" }}>
                            Evaluation
                        </span>
                        <p className="text-white/60 text-sm max-w-md mt-3" style={{ fontFamily: "'Fustat', sans-serif" }}>
                            Submit presentations for AI evaluation, mass upload, and configure GitHub repos
                        </p>
                    </div>
                </div>
            </section>

            {/* View Tabs */}
            <div className="flex gap-2">
                {[
                    { key: "mass", label: "📦 Mass Upload" },
                    { key: "github", label: "⚙️ GitHub Config" },
                    { key: "status", label: "🔍 Check Status" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveView(tab.key)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeView === tab.key
                            ? "bg-[#B4ED57] text-black shadow-lg shadow-[#B4ED57]/20"
                            : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                            }`}
                        style={{ fontFamily: "'Fustat', sans-serif" }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Submit Single PPT ── */}
            {activeView === "submit" && (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-8 space-y-5 max-w-xl">
                    <div>
                        <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>Team Name</label>
                        <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Team Orion" className={inputCls} style={{ fontFamily: "'Fustat', sans-serif" }} />
                    </div>
                    <div>
                        <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>
                            GitHub Repo <span className="text-white/20">(optional)</span>
                        </label>
                        <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/your-org/your-repo" className={inputCls} style={{ fontFamily: "'Fustat', sans-serif" }} />
                    </div>
                    <div>
                        <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>Pitch Deck (.pptx or .pdf)</label>
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById("pptx-input-single").click()}
                            className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all p-8 text-center ${dragging ? "border-[#4D58D4] bg-[#4D58D4]/10" :
                                pptxFile ? "border-[#B4ED57]/40 bg-[#B4ED57]/5" :
                                    "border-white/10 hover:border-[#4D58D4]/40"
                                }`}
                        >
                            <input id="pptx-input-single" type="file" accept=".pptx,.pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) { setPptxFile(e.target.files[0]); setError(""); } }} />
                            {pptxFile ? (
                                <div className="space-y-1">
                                    <p className="text-2xl">✅</p>
                                    <p className="text-white font-bold text-sm" style={{ fontFamily: "'Fustat', sans-serif" }}>{pptxFile.name}</p>
                                    <p className="text-white/40 text-xs">{(pptxFile.size / 1024 / 1024).toFixed(1)} MB</p>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setPptxFile(null); }} className="mt-2 text-xs text-white/40 hover:text-red-400 transition-colors">Remove</button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-3xl">📎</p>
                                    <p className="text-white/50 text-sm" style={{ fontFamily: "'Fustat', sans-serif" }}>Drag & drop .pptx / .pdf</p>
                                    <p className="text-white/30 text-xs">or click to browse · max 50 MB</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
                    <button onClick={handleSubmit} disabled={submitting} className="w-full py-4 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-2" style={{ fontFamily: "'Fustat', sans-serif" }}>
                        {submitting ? "Submitting..." : "🚀 Submit for Evaluation"}
                    </button>
                </div>
            )}

            {/* ── Mass Upload ── */}
            {activeView === "mass" && (
                <div className="space-y-5">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
                        <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: "'Questrial', sans-serif" }}>Mass PPT Upload</h3>
                        <p className="text-white/40 text-sm mb-6" style={{ fontFamily: "'Fustat', sans-serif" }}>Upload multiple .pptx / .pdf files at once. File names will be used as team names.</p>

                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleMassDrop}
                            onClick={() => document.getElementById("mass-input").click()}
                            className="cursor-pointer rounded-2xl border-2 border-dashed border-white/10 hover:border-[#4D58D4]/40 transition-all p-10 text-center mb-6"
                        >
                            <input
                                id="mass-input"
                                type="file"
                                accept=".pptx,.pdf"
                                multiple
                                className="hidden"
                                onChange={(e) => setMassFiles((prev) => [...prev, ...Array.from(e.target.files || [])])}
                            />
                            <p className="text-3xl mb-2">📦</p>
                            <p className="text-white/50 text-sm" style={{ fontFamily: "'Fustat', sans-serif" }}>Drag & drop multiple files or click to browse</p>
                            <p className="text-white/30 text-xs mt-1">Accepts .pptx and .pdf</p>
                        </div>

                        {/* File list */}
                        {massFiles.length > 0 && (
                            <div className="space-y-2 mb-6">
                                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>
                                    {massFiles.length} file{massFiles.length > 1 ? "s" : ""} queued
                                </p>
                                {massFiles.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2">
                                        <span className="text-white text-sm truncate flex-1" style={{ fontFamily: "'Fustat', sans-serif" }}>{f.name}</span>
                                        <span className="text-white/30 text-xs ml-3">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                                        <button onClick={() => setMassFiles((prev) => prev.filter((_, j) => j !== i))} className="ml-3 text-white/30 hover:text-red-400 text-xs">✕</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleMassUpload}
                            disabled={massFiles.length === 0 || massUploading}
                            className="w-full py-4 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-full transition-all disabled:opacity-50"
                            style={{ fontFamily: "'Fustat', sans-serif" }}
                        >
                            {massUploading ? `Uploading ${massFiles.length} files...` : `🚀 Upload All (${massFiles.length})`}
                        </button>
                    </div>

                    {/* Mass results */}
                    {massResults.length > 0 && (
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-4 font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>Upload Results</h3>
                            <div className="space-y-2">
                                {massResults.map((r, i) => (
                                    <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-3 ${r.status === "success" ? "bg-[#B4ED57]/5 border border-[#B4ED57]/20" : "bg-red-500/5 border border-red-500/20"}`}>
                                        <span className="text-white text-sm truncate flex-1" style={{ fontFamily: "'Fustat', sans-serif" }}>{r.file}</span>
                                        <span className={`text-xs font-bold ${r.status === "success" ? "text-[#B4ED57]" : "text-red-400"}`}>
                                            {r.status === "success" ? "✓ Submitted" : `✕ ${r.message}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── GitHub Config ── */}
            {activeView === "github" && (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-xl space-y-5">
                    <div>
                        <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: "'Questrial', sans-serif" }}>GitHub Configuration</h3>
                        <p className="text-white/40 text-sm mb-6" style={{ fontFamily: "'Fustat', sans-serif" }}>
                            Configure a default GitHub org/repo that will be sent with each evaluation. This is optional — individual submissions can also include their own GitHub URL.
                        </p>
                    </div>

                    <div>
                        <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>GitHub Owner / Org</label>
                        <input value={ghOwner} onChange={(e) => setGhOwner(e.target.value)} placeholder="e.g. facebook" className={inputCls} style={{ fontFamily: "'Fustat', sans-serif" }} />
                    </div>
                    <div>
                        <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>Repository Name</label>
                        <input value={ghRepo} onChange={(e) => setGhRepo(e.target.value)} placeholder="e.g. react" className={inputCls} style={{ fontFamily: "'Fustat', sans-serif" }} />
                    </div>
                    <div>
                        <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>
                            Personal Access Token <span className="text-white/20">(optional, for private repos)</span>
                        </label>
                        <input value={ghToken} onChange={(e) => setGhToken(e.target.value)} type="password" placeholder="ghp_..." className={inputCls} style={{ fontFamily: "'Fustat', sans-serif" }} />
                    </div>

                    {ghOwner && ghRepo && (
                        <div className="bg-[#4D58D4]/10 border border-[#4D58D4]/20 rounded-xl px-4 py-3">
                            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1 font-bold">Preview URL</p>
                            <p className="text-[#4D58D4] text-sm font-mono">https://github.com/{ghOwner}/{ghRepo}</p>
                        </div>
                    )}

                    <button
                        onClick={() => setGhConfigSaved(true)}
                        className="w-full py-4 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-full transition-all"
                        style={{ fontFamily: "'Fustat', sans-serif" }}
                    >
                        {ghConfigSaved ? "✓ Config Saved" : "💾 Save Configuration"}
                    </button>

                    {ghConfigSaved && (
                        <p className="text-[#B4ED57] text-xs text-center" style={{ fontFamily: "'Fustat', sans-serif" }}>
                            ✓ GitHub config will be applied to mass uploads
                        </p>
                    )}
                </div>
            )}

            {/* ── Check Status ── */}
            {activeView === "status" && (
                <div className="space-y-5 max-w-2xl">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
                        <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: "'Questrial', sans-serif" }}>Check Evaluation Status</h3>
                        <p className="text-white/40 text-sm mb-6" style={{ fontFamily: "'Fustat', sans-serif" }}>Enter an evaluation ID to check the AI scoring status.</p>

                        <div className="flex gap-3">
                            <input
                                value={evalId}
                                onChange={(e) => setEvalId(e.target.value)}
                                placeholder="Paste evaluation ID"
                                className={inputCls + " flex-1"}
                                style={{ fontFamily: "'Fustat', sans-serif" }}
                            />
                            <button
                                onClick={pollEvaluation}
                                disabled={polling || !evalId}
                                className="px-6 py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all disabled:opacity-50 shrink-0"
                                style={{ fontFamily: "'Fustat', sans-serif" }}
                            >
                                {polling ? "Checking..." : "🔍 Check"}
                            </button>
                        </div>
                    </div>

                    {error && activeView === "status" && (
                        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
                    )}

                    {evalResult && (
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
                            {/* Status badge */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${evalResult.status === "complete"
                                    ? "bg-[#B4ED57]/15 text-[#B4ED57] border border-[#B4ED57]/20"
                                    : evalResult.status === "error" || evalResult.status === "failed"
                                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                        : "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20"
                                    }`}>
                                    {(evalResult.status || "unknown").toUpperCase()}
                                </span>
                                {evalResult.teamName && (
                                    <span className="text-white/60 text-sm" style={{ fontFamily: "'Fustat', sans-serif" }}>
                                        {evalResult.teamName}
                                    </span>
                                )}
                            </div>

                            {/* Scores if available */}
                            {evalResult.scores && (
                                <div className="space-y-4 mb-6">
                                    {CRITERIA.map((c) => {
                                        const score = evalResult.scores[c.key] || 0;
                                        return (
                                            <div key={c.key}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="flex items-center gap-2">
                                                        <span>{c.icon}</span>
                                                        <span className="text-white/70 text-sm" style={{ fontFamily: "'Fustat', sans-serif" }}>{c.label}</span>
                                                    </span>
                                                    <span className="text-white font-bold text-sm" style={{ fontFamily: "'Questrial', sans-serif" }}>{score}/100</span>
                                                </div>
                                                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ backgroundColor: c.color, width: `${score}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Feedback */}
                            {(evalResult.explanation || evalResult.feedback) && (
                                <div className="bg-white/5 rounded-xl p-4">
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>AI Feedback</p>
                                    <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line" style={{ fontFamily: "'Fustat', sans-serif" }}>
                                        {evalResult.explanation || evalResult.feedback}
                                    </p>
                                </div>
                            )}

                            {/* Raw JSON toggle */}
                            <details className="mt-4">
                                <summary className="text-white/30 text-xs cursor-pointer hover:text-white/50 transition-colors" style={{ fontFamily: "'Fustat', sans-serif" }}>
                                    View raw response
                                </summary>
                                <pre className="mt-2 p-4 bg-white/[0.02] rounded-xl text-white/40 text-xs overflow-auto max-h-64 font-mono">
                                    {JSON.stringify(evalResult, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
