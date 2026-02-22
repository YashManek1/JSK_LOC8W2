import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { API_BASE_URL } from "../../api";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_WEIGHTS = { problemRelevance: 25, innovation: 25, technicalDepth: 20, marketImpact: 15, slideQuality: 15 };
const CRITERIA_LABELS = {
    problemRelevance: 'Problem Relevance & Domain Fit',
    innovation: 'Innovation & Uniqueness',
    technicalDepth: 'Technical Depth & Feasibility',
    marketImpact: 'Go-to-Market / Impact',
    slideQuality: 'Slide Quality & Communication',
};

const STATUS_COLOR = {
    PENDING: 'text-white/40', PROCESSING: 'text-[#f59e0b]',
    EVALUATED: 'text-[#B4ED57]', ELIMINATED: 'text-red-400', FAILED: 'text-orange-400',
};
const STATUS_BG = {
    PENDING: 'bg-white/5', PROCESSING: 'bg-[#f59e0b]/10',
    EVALUATED: 'bg-[#B4ED57]/10', ELIMINATED: 'bg-red-500/10', FAILED: 'bg-orange-500/10',
};

function TagInput({ label, values, onChange, placeholder }) {
    const [input, setInput] = useState('');
    const add = () => { const v = input.trim(); if (v && !values.includes(v)) onChange([...values, v]); setInput(''); };
    return (
        <div>
            <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>{label}</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
                {values.map(v => (
                    <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#4D58D4]/20 border border-[#4D58D4]/30 rounded-full text-xs text-white">
                        {v}<button type="button" onClick={() => onChange(values.filter(x => x !== v))} className="text-white/40 hover:text-red-400 transition-colors">×</button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
                    placeholder={placeholder} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none text-sm" style={{ fontFamily: "'Fustat', sans-serif" }} />
                <button type="button" onClick={add} className="px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm text-white hover:bg-white/15 transition-colors font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>Add</button>
            </div>
        </div>
    );
}

function WorkflowStrip({ stats, queue }) {
    const steps = [
        { icon: '📤', label: 'Upload', active: false },
        { icon: '⏳', label: `Queue (${queue.waiting ?? 0})`, active: (queue.waiting ?? 0) > 0 },
        { icon: '🤖', label: 'AI Scoring', active: (queue.active ?? 0) > 0 },
        { icon: '📊', label: `Leaderboard (${stats.evaluated ?? 0})`, active: (stats.evaluated ?? 0) > 0 },
        { icon: '🚀', label: 'Publish', active: false },
    ];
    const eta = queue.etaSeconds ?? 0;
    const etaStr = eta > 60 ? `~${Math.ceil(eta / 60)} min` : eta > 0 ? `~${eta}s` : null;

    return (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>Screening Pipeline</p>
                {etaStr && (
                    <span className="text-xs text-[#f59e0b] animate-pulse">⏱ {etaStr} remaining</span>
                )}
            </div>
            <div className="flex items-center gap-2">
                {steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                        <div className={`flex flex-col items-center gap-1 ${s.active ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all ${s.active ? 'bg-[#4D58D4]/20 border-[#4D58D4]/40 shadow-lg shadow-[#4D58D4]/10' : 'bg-white/5 border-white/5'
                                }`}>
                                <span className={s.active ? 'animate-pulse' : ''}>{s.icon}</span>
                            </div>
                            <span className="text-xs text-white/40 text-center whitespace-nowrap" style={{ fontFamily: "'Fustat', sans-serif" }}>{s.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className="flex-1 h-px bg-white/10 mb-4" />
                        )}
                    </div>
                ))}
            </div>
            <div className="flex gap-3 mt-4 text-xs text-white/40" style={{ fontFamily: "'Fustat', sans-serif" }}>
                {[['Pending', stats.pending, 'text-white/40'], ['Processing', stats.processing, 'text-[#f59e0b]'],
                ['Evaluated', stats.evaluated, 'text-[#B4ED57]'], ['Eliminated', stats.eliminated, 'text-red-400'],
                ['Failed', stats.failed, 'text-orange-400']].map(([l, v, c]) => v > 0 && (
                    <span key={l}><span className={c}>{v}</span> {l}</span>
                ))}
                <span className="ml-auto">{stats.total ?? 0} total</span>
            </div>
        </div>
    );
}

function ScoreMiniBar({ score }) {
    const pct = Math.round((score / 10) * 100);
    const color = pct >= 70 ? 'bg-[#B4ED57]' : pct >= 50 ? 'bg-[#f59e0b]' : 'bg-red-400';
    return (
        <div className="flex items-center gap-1.5 w-20">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-white/40">{score}</span>
        </div>
    );
}

export default function ScreeningTab() {
    const [tab, setTab] = useState('leaderboard');
    const [config, setConfig] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [allEntries, setAllEntries] = useState([]);
    const [stats, setStats] = useState({});
    const [queue, setQueue] = useState({});
    const [saveMsg, setSaveMsg] = useState('');
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [startingEval, setStartingEval] = useState(false);
    const [noteEntry, setNoteEntry] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [detailEntry, setDetailEntry] = useState(null);
    const [startingNewRound, setStartingNewRound] = useState(false);

    const [overwatchData, setOverwatchData] = useState({});
    const [repoUrlInput, setRepoUrlInput] = useState({});
    const [syncingRepo, setSyncingRepo] = useState(false);

    const syncRepo = async (teamName, githubUrl) => {
        if (!githubUrl) return;
        setSyncingRepo(true);
        try {
            const res = await fetch(`${API_BASE_URL}/github/sync/${teamName}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamName, githubUrl })
            });
            if (res.ok) {
                alert("✅ Repository synced successfully!");
                loadAll();
            } else {
                alert("⚠️ Failed to sync repository.");
            }
        } catch (err) {
            console.error(err);
            alert("❌ Error connecting to sync service.");
        } finally {
            setSyncingRepo(false);
        }
    };

    const pollRef = useRef(null);
    const massUploadRef = useRef(null);

    const [maxSlides, setMaxSlides] = useState(15);
    const [targetShortlist, setTargetShortlist] = useState(10);
    const [domains, setDomains] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [problemStatement, setProblemStatement] = useState('');
    const [scoringWeights, setScoringWeights] = useState(DEFAULT_WEIGHTS);

    const loadAll = useCallback(async () => {
        try {
            const [cfgRes, lbRes, allRes, statsRes, qRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/config`),
                fetch(`${API_BASE_URL}/admin/leaderboard`),
                fetch(`${API_BASE_URL}/admin/entries`),
                fetch(`${API_BASE_URL}/admin/stats`),
                fetch(`${API_BASE_URL}/admin/queue-status`),
            ]);
            if (cfgRes.ok) {
                const c = await cfgRes.json();
                if (c) {
                    setConfig(c);
                    setMaxSlides(c.maxSlides ?? 15);
                    setTargetShortlist(c.targetShortlist ?? 10);
                    setDomains(c.domains ?? []);
                    setKeywords(c.keywords ?? []);
                    setProblemStatement(c.problemStatement ?? '');
                    setScoringWeights(c.scoringWeights ?? DEFAULT_WEIGHTS);
                }
            }
            if (lbRes.ok) setLeaderboard(await lbRes.json());
            if (allRes.ok) {
                const entries = await allRes.json();
                setAllEntries(entries);

                if (tab === 'overwatch') {
                    const owData = {};
                    await Promise.all(entries.filter(e => e.githubUrl).map(async (entry) => {
                        try {
                            const res = await fetch(`${API_BASE_URL}/github/stats/${entry.id}`);
                            if (res.ok) {
                                const data = await res.json();
                                owData[entry.id] = {
                                    githubData: data,
                                    aiData: { implementedFeatures: [], missingPitchedFeatures: [], relevanceScore: 0 }
                                };
                            }
                        } catch (e) { }
                    }));
                    setOverwatchData(owData);
                }
            }
            if (statsRes.ok) setStats(await statsRes.json());
            if (qRes.ok) setQueue(await qRes.json());
        } catch { /* ignore */ }
    }, [tab]);

    useEffect(() => {
        loadAll();
        pollRef.current = setInterval(loadAll, 5000);
        return () => clearInterval(pollRef.current);
    }, [loadAll, tab]);

    const saveConfig = async (e) => {
        e.preventDefault(); setSaving(true); setSaveMsg('');
        const totalW = Object.values(scoringWeights).reduce((a, b) => a + b, 0);
        if (Math.abs(totalW - 100) > 1) { setSaveMsg('❌ Weights must sum to 100'); setSaving(false); return; }
        const res = await fetch(`${API_BASE_URL}/admin/config`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ maxSlides, targetShortlist, domains, keywords, problemStatement, scoringWeights }),
        });
        if (res.ok) { setSaveMsg('✓ Saved!'); loadAll(); } else setSaveMsg('❌ Failed');
        setSaving(false); setTimeout(() => setSaveMsg(''), 3000);
    };

    const massUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploading(true); setSaveMsg('');
        const fd = new FormData();
        files.forEach(f => fd.append('pptxFiles', f));
        const res = await fetch(`${API_BASE_URL}/admin/mass-upload`, { method: 'POST', body: fd });
        if (res.ok) {
            const d = await res.json();
            setSaveMsg(`✓ Uploaded ${d.count} teams. Click "Start AI Scoring" to begin.`);
            loadAll();
        } else setSaveMsg('❌ Upload failed');
        setUploading(false); e.target.value = '';
        setTimeout(() => setSaveMsg(''), 8000);
    };

    const startEvaluation = async () => {
        setStartingEval(true); setSaveMsg('');
        const res = await fetch(`${API_BASE_URL}/admin/start-evaluation`, { method: 'POST' });
        if (res.ok) {
            const d = await res.json();
            const eta = d.etaSeconds > 60 ? `~${Math.ceil(d.etaSeconds / 60)} min` : `~${d.etaSeconds}s`;
            setSaveMsg(`✓ Queued ${d.count} teams — ETA ${eta}`);
            loadAll();
        } else setSaveMsg('❌ Failed to start evaluation');
        setStartingEval(false);
        setTimeout(() => setSaveMsg(''), 8000);
    };

    const eliminate = async (id) => { await fetch(`${API_BASE_URL}/admin/entries/${id}/eliminate`, { method: 'POST' }); loadAll(); };
    const restore = async (id) => { await fetch(`${API_BASE_URL}/admin/entries/${id}/restore`, { method: 'POST' }); loadAll(); };
    const requeue = async (id) => { await fetch(`${API_BASE_URL}/admin/entries/${id}/requeue`, { method: 'POST' }); loadAll(); };
    const saveNote = async () => {
        if (!noteEntry) return;
        await fetch(`${API_BASE_URL}/admin/entries/${noteEntry.id}/note`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note: noteText }),
        });
        setNoteEntry(null); loadAll();
    };
    const rescore = async () => {
        const res = await fetch(`${API_BASE_URL}/admin/rescore`, { method: 'POST' });
        if (res.ok) { const d = await res.json(); setSaveMsg(`✓ Rescored ${d.updated} entries`); loadAll(); }
        setTimeout(() => setSaveMsg(''), 4000);
    };
    const publish = async () => {
        setPublishing(true);
        await fetch(`${API_BASE_URL}/admin/publish`, { method: 'POST' });
        setSaveMsg('✓ Leaderboard published to participants!');
        loadAll(); setPublishing(false); setTimeout(() => setSaveMsg(''), 5000);
    };
    const startNewRound = async () => {
        if (!confirm('Start a new round? Previous data is kept.')) return;
        setStartingNewRound(true);
        await fetch(`${API_BASE_URL}/admin/new-round`, { method: 'POST' });
        setSaveMsg('✓ New round started!'); loadAll(); setStartingNewRound(false);
        setTimeout(() => setSaveMsg(''), 4000);
    };

    const weightTotal = Object.values(scoringWeights).reduce((a, b) => a + b, 0);

    const btnPrimary = "px-5 py-2.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-full transition-all text-sm disabled:opacity-40";
    const btnSecondary = "px-4 py-2.5 bg-white/5 border border-white/10 text-white/60 font-bold rounded-full hover:bg-white/10 transition-all text-sm disabled:opacity-40";
    const btnDanger = "px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full text-xs font-bold hover:bg-red-500/20 border border-red-500/20 transition-colors";
    const cardCls = "bg-[#111] border border-white/10 rounded-2xl";

    return (
        <div className="space-y-6">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl" style={{ background: "linear-gradient(135deg, #1a1d5e 0%, #2a2f8a 20%, #4D58D4 40%, #6B63D9 60%, #7B6FE0 75%, #5a5fd6 100%)" }}>
                <div className="absolute inset-0 opacity-[0.08]">
                    {[...Array(20)].map((_, i) => (<div key={i} className="absolute w-px bg-white h-full" style={{ left: `${(i + 1) * 5}%` }} />))}
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#6B63D9]/30 rounded-full blur-[120px]" />

                <div className="relative px-8 py-10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-white text-2xl md:text-[2.5rem] font-light tracking-tight" style={{ fontFamily: "'Questrial', sans-serif", lineHeight: 1 }}>
                                Shortlisting
                            </h1>
                            <span className="text-[#B4ED57] text-3xl md:text-[4rem] leading-none block -my-1" style={{ fontFamily: "'Pixelify Sans', cursive", fontStyle: "italic" }}>
                                Engine
                            </span>
                            <p className="text-white/60 text-sm mt-2" style={{ fontFamily: "'Fustat', sans-serif" }}>Round 1 — AI-powered screening pipeline</p>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                            {saveMsg && <span className={`text-sm font-bold ${saveMsg.startsWith('✓') ? 'text-[#B4ED57]' : 'text-red-400'}`}>{saveMsg}</span>}

                            <input ref={massUploadRef} type="file" multiple accept=".pptx" className="hidden" onChange={massUpload} />
                            <button onClick={() => massUploadRef.current?.click()} disabled={uploading}
                                className="px-4 py-2.5 text-sm bg-white/10 text-white border border-white/20 rounded-full hover:bg-white/20 disabled:opacity-40 transition-all font-bold backdrop-blur-sm">
                                {uploading ? '⏳ Uploading…' : '📤 Mass Upload PPTs'}
                            </button>

                            {(stats.pending ?? 0) > 0 && (
                                <button onClick={startEvaluation} disabled={startingEval}
                                    className="px-4 py-2.5 text-sm bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 rounded-full hover:bg-[#f59e0b]/30 disabled:opacity-40 transition-all animate-pulse hover:animate-none font-bold">
                                    {startingEval ? '⏳ Starting…' : '🤖 Start AI Scoring'}
                                </button>
                            )}

                            <button onClick={loadAll} className="px-3 py-2.5 text-sm border border-white/20 rounded-full hover:bg-white/10 transition-all text-white backdrop-blur-sm">↻</button>

                            {config?.isPublished ? (
                                <>
                                    <span className="px-4 py-2.5 text-sm bg-[#B4ED57]/10 text-[#B4ED57] border border-[#B4ED57]/20 rounded-full font-bold">✓ Published</span>
                                    <button onClick={startNewRound} disabled={startingNewRound}
                                        className="px-4 py-2.5 text-sm bg-[#4D58D4]/20 text-[#4D58D4] border border-[#4D58D4]/30 rounded-full hover:bg-[#4D58D4]/30 disabled:opacity-40 transition-all font-bold">
                                        {startingNewRound ? 'Starting…' : '🔄 New Round'}
                                    </button>
                                </>
                            ) : (
                                <button onClick={publish} disabled={publishing || (stats.evaluated ?? 0) === 0}
                                    className={btnPrimary}>
                                    {publishing ? 'Publishing…' : '🚀 Publish Leaderboard'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Workflow Strip */}
            <WorkflowStrip stats={stats} queue={queue} />

            {/* Tabs */}
            <div className="flex gap-2">
                {[['leaderboard', '🏆 Leaderboard'], ['config', '⚙️ Config'], ['all', '📋 All Entries'], ['overwatch', '🛡️ Overwatch']].map(([t, label]) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${tab === t ? 'bg-[#B4ED57] text-black shadow-lg shadow-[#B4ED57]/20' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}
                        style={{ fontFamily: "'Fustat', sans-serif" }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* ────────── LEADERBOARD TAB ────────── */}
            {tab === 'leaderboard' && (
                <div className="space-y-4">
                    {leaderboard.length > 0 && (
                        <div className={`${cardCls} px-5 py-4 flex items-center justify-between`}>
                            <span className="text-sm text-white/60" style={{ fontFamily: "'Fustat', sans-serif" }}>
                                Target Shortlist: <strong className="text-white">{config?.targetShortlist || 10} teams</strong>
                            </span>
                            <span className="text-xs text-white/30" style={{ fontFamily: "'Fustat', sans-serif" }}>
                                Teams below rank {config?.targetShortlist || 10} are automatically marked for elimination.
                            </span>
                        </div>
                    )}

                    {leaderboard.length === 0 ? (
                        <div className={`${cardCls} p-16 text-center`}>
                            <p className="text-4xl mb-4">🏆</p>
                            <p className="text-white/40" style={{ fontFamily: "'Fustat', sans-serif" }}>No evaluated entries yet.</p>
                            <p className="text-white/20 text-sm mt-1" style={{ fontFamily: "'Fustat', sans-serif" }}>Upload PPTs using the "Mass Upload" button above.</p>
                        </div>
                    ) : (
                        <div className={`${cardCls} overflow-hidden`}>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="px-4 py-3 text-left text-white/30 text-[10px] uppercase tracking-widest font-bold">Rank</th>
                                        <th className="px-4 py-3 text-left text-white/30 text-[10px] uppercase tracking-widest font-bold">Team</th>
                                        <th className="px-4 py-3 text-left text-white/30 text-[10px] uppercase tracking-widest font-bold">Score</th>
                                        {Object.keys(scoringWeights).slice(0, 3).map(k => (
                                            <th key={k} className="px-4 py-3 text-left text-white/30 text-[10px] uppercase tracking-widest font-bold hidden lg:table-cell">
                                                {CRITERIA_LABELS[k]?.split(' ')[0] || k}
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-left text-white/30 text-[10px] uppercase tracking-widest font-bold">Note</th>
                                        <th className="px-4 py-3 text-left text-white/30 text-[10px] uppercase tracking-widest font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((entry, i) => {
                                        const isAboveCut = i < (config?.targetShortlist ?? 10);
                                        return (
                                            <tr key={entry.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${!isAboveCut ? 'opacity-50' : ''}`}>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex w-7 h-7 rounded-lg items-center justify-center text-xs font-bold ${isAboveCut ? 'bg-[#B4ED57]/10 text-[#B4ED57]' : 'bg-white/5 text-white/30'}`}>
                                                        {i + 1}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => setDetailEntry(entry)} className="text-white font-bold hover:text-[#B4ED57] transition-colors text-left" style={{ fontFamily: "'Fustat', sans-serif" }}>
                                                        {entry.teamName}
                                                    </button>
                                                    {entry.githubUrl && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <a href={entry.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-white/20 hover:text-[#4D58D4] transition-colors truncate max-w-[180px]">{entry.githubUrl}</a>
                                                        </div>
                                                    )}
                                                    {!entry.githubUrl && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <input
                                                                value={repoUrlInput[entry.id] || ''}
                                                                onChange={e => setRepoUrlInput(prev => ({ ...prev, [entry.id]: e.target.value }))}
                                                                placeholder="GitHub URL"
                                                                className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/20 outline-none w-40"
                                                            />
                                                            <button onClick={() => syncRepo(entry.teamName, repoUrlInput[entry.id])} disabled={syncingRepo}
                                                                className="px-2 py-1 text-[10px] bg-[#4D58D4]/20 text-[#4D58D4] rounded-lg hover:bg-[#4D58D4]/30 transition-colors font-bold">
                                                                Sync
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-[#B4ED57] font-black text-lg" style={{ fontFamily: "'Questrial', sans-serif" }}>
                                                    {entry.finalScore != null ? Math.round(entry.finalScore) : '—'}
                                                </td>
                                                {Object.keys(scoringWeights).slice(0, 3).map(k => (
                                                    <td key={k} className="px-4 py-3 hidden lg:table-cell">
                                                        <ScoreMiniBar score={entry.scores?.[k] ?? 0} />
                                                    </td>
                                                ))}
                                                <td className="px-4 py-3">
                                                    <button onClick={() => { setNoteEntry(entry); setNoteText(entry.adminNote || ''); }}
                                                        className="text-xs text-white/30 hover:text-white transition-colors max-w-[120px] truncate block" style={{ fontFamily: "'Fustat', sans-serif" }}>
                                                        {entry.adminNote || '+ Add Note'}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        {entry.status !== 'ELIMINATED' ? (
                                                            <button onClick={() => eliminate(entry.id)} className={btnDanger}>Eliminate</button>
                                                        ) : (
                                                            <button onClick={() => restore(entry.id)} className="px-3 py-1.5 bg-[#B4ED57]/10 text-[#B4ED57] rounded-full text-xs font-bold hover:bg-[#B4ED57]/20 border border-[#B4ED57]/20 transition-colors">Restore</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Failed entries */}
                    {allEntries.filter(e => e.status === 'FAILED').length > 0 && (
                        <div className={`${cardCls} p-5`}>
                            <h3 className="text-orange-400 text-sm font-bold mb-3" style={{ fontFamily: "'Fustat', sans-serif" }}>⚡ Failed Entries ({allEntries.filter(e => e.status === 'FAILED').length})</h3>
                            <div className="space-y-2">
                                {allEntries.filter(e => e.status === 'FAILED').map(e => (
                                    <div key={e.id} className="flex items-center justify-between bg-orange-500/5 border border-orange-500/10 rounded-xl px-4 py-2">
                                        <div>
                                            <span className="text-sm text-white/60" style={{ fontFamily: "'Fustat', sans-serif" }}>{e.teamName}</span>
                                            <p className="text-xs text-orange-400/70 mt-0.5">{e.failReason?.slice(0, 80)}</p>
                                        </div>
                                        <button onClick={() => requeue(e.id)} className="px-3 py-1.5 text-xs bg-orange-500/10 text-orange-400 rounded-full hover:bg-orange-500/20 transition-colors font-bold border border-orange-500/20">↻ Retry</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ────────── CONFIG TAB ────────── */}
            {tab === 'config' && (
                <form onSubmit={saveConfig} className={`${cardCls} p-8 space-y-7`}>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Target Shortlist', val: targetShortlist, set: setTargetShortlist },
                            { label: 'Max Slides', val: maxSlides, set: setMaxSlides },
                        ].map(f => (
                            <div key={f.label}>
                                <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>{f.label}</label>
                                <input type="number" value={f.val} onChange={e => f.set(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none text-sm" style={{ fontFamily: "'Fustat', sans-serif" }} />
                            </div>
                        ))}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>Scoring Weights (must sum to 100)</label>
                            <span className={`text-sm font-bold ${Math.abs(weightTotal - 100) < 2 ? 'text-[#B4ED57]' : 'text-red-400'}`}>
                                {weightTotal}/100
                            </span>
                        </div>
                        <div className="space-y-3">
                            {Object.entries(scoringWeights).map(([k, v]) => (
                                <div key={k} className="flex items-center gap-4">
                                    <span className="text-sm text-white/50 flex-1" style={{ fontFamily: "'Fustat', sans-serif" }}>{CRITERIA_LABELS[k] || k}</span>
                                    <input type="range" min={0} max={60} value={v}
                                        onChange={e => setScoringWeights(prev => ({ ...prev, [k]: parseInt(e.target.value) }))}
                                        className="w-32 accent-[#B4ED57]" />
                                    <span className="text-sm font-bold w-8 text-right text-white" style={{ fontFamily: "'Questrial', sans-serif" }}>{v}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <TagInput label="Target Domains" values={domains} onChange={setDomains} placeholder="e.g. GenAI, HealthTech" />
                    <TagInput label="Keywords / Tech Stack" values={keywords} onChange={setKeywords} placeholder="e.g. React, Python, AWS" />

                    <div>
                        <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>Problem Statement</label>
                        <textarea value={problemStatement} onChange={e => setProblemStatement(e.target.value)} rows={5}
                            placeholder="Describe the hackathon challenge..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none text-sm resize-none" style={{ fontFamily: "'Fustat', sans-serif" }} />
                    </div>

                    <div className="flex items-center gap-4">
                        <button type="submit" disabled={saving} className={btnPrimary}>
                            {saving ? 'Saving…' : '💾 Save Config'}
                        </button>
                        <button type="button" onClick={rescore} className={btnSecondary}>
                            ↻ Re-score All
                        </button>
                        {saveMsg && <span className={`text-sm font-bold ${saveMsg.startsWith('✓') ? 'text-[#B4ED57]' : 'text-red-400'}`}>{saveMsg}</span>}
                    </div>
                </form>
            )}

            {/* ────────── ALL ENTRIES TAB ────────── */}
            {tab === 'all' && (
                <div className={`${cardCls} overflow-hidden`}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                {['Team', 'Status', 'Score', 'Slides', 'Time', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-white/30 text-[10px] uppercase tracking-widest font-bold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {allEntries.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-12 text-center text-white/20" style={{ fontFamily: "'Fustat', sans-serif" }}>No submissions yet.</td></tr>
                            )}
                            {allEntries.map(e => (
                                <tr key={e.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-white" style={{ fontFamily: "'Fustat', sans-serif" }}>{e.teamName}</p>
                                        {e.failReason && <p className="text-orange-400 text-xs mt-0.5 max-w-xs truncate">{e.failReason}</p>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_BG[e.status]} ${STATUS_COLOR[e.status]} border border-white/5`}>
                                            {e.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-black text-white" style={{ fontFamily: "'Questrial', sans-serif" }}>{e.finalScore != null ? Math.round(e.finalScore) : '—'}</td>
                                    <td className="px-4 py-3 text-white/30">{e.slideCount ?? '—'}</td>
                                    <td className="px-4 py-3 text-white/30 text-xs">
                                        {e.processingTimeMs ? `${(e.processingTimeMs / 1000).toFixed(1)}s` : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5">
                                            <button onClick={() => setDetailEntry(e)} className="px-3 py-1.5 bg-white/5 text-white/50 rounded-full text-xs font-bold hover:bg-white/10 border border-white/10 transition-colors">View</button>
                                            {e.status === 'FAILED' && (
                                                <button onClick={() => requeue(e.id)} className="px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-full text-xs font-bold hover:bg-orange-500/20 border border-orange-500/20 transition-colors">↻</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ────────── NOTE MODAL ────────── */}
            <AnimatePresence>
                {noteEntry && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setNoteEntry(null)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className={`${cardCls} p-6 max-w-md w-full`} onClick={e => e.stopPropagation()}>
                            <h3 className="text-white font-bold mb-1" style={{ fontFamily: "'Questrial', sans-serif" }}>Note for {noteEntry.teamName}</h3>
                            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={4}
                                className="w-full mt-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none text-sm resize-none" style={{ fontFamily: "'Fustat', sans-serif" }}
                                placeholder="Admin notes..." />
                            <div className="flex gap-2 mt-4">
                                <button onClick={saveNote} className={btnPrimary}>Save Note</button>
                                <button onClick={() => setNoteEntry(null)} className={btnSecondary}>Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ────────── DETAIL MODAL ────────── */}
            <AnimatePresence>
                {detailEntry && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDetailEntry(null)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className={`${cardCls} p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-white text-xl font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>{detailEntry.teamName}</h3>
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold mt-1 ${STATUS_BG[detailEntry.status]} ${STATUS_COLOR[detailEntry.status]}`}>{detailEntry.status}</span>
                                </div>
                                <span className="text-3xl font-black text-[#B4ED57]" style={{ fontFamily: "'Questrial', sans-serif" }}>{detailEntry.finalScore != null ? Math.round(detailEntry.finalScore) : '—'}</span>
                            </div>

                            {detailEntry.scores && (
                                <div className="space-y-3 mb-6">
                                    {Object.entries(detailEntry.scores).map(([k, v]) => (
                                        <div key={k}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs text-white/50" style={{ fontFamily: "'Fustat', sans-serif" }}>{CRITERIA_LABELS[k] || k}</span>
                                                <span className="text-xs text-white font-bold">{v}/10</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-[#B4ED57]" style={{ width: `${(v / 10) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {detailEntry.reasoning && (
                                <div className="space-y-2 mb-4">
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>AI Reasoning</p>
                                    {Object.entries(detailEntry.reasoning).map(([k, reason]) => {
                                        const score = detailEntry.scores?.[k];
                                        return (
                                            <div key={k} className="bg-white/5 rounded-xl px-4 py-3">
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-white/60 font-bold" style={{ fontFamily: "'Fustat', sans-serif" }}>{CRITERIA_LABELS[k] || k}</span>
                                                    {score != null && <span className="text-xs text-[#B4ED57] font-bold">{score}/10</span>}
                                                </div>
                                                {reason && <p className="text-white/40 text-xs mt-1.5">💡 {reason}</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <p className="text-xs text-white/20 font-mono mt-4 break-all">ID: {detailEntry.id}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ────────── OVERWATCH (ANTI-CHEAT) TAB ────────── */}
            {tab === 'overwatch' && (
                <div className="space-y-6">
                    <div className={`${cardCls} p-6 border-red-500/20`}>
                        <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2" style={{ fontFamily: "'Questrial', sans-serif" }}>🛡️ Contributor Audit (Anti-Cheat)</h2>
                        <p className="text-sm text-white/40 mb-6" style={{ fontFamily: "'Fustat', sans-serif" }}>Cross-references registered participants against actual GitHub commits.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allEntries.filter(e => overwatchData[e.id]).map(entry => {
                                const ghStats = overwatchData[entry.id].githubData;
                                return (
                                    <div key={`contributor-${entry.id}`} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                        <h3 className="font-bold text-white mb-2" style={{ fontFamily: "'Fustat', sans-serif" }}>Team {entry.teamName}</h3>
                                        <p className="text-xs text-white/40 mb-2">Total Commits: {ghStats.totalCommits}</p>
                                        <ul className="space-y-1">
                                            {(ghStats.contributors || []).map(c => (
                                                <li key={c.author} className="text-sm text-[#B4ED57] flex justify-between">
                                                    <span>✓ {c.author}</span>
                                                    <span className="text-xs text-white/30">{c.commits} commits</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {(ghStats.contributors && ghStats.contributors.length > 0) && (
                                            <div className="h-28 mt-4 bg-black/20 rounded-xl p-2 pt-4 border border-white/5">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={ghStats.contributors}>
                                                        <XAxis dataKey="author" stroke="#333" tick={{ fontSize: 9 }} angle={-15} textAnchor="end" />
                                                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', borderRadius: '8px', color: '#fff' }} />
                                                        <Bar dataKey="commits" fill="#4D58D4" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {Object.keys(overwatchData).length === 0 && (
                                <p className="text-white/30 text-sm italic" style={{ fontFamily: "'Fustat', sans-serif" }}>No teams have synced repositories yet.</p>
                            )}
                        </div>
                    </div>

                    <div className={`${cardCls} p-6 border-[#4D58D4]/20`}>
                        <h2 className="text-xl font-bold text-[#4D58D4] mb-4 flex items-center gap-2" style={{ fontFamily: "'Questrial', sans-serif" }}>🔍 AI Progress Grid Matrix</h2>
                        <p className="text-sm text-white/40 mb-6" style={{ fontFamily: "'Fustat', sans-serif" }}>Live AI Comparison: Pitched Idea vs. Actual Codebase Implementation.</p>
                        <table className="w-full text-sm">
                            <thead className="border-b border-white/10 text-left">
                                <tr>
                                    <th className="pb-3 text-white/30 text-[10px] uppercase tracking-widest font-bold">Team</th>
                                    <th className="pb-3 text-white/30 text-[10px] uppercase tracking-widest font-bold">Relevance</th>
                                    <th className="pb-3 text-[#B4ED57] text-[10px] uppercase tracking-widest font-bold">Found Features</th>
                                    <th className="pb-3 text-red-400 text-[10px] uppercase tracking-widest font-bold">Missing Claims</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allEntries.filter(e => overwatchData[e.id]).map(entry => {
                                    const ai = overwatchData[entry.id].aiData;
                                    return (
                                        <tr key={`matrix-${entry.id}`} className="border-b border-white/5">
                                            <td className="py-3 font-bold text-white" style={{ fontFamily: "'Fustat', sans-serif" }}>{entry.teamName}</td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-bold">{ai.relevanceScore}%</span>
                                                    <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${ai.relevanceScore >= 50 ? 'bg-[#4D58D4]' : 'bg-red-400'}`} style={{ width: `${ai.relevanceScore}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-xs text-white/50 max-w-[200px]">
                                                <ul className="list-disc pl-4 space-y-1">
                                                    {(ai.implementedFeatures || []).slice(0, 3).map((f, i) => <li key={i} className="truncate">{f}</li>)}
                                                    {ai.implementedFeatures?.length > 3 && <li className="text-white/20 italic">+ {ai.implementedFeatures.length - 3} more</li>}
                                                </ul>
                                            </td>
                                            <td className="py-3 text-xs text-white/40 max-w-[200px]">
                                                <ul className="list-disc pl-4 space-y-1 text-red-400/80">
                                                    {(ai.missingPitchedFeatures || []).slice(0, 3).map((f, i) => <li key={i} className="truncate">{f}</li>)}
                                                    {ai.missingPitchedFeatures?.length > 3 && <li className="text-white/20 italic">+ {ai.missingPitchedFeatures.length - 3} more</li>}
                                                </ul>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {Object.keys(overwatchData).length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-6 text-white/20 italic" style={{ fontFamily: "'Fustat', sans-serif" }}>No AI scans completed yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
