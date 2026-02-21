import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function ShortlistSubmit() {
    const navigate = useNavigate();
    const [teamName, setTeamName] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [pptxFile, setPptxFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file?.name.endsWith('.pptx')) setPptxFile(file);
        else setError('Only .pptx files are accepted.');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!teamName.trim()) return setError('Team name is required.');
        if (!pptxFile) return setError('Please upload your PPT (.pptx).');

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('teamName', teamName.trim());
            if (githubUrl.trim()) fd.append('githubUrl', githubUrl.trim());
            fd.append('pptx', pptxFile);

            const res = await fetch('/api/shortlist/submit', { method: 'POST', body: fd });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Submission failed.');
            }
            const data = await res.json();
            navigate(`/shortlist/${data.entryId}`);
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
            className="min-h-screen flex items-center justify-center px-4 py-16"
        >
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-5">
                        <span className="text-2xl">📊</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Submit Your PPT</h1>
                    <p className="text-neutral-500 text-sm">Round 1 — AI-powered evaluation with full transparency</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-8 space-y-6">
                    {/* Team Name */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-2">Team Name</label>
                        <input
                            value={teamName}
                            onChange={e => setTeamName(e.target.value)}
                            placeholder="e.g. Team Orion"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-600 outline-none focus:border-white/30 transition-colors text-sm"
                        />
                    </div>

                    {/* GitHub URL (optional) */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-2">
                            GitHub Repo <span className="text-neutral-600">(optional)</span>
                        </label>
                        <input
                            value={githubUrl}
                            onChange={e => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/your-org/your-repo"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-600 outline-none focus:border-white/30 transition-colors text-sm"
                        />
                    </div>

                    {/* PPTX Drop Zone */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-2">Pitch Deck (.pptx)</label>
                        <div
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('pptx-input').click()}
                            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all p-10 text-center ${dragging ? 'border-white/40 bg-white/5' :
                                    pptxFile ? 'border-green-500/40 bg-green-500/5' :
                                        'border-white/10 hover:border-white/20'
                                }`}
                        >
                            <input
                                id="pptx-input"
                                type="file"
                                accept=".pptx"
                                className="hidden"
                                onChange={e => {
                                    const f = e.target.files?.[0];
                                    if (f) setPptxFile(f);
                                }}
                            />
                            {pptxFile ? (
                                <div className="space-y-1">
                                    <p className="text-2xl">✅</p>
                                    <p className="text-white font-medium text-sm">{pptxFile.name}</p>
                                    <p className="text-neutral-500 text-xs">{(pptxFile.size / 1024 / 1024).toFixed(1)} MB</p>
                                    <button type="button" onClick={e => { e.stopPropagation(); setPptxFile(null); }}
                                        className="mt-2 text-xs text-neutral-500 hover:text-white transition-colors">
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-3xl">📎</p>
                                    <p className="text-neutral-400 text-sm">Drag & drop your .pptx here</p>
                                    <p className="text-neutral-600 text-xs">or click to browse · max 50 MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Submitting…
                            </>
                        ) : '🚀 Submit for Evaluation'}
                    </button>

                    <p className="text-center text-xs text-neutral-600">
                        Your PPT will be scored by Groq AI across 5 strict criteria with full XAI transparency
                    </p>
                </form>
            </div>
        </motion.div>
    );
}
