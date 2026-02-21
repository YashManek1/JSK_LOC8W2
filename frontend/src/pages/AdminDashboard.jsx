import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    PENDING: 'text-neutral-400', PROCESSING: 'text-yellow-400',
    EVALUATED: 'text-green-400', ELIMINATED: 'text-red-400', FAILED: 'text-orange-400',
};
const STATUS_BG = {
    PENDING: 'bg-neutral-500/10', PROCESSING: 'bg-yellow-500/10',
    EVALUATED: 'bg-green-500/10', ELIMINATED: 'bg-red-500/10', FAILED: 'bg-orange-500/10',
};

function TagInput({ label, values, onChange, placeholder }) {
    const [input, setInput] = useState('');
    const add = () => { const v = input.trim(); if (v && !values.includes(v)) onChange([...values, v]); setInput(''); };
    return (
        <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">{label}</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
                {values.map(v => (
                    <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-lg text-xs text-white">
                        {v}<button type="button" onClick={() => onChange(values.filter(x => x !== v))} className="text-neutral-500 hover:text-white">×</button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
                    placeholder={placeholder} className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-600 outline-none text-sm" />
                <button type="button" onClick={add} className="px-3 py-2 bg-white/10 rounded-xl text-sm text-white hover:bg-white/20 transition-colors">Add</button>
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
        <div className="glass-strong rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Screening Pipeline</p>
                {etaStr && (
                    <span className="text-xs text-yellow-400 animate-pulse">⏱ {etaStr} remaining</span>
                )}
            </div>
            <div className="flex items-center gap-2">
                {steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                        <div className={`flex flex-col items-center gap-1 ${s.active ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all ${s.active ? 'bg-white/10 border-white/30 shadow-lg shadow-white/5' : 'bg-white/5 border-white/5'
                                }`}>
                                <span className={s.active ? 'animate-pulse' : ''}>{s.icon}</span>
                            </div>
                            <span className="text-xs text-neutral-400 text-center whitespace-nowrap">{s.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className="flex-1 h-px bg-white/10 mb-4" />
                        )}
                    </div>
                ))}
            </div>
            {/* Live status bar */}
            <div className="flex gap-3 mt-4 text-xs text-neutral-500">
                {[['Pending', stats.pending, 'text-neutral-400'], ['Processing', stats.processing, 'text-yellow-400'],
                ['Evaluated', stats.evaluated, 'text-green-400'], ['Eliminated', stats.eliminated, 'text-red-400'],
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
    const color = pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="flex items-center gap-1.5 w-20">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-neutral-400">{score}</span>
        </div>
    );
}

export default function AdminDashboard() {
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
    const pollRef = useRef(null);
    const massUploadRef = useRef(null);

    // Config form
    const [maxSlides, setMaxSlides] = useState(15);
    const [targetShortlist, setTargetShortlist] = useState(10);
    const [domains, setDomains] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [problemStatement, setProblemStatement] = useState('');
    const [scoringWeights, setScoringWeights] = useState(DEFAULT_WEIGHTS);

    const loadAll = useCallback(async () => {
        try {
            const [cfgRes, lbRes, allRes, statsRes, qRes] = await Promise.all([
                fetch('/api/admin/config'),
                fetch('/api/admin/leaderboard'),
                fetch('/api/admin/entries'),
                fetch('/api/admin/stats'),
                fetch('/api/admin/queue-status'),
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
            if (allRes.ok) setAllEntries(await allRes.json());
            if (statsRes.ok) setStats(await statsRes.json());
            if (qRes.ok) setQueue(await qRes.json());
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        loadAll();
        pollRef.current = setInterval(loadAll, 5000);
        return () => clearInterval(pollRef.current);
    }, [loadAll]);

    const saveConfig = async (e) => {
        e.preventDefault(); setSaving(true); setSaveMsg('');
        const totalW = Object.values(scoringWeights).reduce((a, b) => a + b, 0);
        if (Math.abs(totalW - 100) > 1) { setSaveMsg('❌ Weights must sum to 100'); setSaving(false); return; }
        const res = await fetch('/api/admin/config', {
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
        const res = await fetch('/api/admin/mass-upload', { method: 'POST', body: fd });
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
        const res = await fetch('/api/admin/start-evaluation', { method: 'POST' });
        if (res.ok) {
            const d = await res.json();
            const eta = d.etaSeconds > 60 ? `~${Math.ceil(d.etaSeconds / 60)} min` : `~${d.etaSeconds}s`;
            setSaveMsg(`✓ Queued ${d.count} teams — ETA ${eta}`);
            loadAll();
        } else setSaveMsg('❌ Failed to start evaluation');
        setStartingEval(false);
        setTimeout(() => setSaveMsg(''), 8000);
    };

    const eliminate = async (id) => {
        await fetch(`/api/admin/entries/${id}/eliminate`, { method: 'POST' });
        loadAll();
    };
    const restore = async (id) => {
        await fetch(`/api/admin/entries/${id}/restore`, { method: 'POST' });
        loadAll();
    };
    const requeue = async (id) => {
        await fetch(`/api/admin/entries/${id}/requeue`, { method: 'POST' });
        loadAll();
    };
    const saveNote = async () => {
        if (!noteEntry) return;
        await fetch(`/api/admin/entries/${noteEntry.id}/note`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note: noteText }),
        });
        setNoteEntry(null); loadAll();
    };
    const rescore = async () => {
        const res = await fetch('/api/admin/rescore', { method: 'POST' });
        if (res.ok) { const d = await res.json(); setSaveMsg(`✓ Rescored ${d.updated} entries`); loadAll(); }
        setTimeout(() => setSaveMsg(''), 4000);
    };
    const publish = async () => {
        setPublishing(true);
        await fetch('/api/admin/publish', { method: 'POST' });
        setSaveMsg('✓ Leaderboard published to participants!');
        loadAll(); setPublishing(false); setTimeout(() => setSaveMsg(''), 5000);
    };
    const startNewRound = async () => {
        if (!confirm('Start a new round? Previous data is kept.')) return;
        setStartingNewRound(true);
        await fetch('/api/admin/new-round', { method: 'POST' });
        setSaveMsg('✓ New round started!'); loadAll(); setStartingNewRound(false);
        setTimeout(() => setSaveMsg(''), 4000);
    };

    const weightTotal = Object.values(scoringWeights).reduce((a, b) => a + b, 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen px-4 py-8">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* ── Header ── */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Admin <span className="text-neutral-400">Dashboard</span></h1>
                        <p className="text-neutral-500 text-xs mt-0.5">Round 1 Shortlisting Engine — V2</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        {saveMsg && <span className={`text-sm ${saveMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{saveMsg}</span>}

                        {/* Mass Upload */}
                        <input ref={massUploadRef} type="file" multiple accept=".pptx" className="hidden" onChange={massUpload} />
                        <button onClick={() => massUploadRef.current?.click()} disabled={uploading}
                            className="px-3 py-2 text-sm bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 disabled:opacity-40 transition-colors">
                            {uploading ? '⏳ Uploading…' : '📤 Mass Upload PPTs'}
                        </button>

                        {(stats.pending ?? 0) > 0 && (
                            <button onClick={startEvaluation} disabled={startingEval}
                                className="px-3 py-2 text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/30 disabled:opacity-40 transition-colors animate-pulse hover:animate-none">
                                {startingEval ? '⏳ Starting…' : '🤖 Start AI Scoring'}
                            </button>
                        )}

                        <button onClick={loadAll} className="px-3 py-2 text-sm border border-white/10 rounded-xl hover:bg-white/5 transition-colors">↻</button>

                        {config?.isPublished ? (
                            <>
                                <span className="px-3 py-2 text-sm bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl">✓ Published</span>
                                <button onClick={startNewRound} disabled={startingNewRound}
                                    className="px-3 py-2 text-sm bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 disabled:opacity-40 transition-colors">
                                    {startingNewRound ? 'Starting…' : '🔄 New Round'}
                                </button>
                            </>
                        ) : (
                            <button onClick={publish} disabled={publishing || (stats.evaluated ?? 0) === 0}
                                className="px-3 py-2 text-sm bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 disabled:opacity-40 transition-colors">
                                {publishing ? 'Publishing…' : '🚀 Publish Leaderboard'}
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Workflow Strip ── */}
                <WorkflowStrip stats={stats} queue={queue} />

                {/* ── Tabs ── */}
                <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
                    {[['leaderboard', '🏆 Leaderboard'], ['config', '⚙️ Config'], ['all', '📋 All Entries']].map(([t, label]) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* ────────── LEADERBOARD TAB ────────── */}
                {tab === 'leaderboard' && (
                    <div className="space-y-4">
                        {/* Auto-Cutoff Info */}
                        {leaderboard.length > 0 && (
                            <div className="glass-strong rounded-xl px-5 py-4 flex items-center justify-between">
                                <span className="text-sm text-neutral-300">
                                    Target Shortlist: <strong className="text-white">{config?.targetShortlist || 10} teams</strong>
                                </span>
                                <span className="text-xs text-neutral-500">
                                    Teams below rank {config?.targetShortlist || 10} are automatically marked for elimination.
                                </span>
                            </div>
                        )}

                        {leaderboard.length === 0 ? (
                            <div className="glass-strong rounded-2xl p-16 text-center">
                                <p className="text-4xl mb-4">🏆</p>
                                <p className="text-neutral-400">No evaluated entries yet.</p>
                                <p className="text-neutral-600 text-sm mt-1">Upload PPTs using the "Mass Upload" button above.</p>
                            </div>
                        ) : (
                            <div className="glass-strong rounded-2xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="px-4 py-3 text-left text-xs text-neutral-500 uppercase tracking-wider">Rank</th>
                                            <th className="px-4 py-3 text-left text-xs text-neutral-500 uppercase tracking-wider">Team</th>
                                            <th className="px-4 py-3 text-left text-xs text-neutral-500 uppercase tracking-wider">Score</th>
                                            {Object.keys(scoringWeights).slice(0, 3).map(k => (
                                                <th key={k} className="px-4 py-3 text-left text-xs text-neutral-500 uppercase tracking-wider hidden lg:table-cell">
                                                    {CRITERIA_LABELS[k]?.split(' ')[0] || k}
                                                </th>
                                            ))}
                                            <th className="px-4 py-3 text-left text-xs text-neutral-500 uppercase tracking-wider">Note</th>
                                            <th className="px-4 py-3 text-left text-xs text-neutral-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((entry, idx) => {
                                            const score = entry.effectiveScore ?? 0;
                                            const target = config?.targetShortlist || 10;
                                            const belowCutoff = idx >= target;

                                            return (
                                                <tr key={entry.id}
                                                    className={`border-b border-white/[0.04] transition-colors ${belowCutoff ? 'opacity-50 bg-red-900/10 hover:bg-red-900/20' : 'bg-green-900/10 hover:bg-green-900/20'}`}>
                                                    <td className="px-4 py-3">
                                                        <span className={`font-bold text-lg ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-neutral-300' : idx === 2 ? 'text-orange-400' : 'text-neutral-500'}`}>
                                                            #{entry.rank}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-white">{entry.teamName}</p>
                                                        {entry.adminOverride != null && <p className="text-yellow-400 text-xs">⊕ override</p>}
                                                        {belowCutoff ? (
                                                            <p className="text-red-400 text-xs mt-0.5">Below cutoff</p>
                                                        ) : (
                                                            <p className="text-green-400 text-xs mt-0.5">Shortlisted</p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl font-bold text-white">{Math.round(score)}</span>
                                                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${score}%` }} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {Object.entries(entry.pptScores || {}).slice(0, 3).map(([k, v]) => (
                                                        <td key={k} className="px-4 py-3 hidden lg:table-cell">
                                                            <ScoreMiniBar score={typeof v === 'object' ? v.score : v} />
                                                        </td>
                                                    ))}
                                                    <td className="px-4 py-3">
                                                        <button onClick={() => { setNoteEntry(entry); setNoteText(entry.adminNote || ''); }}
                                                            className={`text-xs px-2 py-1 rounded-lg transition-colors ${entry.adminNote ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-neutral-500 hover:text-white'}`}>
                                                            {entry.adminNote ? '📝 Edit' : '+ Add note'}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-1.5">
                                                            <button onClick={() => setDetailEntry(entry)}
                                                                className="px-2 py-1 text-xs bg-white/5 rounded-lg hover:bg-white/10 transition-colors">Details</button>
                                                            <button onClick={() => eliminate(entry.id)}
                                                                className="px-2 py-1 text-xs bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">Eliminate</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Eliminated section */}
                        {allEntries.filter(e => e.status === 'ELIMINATED').length > 0 && (
                            <div className="glass-strong rounded-2xl p-4">
                                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
                                    Eliminated ({allEntries.filter(e => e.status === 'ELIMINATED').length})
                                </p>
                                <div className="space-y-2">
                                    {allEntries.filter(e => e.status === 'ELIMINATED').map(e => (
                                        <div key={e.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-red-500/5 border border-red-500/10">
                                            <span className="text-sm text-neutral-400 line-through">{e.teamName}</span>
                                            <div className="flex gap-2 items-center">
                                                <span className="text-xs text-neutral-600">{Math.round(e.finalScore ?? 0)}/100</span>
                                                <button onClick={() => restore(e.id)}
                                                    className="px-2 py-1 text-xs bg-white/5 text-neutral-400 rounded-lg hover:bg-white/10 hover:text-white transition-colors">↩ Restore</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Failed section */}
                        {allEntries.filter(e => e.status === 'FAILED').length > 0 && (
                            <div className="glass-strong rounded-2xl p-4">
                                <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">
                                    Failed ({allEntries.filter(e => e.status === 'FAILED').length})
                                </p>
                                <div className="space-y-2">
                                    {allEntries.filter(e => e.status === 'FAILED').map(e => (
                                        <div key={e.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                                            <div>
                                                <span className="text-sm text-neutral-400">{e.teamName}</span>
                                                <p className="text-xs text-orange-500 mt-0.5">{e.failReason?.slice(0, 80)}</p>
                                            </div>
                                            <button onClick={() => requeue(e.id)}
                                                className="px-2 py-1 text-xs bg-orange-500/10 text-orange-400 rounded-lg hover:bg-orange-500/20 transition-colors">↻ Retry</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ────────── CONFIG TAB ────────── */}
                {tab === 'config' && (
                    <form onSubmit={saveConfig} className="glass-strong rounded-2xl p-8 space-y-7">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Target Shortlist', val: targetShortlist, set: setTargetShortlist },
                                { label: 'Max Slides', val: maxSlides, set: setMaxSlides },
                            ].map(f => (
                                <div key={f.label}>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">{f.label}</label>
                                    <input type="number" value={f.val} onChange={e => f.set(parseInt(e.target.value))}
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none text-sm" />
                                </div>
                            ))}
                        </div>

                        {/* 5-Factor Scoring Weights */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-medium text-neutral-400">Scoring Weights (must sum to 100)</label>
                                <span className={`text-sm font-bold ${Math.abs(weightTotal - 100) < 2 ? 'text-green-400' : 'text-red-400'}`}>
                                    {weightTotal}/100
                                </span>
                            </div>
                            <div className="space-y-3">
                                {Object.entries(scoringWeights).map(([k, v]) => (
                                    <div key={k} className="flex items-center gap-4">
                                        <span className="text-sm text-neutral-400 flex-1">{CRITERIA_LABELS[k] || k}</span>
                                        <input type="range" min={0} max={60} value={v}
                                            onChange={e => setScoringWeights(prev => ({ ...prev, [k]: parseInt(e.target.value) }))}
                                            className="w-32 accent-white" />
                                        <span className="text-sm font-bold w-8 text-right">{v}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <TagInput label="Target Domains" values={domains} onChange={setDomains} placeholder="e.g. GenAI, HealthTech" />
                        <TagInput label="Keywords / Tech Stack" values={keywords} onChange={setKeywords} placeholder="e.g. React, Python, AWS" />

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Problem Statement</label>
                            <textarea value={problemStatement} onChange={e => setProblemStatement(e.target.value)} rows={5}
                                placeholder="Describe the hackathon challenge..."
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-600 outline-none text-sm resize-none" />
                        </div>

                        <div className="flex items-center gap-4">
                            <button type="submit" disabled={saving}
                                className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 disabled:opacity-40">
                                {saving ? 'Saving…' : '💾 Save Config'}
                            </button>
                            <button type="button" onClick={rescore}
                                className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-neutral-400 hover:text-white transition-colors">
                                ↻ Re-score All with New Weights
                            </button>
                            {saveMsg && <span className={`text-sm ${saveMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{saveMsg}</span>}
                        </div>
                    </form>
                )}

                {/* ────────── ALL ENTRIES TAB ────────── */}
                {tab === 'all' && (
                    <div className="glass-strong rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-4 py-3 text-left text-xs text-neutral-500 uppercase tracking-wider">Team</th>
                                    <th className="px-4 py-3 text-left text-xs text-neutral-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs text-neutral-500 uppercase tracking-wider">Score</th>
                                    <th className="px-4 py-3 text-left text-xs text-neutral-500 uppercase tracking-wider">Slides</th>
                                    <th className="px-4 py-3 text-left text-xs text-neutral-500 uppercase tracking-wider">Time</th>
                                    <th className="px-4 py-3 text-left text-xs text-neutral-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allEntries.length === 0 && (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center text-neutral-600">No submissions yet.</td></tr>
                                )}
                                {allEntries.map(e => (
                                    <tr key={e.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-white">{e.teamName}</p>
                                            {e.failReason && <p className="text-orange-400 text-xs mt-0.5 max-w-xs truncate">{e.failReason}</p>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_BG[e.status]} ${STATUS_COLOR[e.status]}`}>
                                                {e.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-bold">{e.finalScore != null ? Math.round(e.finalScore) : '—'}</td>
                                        <td className="px-4 py-3 text-neutral-500">{e.slideCount ?? '—'}</td>
                                        <td className="px-4 py-3 text-neutral-500 text-xs">
                                            {e.processingTimeMs ? `${(e.processingTimeMs / 1000).toFixed(1)}s` : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1.5">
                                                <button onClick={() => setDetailEntry(e)} className="px-2 py-1 text-xs bg-white/5 rounded-lg hover:bg-white/10">Details</button>
                                                {e.status === 'EVALUATED' && <button onClick={() => eliminate(e.id)} className="px-2 py-1 text-xs bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20">Eliminate</button>}
                                                {e.status === 'ELIMINATED' && <button onClick={() => restore(e.id)} className="px-2 py-1 text-xs bg-white/5 text-neutral-400 rounded-lg hover:bg-white/10 hover:text-white">Restore</button>}
                                                {e.status === 'FAILED' && <button onClick={() => requeue(e.id)} className="px-2 py-1 text-xs bg-orange-500/10 text-orange-400 rounded-lg hover:bg-orange-500/20">Retry</button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Admin Note Modal ── */}
            <AnimatePresence>
                {noteEntry && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setNoteEntry(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="glass-strong rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold mb-1">Admin Note</h3>
                            <p className="text-neutral-500 text-sm mb-4">{noteEntry.teamName} — <span className="text-yellow-400 text-xs">Only visible to admins</span></p>
                            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={4}
                                placeholder="Private evaluation note, observations, reasons for elimination..."
                                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-600 outline-none text-sm resize-none mb-4" />
                            <div className="flex gap-3">
                                <button onClick={saveNote} className="flex-1 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200">Save Note</button>
                                <button onClick={() => setNoteEntry(null)} className="px-5 py-2.5 border border-white/10 rounded-xl text-neutral-400 hover:text-white">Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Detail Modal ── */}
            <AnimatePresence>
                {detailEntry && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setDetailEntry(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="glass-strong rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <h3 className="text-xl font-semibold">{detailEntry.teamName}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs ${STATUS_COLOR[detailEntry.status]}`}>{detailEntry.status}</span>
                                        {detailEntry.rank && <span className="text-xs text-neutral-500">Rank #{detailEntry.rank}</span>}
                                        <span className="text-xs text-neutral-500">{detailEntry.slideCount} slides</span>
                                        {detailEntry.processingTimeMs && <span className="text-xs text-neutral-500">{(detailEntry.processingTimeMs / 1000).toFixed(1)}s</span>}
                                    </div>
                                </div>
                                <button onClick={() => setDetailEntry(null)} className="text-neutral-500 hover:text-white text-xl">×</button>
                            </div>

                            {/* Admin Note display */}
                            {detailEntry.adminNote && (
                                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                    <p className="text-xs font-semibold text-yellow-400 mb-1">📝 Admin Note (private)</p>
                                    <p className="text-yellow-200 text-sm">{detailEntry.adminNote}</p>
                                </div>
                            )}

                            {/* Score summary */}
                            <div className="flex items-center gap-4 mb-5 p-4 bg-white/[0.03] rounded-xl">
                                <div className="text-4xl font-bold text-white">{Math.round(detailEntry.effectiveScore ?? detailEntry.finalScore ?? 0)}</div>
                                <div className="text-sm text-neutral-500">/100 final score{detailEntry.adminOverride != null ? ' (overridden)' : ''}</div>
                            </div>

                            {/* Per-criterion breakdown */}
                            {detailEntry.pptScores && Object.keys(detailEntry.pptScores).length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">5-Factor Breakdown</p>
                                    {Object.entries(detailEntry.pptScores).map(([k, v]) => {
                                        const score = typeof v === 'object' ? v.score : v;
                                        const reason = typeof v === 'object' ? v.reason : (detailEntry.pptXaiReasons?.[k]);
                                        const pct = (score / 10) * 100;
                                        return (
                                            <div key={k}>
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-sm text-white">{CRITERIA_LABELS[k] || k}</span>
                                                    <span className={`text-sm font-bold ${score >= 7 ? 'text-green-400' : score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>{score}/10</span>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                                                </div>
                                                {reason && <p className="text-neutral-500 text-xs mt-1.5">💡 {reason}</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <p className="text-xs text-neutral-700 font-mono mt-4 break-all">ID: {detailEntry.id}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
