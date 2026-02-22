import React, { useState, useEffect } from "react";
import { syncGitHubRepo, getGitHubStats } from "../../api";

export default function GitHubAnalytics({ teamName, initialGithubUrl = "" }) {
  const [githubUrl, setGithubUrl] = useState(initialGithubUrl);
  const [stats, setStats] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch stats on load if team name is provided
  useEffect(() => {
    if (teamName) {
      fetchStats();
      // Poll every 30 seconds
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [teamName]);

  const fetchStats = async () => {
    if (!teamName) return;
    
    setLoading(true);
    try {
      const data = await getGitHubStats(teamName);
      setStats(data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      // Don't show error if stats haven't been synced yet
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!teamName || !githubUrl) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    setSyncing(true);
    setError("");
    
    try {
      const data = await syncGitHubRepo(teamName, githubUrl);
      setStats(data);
      setError("");
    } catch (err) {
      console.error("Sync failed:", err);
      setError(err.message || "Failed to sync repository");
    } finally {
      setSyncing(false);
    }
  };

  const glassStyle = "backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl";

  return (
    <div className="space-y-6">
      {/* Sync Form */}
      <div className={`${glassStyle} p-6`}>
        <h3 className="text-white text-xl font-bold mb-4" style={{ fontFamily: "'Questrial', sans-serif" }}>
          GitHub Repository Sync
        </h3>
        <p className="text-white/60 text-sm mb-4" style={{ fontFamily: "'Fustat', sans-serif" }}>
          Sync your team's GitHub repository to track commits, features, and contributions in real-time.
        </p>
        
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="https://github.com/username/repository"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#B4ED57]/60 transition-colors"
            disabled={syncing}
          />
          <button
            onClick={handleSync}
            disabled={syncing || !githubUrl}
            className="px-6 py-3 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            style={{ fontFamily: "'Questrial', sans-serif" }}
          >
            {syncing ? "⏳ Syncing..." : "🚀 Sync Repository"}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Stats Display */}
      {stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`${glassStyle} p-4`}>
              <p className="text-sm text-white/40 mb-1" style={{ fontFamily: "'Fustat', sans-serif" }}>Total Commits</p>
              <p className="text-3xl font-bold text-[#B4ED57]" style={{ fontFamily: "'Questrial', sans-serif" }}>
                {stats.totalCommits || 0}
              </p>
            </div>
            <div className={`${glassStyle} p-4`}>
              <p className="text-sm text-white/40 mb-1" style={{ fontFamily: "'Fustat', sans-serif" }}>Branches</p>
              <p className="text-3xl font-bold text-[#4D58D4]" style={{ fontFamily: "'Questrial', sans-serif" }}>
                {stats.branches?.length || 0}
              </p>
            </div>
            <div className={`${glassStyle} p-4`}>
              <p className="text-sm text-white/40 mb-1" style={{ fontFamily: "'Fustat', sans-serif" }}>Relevance Score</p>
              <p className="text-3xl font-bold text-[#B4ED57]" style={{ fontFamily: "'Questrial', sans-serif" }}>
                {stats.relevanceScore || 0}%
              </p>
            </div>
            <div className={`${glassStyle} p-4`}>
              <p className="text-sm text-white/40 mb-1" style={{ fontFamily: "'Fustat', sans-serif" }}>Contributors</p>
              <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Questrial', sans-serif" }}>
                {stats.contributors?.length || 0}
              </p>
            </div>
          </div>

          {/* AI Features */}
          {(stats.implementedFeatures?.length > 0 || stats.missingPitchedFeatures?.length > 0) && (
            <div className={`${glassStyle} p-6`}>
              <h3 className="text-white text-lg font-bold mb-4" style={{ fontFamily: "'Questrial', sans-serif" }}>
                AI Detected Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#B4ED57] text-xl">✅</span>
                    <h4 className="text-[#B4ED57] font-semibold" style={{ fontFamily: "'Questrial', sans-serif" }}>
                      Implemented
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {stats.implementedFeatures?.map((feat, idx) => (
                      <li key={idx} className="bg-[#B4ED57]/10 border border-[#B4ED57]/30 p-3 rounded-xl text-sm text-white/90" style={{ fontFamily: "'Fustat', sans-serif" }}>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-red-400 text-xl">❌</span>
                    <h4 className="text-red-400 font-semibold" style={{ fontFamily: "'Questrial', sans-serif" }}>
                      Missing
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {stats.missingPitchedFeatures?.map((feat, idx) => (
                      <li key={idx} className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-sm text-white/70" style={{ fontFamily: "'Fustat', sans-serif" }}>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Contributors */}
          {stats.contributors?.length > 0 && (
            <div className={`${glassStyle} p-6`}>
              <h3 className="text-white text-lg font-bold mb-4" style={{ fontFamily: "'Questrial', sans-serif" }}>
                Team Contributors
              </h3>
              <div className="space-y-4">
                {stats.contributors.map((contributor) => (
                  <div key={contributor.author} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-start gap-4">
                    <img 
                      src={contributor.avatarUrl} 
                      alt={contributor.author}
                      className="w-16 h-16 rounded-full border-2 border-[#B4ED57]/30"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-lg text-white mb-1" style={{ fontFamily: "'Questrial', sans-serif" }}>
                        {contributor.author}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-white/60 mb-2" style={{ fontFamily: "'Fustat', sans-serif" }}>
                        <span>{contributor.commits} commits</span>
                        <span className="text-[#B4ED57]">+{contributor.additions}</span>
                        <span className="text-red-400">-{contributor.deletions}</span>
                      </div>
                      {contributor.featuresBuilt?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-[#4D58D4] font-semibold mb-2" style={{ fontFamily: "'Questrial', sans-serif" }}>
                            AI Mapped Features:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {contributor.featuresBuilt.map((feat, idx) => (
                              <span key={idx} className="bg-[#4D58D4]/20 border border-[#4D58D4]/40 text-[#4D58D4] px-3 py-1 rounded-lg text-xs" style={{ fontFamily: "'Fustat', sans-serif" }}>
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {stats.languages && Object.keys(stats.languages).length > 0 && (
            <div className={`${glassStyle} p-6`}>
              <h3 className="text-white text-lg font-bold mb-4" style={{ fontFamily: "'Questrial', sans-serif" }}>
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.languages).map(([lang, bytes]) => (
                  <div key={lang} className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                    <span className="text-white font-semibold" style={{ fontFamily: "'Questrial', sans-serif" }}>{lang}</span>
                    <span className="text-white/40 text-xs ml-2" style={{ fontFamily: "'Fustat', sans-serif" }}>
                      {(bytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!stats && !loading && (
        <div className={`${glassStyle} p-12 text-center`}>
          <p className="text-white/40 text-lg" style={{ fontFamily: "'Fustat', sans-serif" }}>
            No repository synced yet. Enter your GitHub URL above to get started.
          </p>
        </div>
      )}
    </div>
  );
}
