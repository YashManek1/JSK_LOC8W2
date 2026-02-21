import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
    PENDING: { icon: '⏳', label: 'In Queue', color: 'text-neutral-400', bg: 'bg-neutral-500/10', pulse: true },
    PROCESSING: { icon: '🤖', label: 'AI Scoring', color: 'text-yellow-400', bg: 'bg-yellow-500/10', pulse: true },
    EVALUATED: { icon: '✅', label: 'Evaluated', color: 'text-green-400', bg: 'bg-green-500/10', pulse: false },
    ELIMINATED: { icon: '❌', label: 'Eliminated', color: 'text-red-400', bg: 'bg-red-500/10', pulse: false },
    FAILED: { icon: '⚠️', label: 'Failed', color: 'text-orange-400', bg: 'bg-orange-500/10', pulse: false },
};

const CRITERIA_LABELS = {
    problemRelevance: 'Problem Relevance & Domain Fit',
    innovation: 'Innovation & Uniqueness',
    technicalDepth: 'Technical Depth & Feasibility',
    marketImpact: 'Go-to-Market / Real-World Impact',
    slideQuality: 'Slide Quality & Communication',
};

function ScoreRing({ score, size = 120 }) {
    const r = 44;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 70 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';

    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1s ease' }} />
            <text x="50" y="45" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{score}</text>
            <text x="50" y="62" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">/100</text>
        </svg>
    );
}

export default function ShortlistResult() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const intervalRef = useRef(null);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/shortlist/${id}`);
            if (!res.ok) { setError('Entry not found.'); return; }
            const d = await res.json();
            setData(d);
            // Stop polling once terminal state reached
            if (['EVALUATED', 'ELIMINATED', 'FAILED'].includes(d.status)) {
                clearInterval(intervalRef.current);
            }
        } catch { setError('Network error.'); }
    };

    useEffect(() => {
        fetchData();
        intervalRef.current = setInterval(fetchData, 4000);
        return () => clearInterval(intervalRef.current);
    }, [id]);

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-400">{error}</p>
        </div>
    );

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );

    const cfg = STATUS_CONFIG[data.status] || STATUS_CONFIG.PENDING;
    const isPublished = data.config?.isPublished;
    const effectiveScore = data.adminOverride ?? data.finalScore;
    const pptScores = data.pptScores || {};
    const pptXaiReasons = data.pptXaiReasons || {};

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
            className="min-h-screen px-4 py-12"
        >
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            </div>

            <div className="max-w-2xl mx-auto relative z-10 space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-1">{data.teamName}</h1>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${cfg.bg} ${cfg.color}`}>
                        <span className={cfg.pulse ? 'animate-pulse' : ''}>{cfg.icon}</span>
                        {cfg.label}
                    </div>
                </div>

                {/* In-queue / Processing card */}
                {(data.status === 'PENDING' || data.status === 'PROCESSING') && (
                    <div className="glass-strong rounded-2xl p-8 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto relative">
                            <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                            <div className="absolute inset-0 border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                            <div className="absolute inset-3 flex items-center justify-center text-xl">
                                {data.status === 'PENDING' ? '⏳' : '🤖'}
                            </div>
                        </div>
                        <div>
                            <p className="text-white font-semibold">
                                {data.status === 'PENDING' ? 'Waiting in queue…' : 'Groq AI is scoring your PPT…'}
                            </p>
                            <p className="text-neutral-500 text-sm mt-1">
                                {data.status === 'PENDING'
                                    ? 'Your submission is queued. This usually takes 45–90 seconds once started.'
                                    : 'Evaluating across 5 criteria with strict AI scoring. Hang tight…'}
                            </p>
                        </div>
                        <div className="flex justify-center gap-1">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Failed */}
                {data.status === 'FAILED' && (
                    <div className="glass-strong rounded-2xl p-6 border border-orange-500/20">
                        <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">Evaluation Failed</p>
                        <p className="text-orange-300 text-sm">{data.failReason || 'An error occurred. Please contact the organiser.'}</p>
                    </div>
                )}

                {/* Eliminated */}
                {data.status === 'ELIMINATED' && (
                    <div className="glass-strong rounded-2xl p-6 border border-red-500/20 bg-red-500/5">
                        <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Not Selected</p>
                        <p className="text-red-300 text-sm">Your team was not selected for the next round. Better luck next time!</p>
                    </div>
                )}

                {/* Results — only show if published */}
                <AnimatePresence>
                    {data.status === 'EVALUATED' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                            {!isPublished ? (
                                <div className="glass-strong rounded-2xl p-8 text-center">
                                    <p className="text-3xl mb-3">🔒</p>
                                    <p className="text-white font-semibold">Results Not Yet Published</p>
                                    <p className="text-neutral-500 text-sm mt-1">
                                        Your submission was evaluated successfully. Results will be visible once the admin publishes the leaderboard.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Score + Rank */}
                                    <div className="glass-strong rounded-2xl p-8 flex items-center gap-8">
                                        <ScoreRing score={Math.round(effectiveScore ?? 0)} size={120} />
                                        <div>
                                            {data.rank && (
                                                <div className="text-4xl font-bold text-white mb-1">#{data.rank}</div>
                                            )}
                                            <p className="text-neutral-400 text-sm">Overall Score</p>
                                            <p className="text-neutral-600 text-xs mt-1">{data.slideCount} slides evaluated</p>
                                            {data.adminOverride != null && (
                                                <p className="text-yellow-400 text-xs mt-1">⊕ Score adjusted by admin</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* 5-Criteria Breakdown */}
                                    {Object.keys(pptScores).length > 0 && (
                                        <div className="glass-strong rounded-2xl p-6 space-y-5">
                                            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                                                Evaluation Breakdown
                                            </h3>
                                            {Object.entries(pptScores).map(([key, val]) => {
                                                const score = typeof val === 'object' ? val.score : val;
                                                const pct = Math.round((score / 10) * 100);
                                                const barColor = pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';
                                                const reason = typeof val === 'object' ? val.reason : pptXaiReasons[key];
                                                return (
                                                    <div key={key}>
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <span className="text-sm text-white">
                                                                {CRITERIA_LABELS[key] || key.replace(/([A-Z])/g, ' $1').trim()}
                                                            </span>
                                                            <span className="text-sm font-bold">{score}/10</span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${pct}%` }}
                                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                                className={`h-full rounded-full ${barColor}`}
                                                            />
                                                        </div>
                                                        {reason && (
                                                            <p className="text-neutral-500 text-xs mt-1.5">💡 {reason}</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Entry ID */}
                <p className="text-center text-xs text-neutral-700 font-mono">Submission ID: {id}</p>
            </div>
        </motion.div>
    );
}
