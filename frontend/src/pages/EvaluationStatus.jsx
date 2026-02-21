import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const pageVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

/** Collapsible section */
function Section({ title, badge, badgeColor, children, defaultOpen = false, delay = 0 }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-strong rounded-2xl overflow-hidden mb-4">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors text-left">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">{title}</h3>
                    {badge != null && (
                        <span className={`inline-flex items-center justify-center px-2.5 h-5 rounded-full text-xs font-medium ${badgeColor || 'bg-white/10 text-white'}`}>{badge}</span>
                    )}
                </div>
                <svg className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <div className="px-6 pb-5 border-t border-white/5 pt-4">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

const scoreColor = (s) => s >= 70 ? '#4ade80' : s >= 40 ? '#fbbf24' : '#f87171';
const scoreLabel = (s) => s >= 90 ? 'Excellent' : s >= 70 ? 'Good' : s >= 50 ? 'Average' : s >= 30 ? 'Below Average' : 'Poor';

export default function EvaluationStatus() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const scoreRef = useRef(null);

    useEffect(() => {
        let timer, isMounted = true;
        const poll = async () => {
            try {
                const res = await fetch(`/api/evaluate/${id}`);
                if (!res.ok) throw new Error('Evaluation not found');
                const result = await res.json();
                if (isMounted) setData(result);
                if (result.status === 'PENDING' || result.status === 'PROCESSING') timer = setTimeout(poll, 3000);
            } catch (err) { if (isMounted) setError(err.message); }
        };
        poll();
        return () => { isMounted = false; clearTimeout(timer); };
    }, [id]);

    useEffect(() => {
        if (data?.status === 'COMPLETED' && scoreRef.current) {
            gsap.fromTo(scoreRef.current, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)', delay: 0.3 });
        }
    }, [data?.status]);

    // Defensively parse claimsVerified — handle null, string, or array
    let claims = [];
    if (data?.claimsVerified) {
        if (Array.isArray(data.claimsVerified)) {
            claims = data.claimsVerified;
        } else if (typeof data.claimsVerified === 'string') {
            try { claims = JSON.parse(data.claimsVerified); } catch { claims = []; }
        }
    }
    // Filter to only valid claim objects
    claims = claims.filter(c => c && typeof c === 'object' && 'claim' in c);
    const verifiedCount = claims.filter(c => c.verified === true).length;
    const failedCount = claims.filter(c => !c.verified).length;

    if (error) {
        return (
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen flex flex-col items-center justify-center px-4">
                <div className="glass-strong rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Error</h2>
                    <p className="text-neutral-400 mb-6">{error}</p>
                    <Link to="/" className="text-white underline underline-offset-4 hover:text-neutral-300">← Back</Link>
                </div>
            </motion.div>
        );
    }

    const isLoading = !data || data.status === 'PENDING' || data.status === 'PROCESSING';
    const isFailed = data?.status === 'FAILED';
    const isCompleted = data?.status === 'COMPLETED';

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen flex flex-col items-center px-4 py-12">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            </div>

            <Link to="/" className="mb-8 relative z-10 flex items-center gap-2 text-neutral-500 hover:text-white transition-colors self-start max-w-3xl w-full mx-auto">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Back
            </Link>

            <AnimatePresence mode="wait">
                {/* Loading */}
                {isLoading && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-strong rounded-2xl p-12 max-w-md w-full text-center relative z-10">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                            {[0, 1, 2, 3].map((i) => (
                                <motion.div key={i} className="absolute w-3 h-3 bg-white rounded-full" style={{ left: '50%', top: '50%', marginLeft: -6, marginTop: -6 }}
                                    animate={{ x: [0, Math.cos((i * Math.PI) / 2) * 35, 0], y: [0, Math.sin((i * Math.PI) / 2) * 35, 0], scale: [1, 0.6, 1], opacity: [1, 0.4, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
                                />
                            ))}
                            <motion.div className="absolute inset-0 border-2 border-white/20 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">{data?.status === 'PROCESSING' ? 'Deep Code Analysis…' : 'Queued'}</h2>
                        <p className="text-neutral-500 text-sm">{data?.status === 'PROCESSING' ? 'Cloning repo, packing codebase, analyzing every file' : 'Your submission is in the queue'}</p>
                        {data?.teamName && <p className="text-neutral-600 text-xs mt-4 font-mono">{data.teamName}</p>}
                    </motion.div>
                )}

                {/* Failed */}
                {isFailed && (
                    <motion.div key="failed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-strong rounded-2xl p-8 max-w-md w-full text-center relative z-10">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Evaluation Failed</h2>
                        <p className="text-neutral-400 text-sm mb-4">{data.reality || 'An unexpected error occurred.'}</p>
                        <Link to="/" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-neutral-200 transition-colors">Try Again</Link>
                    </motion.div>
                )}

                {/* Completed */}
                {isCompleted && (
                    <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-3xl relative z-10">
                        {/* Header */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-8">
                            <p className="text-neutral-500 text-sm mb-1">Evaluation Complete</p>
                            <h2 className="text-3xl font-bold">{data.teamName}</h2>
                            <a href={data.githubUrl} target="_blank" rel="noreferrer" className="text-neutral-500 text-sm hover:text-white transition-colors font-mono">{data.githubUrl}</a>
                        </motion.div>

                        {/* Score + Benchmarks */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <motion.div ref={scoreRef} className="glass-strong rounded-2xl p-6 flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="relative w-32 h-32">
                                    <svg className="w-full h-full score-ring" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                                        <circle cx="60" cy="60" r="52" fill="none" stroke={scoreColor(data.score ?? 0)} strokeWidth="8" strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 52}`} strokeDashoffset={`${2 * Math.PI * 52 * (1 - (data.score ?? 0) / 100)}`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold" style={{ color: scoreColor(data.score ?? 0) }}>{data.score ?? 0}</span>
                                        <span className="text-neutral-500 text-xs">/ 100</span>
                                    </div>
                                </div>
                                <p className="text-sm mt-2 font-medium" style={{ color: scoreColor(data.score ?? 0) }}>{scoreLabel(data.score ?? 0)}</p>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-strong rounded-2xl p-6 md:col-span-2">
                                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Pipeline Benchmarks</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-2xl font-bold">{data.processingTimeMs ? `${(data.processingTimeMs / 1000).toFixed(1)}s` : '—'}</p><p className="text-neutral-500 text-xs">Processing Time</p></div>
                                    <div><p className="text-2xl font-bold">{data.githubFileTree?.length || 0}</p><p className="text-neutral-500 text-xs">Files in Repo</p></div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            <span className="text-green-400">{verifiedCount}</span>
                                            <span className="text-neutral-600 mx-1">/</span>
                                            <span className="text-red-400">{failedCount}</span>
                                        </p>
                                        <p className="text-neutral-500 text-xs">Verified / Failed Claims</p>
                                    </div>
                                    <div><p className="text-2xl font-bold">{data.repoStats?.packedSizeChars ? `${(data.repoStats.packedSizeChars / 1024).toFixed(0)}KB` : '—'}</p><p className="text-neutral-500 text-xs">Codebase Analyzed</p></div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Claims Verification Checkpoints — ALWAYS OPEN */}
                        {claims.length > 0 && (
                            <Section title="Claims Verification" badge={`${verifiedCount}✓ ${failedCount}✗`} badgeColor="bg-white/10 text-white" delay={0.4} defaultOpen>
                                <div className="space-y-2">
                                    {claims.map((claim, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + i * 0.06 }}
                                            className={`flex gap-3 items-start p-3 rounded-xl border ${claim.verified ? 'border-green-500/20 bg-green-500/[0.03]' : 'border-red-500/20 bg-red-500/[0.03]'}`}
                                        >
                                            <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${claim.verified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {claim.verified ? '✓' : '✗'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${claim.verified ? 'text-green-300' : 'text-red-300'}`}>{claim.claim}</p>
                                                <p className="text-neutral-500 text-xs mt-0.5 leading-relaxed">{claim.evidence}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Reality Check */}
                        <Section title="Reality Check" delay={0.5} defaultOpen>
                            <p className="text-neutral-200 leading-relaxed">{data.reality || 'No detailed summary available for this evaluation.'}</p>
                        </Section>

                        {/* Exaggerations */}
                        {data.exaggerations?.length > 0 && (
                            <Section title="Exaggerations" badge={data.exaggerations.length} badgeColor="bg-red-500/20 text-red-400" delay={0.6} defaultOpen>
                                <ul className="space-y-3">
                                    {data.exaggerations.map((item, i) => {
                                        const parts = item.split(' — ');
                                        const claim = parts.length > 1 ? parts[0] : null;
                                        const reason = parts.length > 1 ? parts.slice(1).join(' — ') : item;
                                        return (
                                            <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.08 }} className="border border-red-500/10 rounded-xl p-4">
                                                {claim && <p className="text-white text-sm font-medium mb-1">📢 "{claim}"</p>}
                                                <p className="text-neutral-400 text-sm leading-relaxed">{claim ? `→ ${reason}` : reason}</p>
                                            </motion.li>
                                        );
                                    })}
                                </ul>
                            </Section>
                        )}

                        {/* PPT Content */}
                        {data.pptContent && (
                            <Section title="Extracted PPT Claims" badge={`${data.pptContent.length} chars`} delay={0.7}>
                                <pre className="text-neutral-400 text-xs font-mono whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">{data.pptContent}</pre>
                            </Section>
                        )}

                        {/* File Tree */}
                        {data.githubFileTree?.length > 0 && (
                            <Section title="Repository Structure" badge={`${data.githubFileTree.length} files`} delay={0.8}>
                                <div className="max-h-72 overflow-y-auto">
                                    {data.githubFileTree.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 py-0.5">
                                            <svg className="w-3 h-3 text-neutral-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
                                            <span className="text-neutral-400 text-xs font-mono">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Raw AI Response */}
                        {data.rawAiResponse && (
                            <Section title="Raw AI Response" delay={0.9}>
                                <pre className="text-neutral-400 text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">{data.rawAiResponse}</pre>
                            </Section>
                        )}

                        {/* Back */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="text-center mt-6 mb-12">
                            <Link to="/" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-neutral-200 transition-colors">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                                Evaluate Another
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
