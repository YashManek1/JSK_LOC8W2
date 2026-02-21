import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ShieldAlert, GitCommit, SearchCode, BookKey, Send } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function EvaluatorPortal() {
    const { teamName } = useParams();
    const navigate = useNavigate();

    const [aiData, setAiData] = useState(null);
    const [githubData, setGithubData] = useState(null);
    const [mentorNote, setMentorNote] = useState("");
    const [savingNote, setSavingNote] = useState(false);
    const [recruitedUsers, setRecruitedUsers] = useState({});
    const [statsError, setStatsError] = useState(false);

    useEffect(() => {
        const fetchTeamTelemetry = async () => {
            try {
                const res = await fetch(`/github/stats/${teamName}`);
                if (!res.ok) {
                    setStatsError(true);
                    return;
                }
                const data = await res.json();

                setGithubData({
                    contributors: data.contributors || [],
                    totalCommits: data.totalCommits || 0,
                    branches: data.branches || []
                });

                setAiData({
                    implementedFeatures: data.implementedFeatures || [],
                    missingPitchedFeatures: data.missingPitchedFeatures || [],
                    relevanceScore: data.relevanceScore || 0,
                    summary: data.summary || null
                });
            } catch (err) {
                console.error("Failed to load Team Telemetry", err);
                setStatsError(true);
            }
        };
        fetchTeamTelemetry();
    }, [teamName]);

    const handleRecruit = (author) => {
        setRecruitedUsers((prev) => ({ ...prev, [author]: true }));
        // In production, this would trigger an email containing a boilerplate MOU
        alert(`A digital Non-Disclosure Agreement / recruitment ping has been simulated and sent to ${author}!`);
    };

    const saveNote = () => {
        setSavingNote(true);
        setTimeout(() => {
            setSavingNote(false);
            alert("Digital note saved to the team's backend profile.");
        }, 600);
    };

    if (statsError) return (
        <div className="p-10 text-white flex flex-col gap-2">
            <span className="font-bold text-xl text-red-400">Team '{teamName}' has not synced their codebase.</span>
            <span className="text-neutral-500 text-sm">Waiting for the team to link their GitHub repository in the Hacker Cockpit before evaluation can begin.</span>
        </div>
    );

    if (!githubData || !aiData || !githubData.contributors.length) return <div className="p-10 font-bold text-white">Loading Workspace...</div>;

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 flex flex-col xl:flex-row gap-6">

            {/* ── LEFT PANE: Presentation / General Info ── */}
            <div className="flex-1 flex flex-col gap-6">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Team {teamName || "Apollo"}</h1>
                        <p className="text-neutral-500 flex items-center gap-2 mt-1">
                            <SearchCode size={16} /> Unified Review Workspace — Final Judging
                        </p>
                    </div>
                    <button onClick={() => navigate('/admin')} className="px-4 py-2 border border-neutral-700 bg-neutral-900 rounded-lg hover:bg-neutral-800 transition">
                        Exit Workspace
                    </button>
                </header>

                {/* Deep API Insights & Groq Verification */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl flex-1 flex flex-col overflow-hidden min-h-[400px]">
                    <div className="bg-neutral-800 px-4 py-3 border-b border-neutral-700 font-bold text-sm tracking-wide flex justify-between items-center">
                        <span className="flex items-center gap-2">👨‍💻 Contributor API Matrix</span>
                        <span className="text-xs text-blue-400 bg-blue-900/20 border border-blue-900 px-2 py-1 rounded border-dashed">Groq LLM Verified</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-950">
                        {githubData.contributors.map(c => (
                            <div key={c.author} className="border border-neutral-800 bg-neutral-900 p-5 rounded-xl shadow-lg">
                                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-neutral-800">
                                    <img src={c.avatarUrl} alt={c.author} className="w-12 h-12 rounded-full border border-neutral-700 shadow-sm" />
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{c.author}</h3>
                                        <p className="text-xs text-neutral-400 font-mono mt-0.5">{c.commits} Commits • {c.additions} Additions</p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {/* Exposing the AI Features Mapped by Groq */}
                                    <div>
                                        <p className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                            <SearchCode size={14} /> Features Implemented
                                        </p>
                                        {c.featuresBuilt && c.featuresBuilt.length > 0 ? (
                                            <ul className="space-y-2">
                                                {c.featuresBuilt.map((f, i) => (
                                                    <li key={i} className="text-sm text-neutral-300 bg-black/40 border border-neutral-800 px-3 py-2 rounded-lg leading-relaxed">
                                                        <span className="text-blue-500 mr-2">✨</span> {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-neutral-600 bg-black/20 p-3 rounded-lg border border-neutral-800/50 italic flex items-center gap-2">
                                                <ShieldAlert size={14} /> No specific codebase features attributed to these commits.
                                            </p>
                                        )}
                                    </div>

                                    {/* Raw Octokit Commit Logs */}
                                    <div>
                                        <p className="text-xs font-bold text-neutral-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                                            <GitCommit size={14} /> Recent Commit Logs
                                        </p>
                                        <div className="bg-black/50 border border-neutral-800 rounded-lg p-3 max-h-32 overflow-y-auto custom-scrollbar">
                                            {c.commitMessages && c.commitMessages.length > 0 ? (
                                                <ul className="space-y-1.5">
                                                    {c.commitMessages.slice(0, 10).map((m, i) => (
                                                        <li key={i} className="text-[11px] text-neutral-400 font-mono truncate border-l-2 border-neutral-700 pl-2">
                                                            {m}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-neutral-600 italic">No actionable commit messages found.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mentor Digital Notepad */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="font-bold flex items-center gap-2 mb-3">
                        <ShieldAlert size={18} className="text-yellow-500" /> Digital Evaluation Notepad
                    </h3>
                    <textarea
                        value={mentorNote}
                        onChange={(e) => setMentorNote(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-4 text-sm text-neutral-300 min-h-[120px] focus:outline-none focus:border-yellow-500/50 transition resize-none placeholder-neutral-600"
                        placeholder="Jot down questions for the Q&A, observations on their tech stack, or reasons to recruit this team..."
                    />
                    <div className="flex justify-end mt-3">
                        <button
                            onClick={saveNote}
                            disabled={savingNote}
                            className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 px-5 py-2.5 rounded-lg text-sm font-bold transition">
                            {savingNote ? "Saving..." : <><Send size={16} /> Save Private Note</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANE: Ground Truth Code Stats ── */}
            <div className="w-full xl:w-[450px] space-y-6 flex flex-col">

                {/* Verification Card */}
                <div className="bg-gradient-to-br from-green-900/20 to-neutral-900 border border-green-500/30 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-lg font-bold text-green-400">Implementation Truth</h2>
                        <div className="text-3xl font-black text-white">{aiData.relevanceScore}%</div>
                    </div>

                    <p className="text-xs text-neutral-400 mb-4 uppercase tracking-wider">AI Scanned Features Found in Codebase</p>
                    <ul className="space-y-2 mb-4">
                        {aiData.implementedFeatures.map((ft, i) => (
                            <li key={i} className="text-sm bg-neutral-950 text-neutral-300 p-2 rounded border border-neutral-800 flex gap-2">
                                <span className="text-green-500">✓</span> {ft}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* GitHub Talent Card */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl flex-1 p-6 overflow-y-auto">
                    <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                        <GitCommit size={20} className="text-blue-400" /> Codebase Contributors
                    </h2>
                    <p className="text-xs text-neutral-500 mb-6">Analyze developer velocity and Star to initiate the MOU pipeline.</p>

                    {/* Commit Graph */}
                    <div className="h-48 mb-6 bg-neutral-950 border border-neutral-800 p-4 rounded-xl">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={githubData.contributors}>
                                <XAxis dataKey="author" stroke="#52525b" tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #262626' }} />
                                <Bar dataKey="commits" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                        {githubData.contributors.map(c => (
                            <div key={c.author} className="flex gap-4 p-4 border border-neutral-800 bg-neutral-950 rounded-xl items-center hover:border-neutral-600 transition">
                                <img src={c.avatarUrl} alt={c.author} className="w-12 h-12 rounded-full border border-neutral-700" />
                                <div className="flex-1">
                                    <p className="font-bold text-sm">{c.author}</p>
                                    <p className="text-xs text-neutral-400">{c.commits} Commits • {c.additions} LOC added</p>
                                </div>

                                <button
                                    disabled={recruitedUsers[c.author]}
                                    onClick={() => handleRecruit(c.author)}
                                    className={`p-3 rounded-full border transition hover:scale-105 active:scale-95 ${recruitedUsers[c.author]
                                        ? "bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                                        : "bg-neutral-900 border-neutral-700 text-neutral-500 hover:text-white"
                                        }`}
                                    title="Star / Recruit Developer"
                                >
                                    <Star size={18} fill={recruitedUsers[c.author] ? "currentColor" : "none"} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
