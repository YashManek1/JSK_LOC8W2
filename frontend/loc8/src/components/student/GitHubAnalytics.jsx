import React, { useState, useEffect, useMemo } from "react";
import { syncGitHubRepo, getGitHubStats } from "../../api";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getHeatColor(count, max) {
  if (count === 0) return "bg-white/[0.03]";
  const ratio = count / max;
  if (ratio > 0.75) return "bg-[#B4ED57]";
  if (ratio > 0.5) return "bg-[#B4ED57]/70";
  if (ratio > 0.25) return "bg-[#B4ED57]/40";
  return "bg-[#B4ED57]/20";
}

function TimelineHeatmap({ timeline }) {
  const maxCount = useMemo(() => Math.max(...timeline.map(([, , c]) => c), 1), [timeline]);

  const grid = useMemo(() => {
    const g = Array.from({ length: 7 }, () => Array(24).fill(0));
    timeline.forEach(([day, hour, count]) => {
      if (day >= 0 && day < 7 && hour >= 0 && hour < 24) {
        g[day][hour] = count;
      }
    });
    return g;
  }, [timeline]);

  const totalCommits = useMemo(() => timeline.reduce((s, [, , c]) => s + c, 0), [timeline]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-white/70 text-sm font-semibold" style={{ fontFamily: "'Questrial', sans-serif" }}>
          Commit Activity Heatmap
        </h4>
        <span className="text-white/40 text-xs" style={{ fontFamily: "'Fustat', sans-serif" }}>
          {totalCommits} total commits
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex ml-10 mb-1">
            {HOURS.map((h) => (
              <div key={h} className="flex-1 text-center text-[10px] text-white/30">
                {h % 3 === 0 ? `${h}h` : ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          {DAYS.map((day, dayIdx) => (
            <div key={day} className="flex items-center gap-1 mb-[2px]">
              <span className="text-[10px] text-white/40 w-8 text-right mr-1">{day}</span>
              {HOURS.map((hour) => {
                const count = grid[dayIdx][hour];
                return (
                  <div
                    key={hour}
                    className={`flex-1 h-4 rounded-[3px] ${getHeatColor(count, maxCount)} transition-colors cursor-pointer hover:ring-1 hover:ring-[#B4ED57]/50`}
                    title={`${day} ${hour}:00 — ${count} commits`}
                  />
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-2">
            <span className="text-[10px] text-white/30">Less</span>
            {["bg-white/[0.03]", "bg-[#B4ED57]/20", "bg-[#B4ED57]/40", "bg-[#B4ED57]/70", "bg-[#B4ED57]"].map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-[2px] ${c}`} />
            ))}
            <span className="text-[10px] text-white/30">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LanguageBar({ languages }) {
  const total = Object.values(languages).reduce((s, v) => s + v, 0);
  const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1]);

  const langColors = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    CSS: "#563d7c",
    HTML: "#e34c26",
    Python: "#3572A5",
    Java: "#b07219",
    Go: "#00ADD8",
    Rust: "#dea584",
    Ruby: "#701516",
    Shell: "#89e051",
    Dockerfile: "#384d54",
    SCSS: "#c6538c",
  };

  return (
    <div className="space-y-3">
      {/* Color bar */}
      <div className="h-3 rounded-full overflow-hidden flex">
        {sorted.map(([lang, bytes]) => (
          <div
            key={lang}
            className="h-full transition-all"
            style={{
              width: `${(bytes / total) * 100}%`,
              backgroundColor: langColors[lang] || "#6e7681",
              minWidth: "2px",
            }}
            title={`${lang}: ${((bytes / total) * 100).toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {sorted.map(([lang, bytes]) => (
          <div key={lang} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: langColors[lang] || "#6e7681" }}
            />
            <span className="text-xs text-white/80" style={{ fontFamily: "'Fustat', sans-serif" }}>
              {lang}
            </span>
            <span className="text-xs text-white/40">
              {((bytes / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContributorCard({ contributor, rank }) {
  const [showCommits, setShowCommits] = useState(false);

  const rankBadge = rank === 0 ? "👑" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="p-4 flex items-start gap-4">
        <div className="relative">
          <img
            src={contributor.avatarUrl}
            alt={contributor.author}
            className="w-14 h-14 rounded-full border-2 border-[#B4ED57]/30"
          />
          {rankBadge && (
            <span className="absolute -top-1 -right-1 text-sm">{rankBadge}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={`https://github.com/${contributor.author}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white hover:text-[#B4ED57] transition-colors truncate"
              style={{ fontFamily: "'Questrial', sans-serif" }}
            >
              {contributor.author}
            </a>
          </div>

          <div className="flex items-center gap-3 mt-1 text-sm text-white/60" style={{ fontFamily: "'Fustat', sans-serif" }}>
            <span className="font-semibold text-white/80">{contributor.commits} commits</span>
            <span className="text-[#B4ED57]">+{(contributor.additions || 0).toLocaleString()}</span>
            <span className="text-red-400">-{(contributor.deletions || 0).toLocaleString()}</span>
          </div>

          {/* Commit contribution bar */}
          <div className="mt-2 flex gap-[1px] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#B4ED57] rounded-l-full"
              style={{
                width: `${(contributor.additions / (contributor.additions + contributor.deletions + 1)) * 100}%`,
              }}
            />
            <div
              className="bg-red-400 rounded-r-full"
              style={{
                width: `${(contributor.deletions / (contributor.additions + contributor.deletions + 1)) * 100}%`,
              }}
            />
          </div>

          {/* Features Built */}
          {contributor.featuresBuilt?.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] uppercase tracking-wider text-[#4D58D4] font-semibold mb-1.5"
                style={{ fontFamily: "'Questrial', sans-serif" }}>
                AI Mapped Features
              </p>
              <div className="flex flex-wrap gap-1.5">
                {contributor.featuresBuilt.map((feat, idx) => (
                  <span
                    key={idx}
                    className="bg-[#4D58D4]/20 border border-[#4D58D4]/40 text-[#4D58D4] px-2 py-0.5 rounded-md text-[11px]"
                    style={{ fontFamily: "'Fustat', sans-serif" }}
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Commit messages toggle */}
      {contributor.commitMessages?.length > 0 && (
        <div className="border-t border-white/5">
          <button
            onClick={() => setShowCommits(!showCommits)}
            className="w-full px-4 py-2 flex items-center justify-between text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.02] transition-colors"
          >
            <span>{contributor.commitMessages.length} commit messages</span>
            <span className="transition-transform" style={{ transform: showCommits ? "rotate(180deg)" : "" }}>
              ▼
            </span>
          </button>
          {showCommits && (
            <div className="px-4 pb-3 max-h-48 overflow-y-auto space-y-1">
              {contributor.commitMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="text-[11px] text-white/50 py-1 px-2 rounded bg-white/[0.02] font-mono truncate"
                  title={msg}
                >
                  <span className="text-[#B4ED57]/60 mr-1.5">●</span>
                  {msg}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GitHubAnalytics({ teamName, initialGithubUrl = "" }) {
  const [githubUrl, setGithubUrl] = useState(initialGithubUrl);
  const [stats, setStats] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (teamName) {
      fetchStats();
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
    } catch (err) {
      setError(err.message || "Failed to sync repository");
    } finally {
      setSyncing(false);
    }
  };

  const glassStyle = "backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl";

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "contributors", label: "Contributors", icon: "👥" },
    { id: "timeline", label: "Activity", icon: "📈" },
    { id: "features", label: "AI Features", icon: "🤖" },
  ];

  return (
    <div className="space-y-5">
      {/* Sync Form */}
      <div className={`${glassStyle} p-6`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-xl font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>
            GitHub Repository Sync
          </h3>
          {stats?.lastSyncedAt && (
            <span className="text-white/30 text-xs" style={{ fontFamily: "'Fustat', sans-serif" }}>
              Last synced: {new Date(stats.lastSyncedAt).toLocaleString()}
            </span>
          )}
        </div>
        <p className="text-white/50 text-sm mb-4" style={{ fontFamily: "'Fustat', sans-serif" }}>
          Sync your team's GitHub repository to track commits, features, and contributions in real-time.
        </p>

        <div className="flex gap-3">
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
            {syncing ? "⏳ Syncing..." : "🚀 Sync Repo"}
          </button>
        </div>

        {error && (
          <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {stats?.githubUrl && (
          <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
            <span>📎</span>
            <a href={stats.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#B4ED57] transition-colors underline">
              {stats.githubUrl}
            </a>
          </div>
        )}
      </div>

      {/* Stats Display */}
      {stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className={`${glassStyle} p-4`}>
              <p className="text-[11px] uppercase tracking-wider text-white/35 mb-1" style={{ fontFamily: "'Fustat', sans-serif" }}>Commits</p>
              <p className="text-2xl font-bold text-[#B4ED57]" style={{ fontFamily: "'Questrial', sans-serif" }}>
                {stats.totalCommits || 0}
              </p>
            </div>
            <div className={`${glassStyle} p-4`}>
              <p className="text-[11px] uppercase tracking-wider text-white/35 mb-1" style={{ fontFamily: "'Fustat', sans-serif" }}>Contributors</p>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Questrial', sans-serif" }}>
                {stats.contributors?.length || 0}
              </p>
            </div>
            <div className={`${glassStyle} p-4`}>
              <p className="text-[11px] uppercase tracking-wider text-white/35 mb-1" style={{ fontFamily: "'Fustat', sans-serif" }}>Branches</p>
              <p className="text-2xl font-bold text-[#4D58D4]" style={{ fontFamily: "'Questrial', sans-serif" }}>
                {stats.branches?.length || 0}
              </p>
            </div>
            <div className={`${glassStyle} p-4`}>
              <p className="text-[11px] uppercase tracking-wider text-white/35 mb-1" style={{ fontFamily: "'Fustat', sans-serif" }}>Features</p>
              <p className="text-2xl font-bold text-[#B4ED57]" style={{ fontFamily: "'Questrial', sans-serif" }}>
                {stats.summary?.totalFeatures || stats.implementedFeatures?.length || 0}
              </p>
            </div>
            <div className={`${glassStyle} p-4`}>
              <p className="text-[11px] uppercase tracking-wider text-white/35 mb-1" style={{ fontFamily: "'Fustat', sans-serif" }}>Relevance</p>
              <div className="flex items-end gap-1">
                <p className="text-2xl font-bold text-[#B4ED57]" style={{ fontFamily: "'Questrial', sans-serif" }}>
                  {stats.relevanceScore ?? 0}
                </p>
                <span className="text-white/30 text-xs mb-1">/100</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-[#B4ED57] text-black"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
                style={{ fontFamily: "'Questrial', sans-serif" }}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Languages */}
              {stats.languages && Object.keys(stats.languages).length > 0 && (
                <div className={`${glassStyle} p-5`}>
                  <h3 className="text-white text-base font-bold mb-4" style={{ fontFamily: "'Questrial', sans-serif" }}>
                    Tech Stack
                  </h3>
                  <LanguageBar languages={stats.languages} />
                </div>
              )}

              {/* Branches */}
              {stats.branches?.length > 0 && (
                <div className={`${glassStyle} p-5`}>
                  <h3 className="text-white text-base font-bold mb-3" style={{ fontFamily: "'Questrial', sans-serif" }}>
                    Branches
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stats.branches.map((branch) => (
                      <div key={branch.name} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                        <span className="text-[#4D58D4]">
                          {branch.protected ? "🔒" : "🌿"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{branch.name}</p>
                          <p className="text-white/30 text-[10px] font-mono">{branch.commit}</p>
                        </div>
                        {branch.protected && (
                          <span className="text-[10px] bg-[#4D58D4]/20 text-[#4D58D4] px-2 py-0.5 rounded">Protected</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick summary */}
              {stats.summary && (
                <div className={`${glassStyle} p-5`}>
                  <h3 className="text-white text-base font-bold mb-3" style={{ fontFamily: "'Questrial', sans-serif" }}>
                    Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-[#B4ED57]">{stats.summary.totalFeatures}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">Total Features</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-red-400">{stats.summary.missingFeatures}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">Missing</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-white">{stats.summary.fileCount}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">Files</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-white">
                        {stats.summary.codebaseSize > 0
                          ? `${(stats.summary.codebaseSize / 1024).toFixed(0)}K`
                          : "—"}
                      </p>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">Codebase Size</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contributors Tab */}
          {activeTab === "contributors" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white text-base font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>
                  {stats.contributors?.length || 0} Contributors
                </h3>
                <span className="text-white/30 text-xs" style={{ fontFamily: "'Fustat', sans-serif" }}>
                  Sorted by commits
                </span>
              </div>
              {stats.contributors
                ?.sort((a, b) => b.commits - a.commits)
                .map((contributor, idx) => (
                  <ContributorCard key={contributor.author} contributor={contributor} rank={idx} />
                ))}
            </div>
          )}

          {/* Timeline/Activity Tab */}
          {activeTab === "timeline" && (
            <div className="space-y-5">
              {stats.timeline?.length > 0 && (
                <div className={`${glassStyle} p-5`}>
                  <TimelineHeatmap timeline={stats.timeline} />
                </div>
              )}

              {/* Top contributors mini chart */}
              <div className={`${glassStyle} p-5`}>
                <h3 className="text-white text-base font-bold mb-4" style={{ fontFamily: "'Questrial', sans-serif" }}>
                  Contribution Breakdown
                </h3>
                <div className="space-y-3">
                  {stats.contributors
                    ?.sort((a, b) => b.commits - a.commits)
                    .slice(0, 6)
                    .map((c) => {
                      const maxCommits = stats.contributors[0]?.commits || 1;
                      return (
                        <div key={c.author} className="flex items-center gap-3">
                          <img src={c.avatarUrl} alt={c.author} className="w-7 h-7 rounded-full" />
                          <span className="text-white text-xs w-28 truncate" style={{ fontFamily: "'Fustat', sans-serif" }}>
                            {c.author}
                          </span>
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#4D58D4] to-[#B4ED57] rounded-full transition-all duration-700"
                              style={{ width: `${(c.commits / maxCommits) * 100}%` }}
                            />
                          </div>
                          <span className="text-white/60 text-xs font-mono w-8 text-right">{c.commits}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* AI Features Tab */}
          {activeTab === "features" && (
            <div className="space-y-5">
              {/* Relevance Score Gauge */}
              <div className={`${glassStyle} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-base font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>
                    Relevance Score
                  </h3>
                  <span
                    className={`text-3xl font-black ${
                      stats.relevanceScore >= 70 ? "text-[#B4ED57]" : stats.relevanceScore >= 40 ? "text-yellow-400" : "text-red-400"
                    }`}
                    style={{ fontFamily: "'Pixelify Sans', cursive" }}
                  >
                    {stats.relevanceScore ?? 0}/100
                  </span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      stats.relevanceScore >= 70 ? "bg-[#B4ED57]" : stats.relevanceScore >= 40 ? "bg-yellow-400" : "bg-red-400"
                    }`}
                    style={{ width: `${Math.min(stats.relevanceScore || 0, 100)}%` }}
                  />
                </div>
              </div>

              {/* Implemented vs Missing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`${glassStyle} p-5`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">✅</span>
                    <h4 className="text-[#B4ED57] font-bold text-sm" style={{ fontFamily: "'Questrial', sans-serif" }}>
                      Implemented ({stats.implementedFeatures?.length || 0})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {stats.implementedFeatures?.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-[#B4ED57]/5 border border-[#B4ED57]/20 p-2.5 rounded-lg text-sm text-white/90"
                        style={{ fontFamily: "'Fustat', sans-serif" }}
                      >
                        <span className="text-[#B4ED57] text-xs">●</span>
                        {feat}
                      </div>
                    ))}
                    {(!stats.implementedFeatures || stats.implementedFeatures.length === 0) && (
                      <p className="text-white/30 text-sm">No features detected yet</p>
                    )}
                  </div>
                </div>

                <div className={`${glassStyle} p-5`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">❌</span>
                    <h4 className="text-red-400 font-bold text-sm" style={{ fontFamily: "'Questrial', sans-serif" }}>
                      Missing ({stats.missingPitchedFeatures?.length || 0})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {stats.missingPitchedFeatures?.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 p-2.5 rounded-lg text-sm text-white/70"
                        style={{ fontFamily: "'Fustat', sans-serif" }}
                      >
                        <span className="text-red-400 text-xs">●</span>
                        {feat}
                      </div>
                    ))}
                    {(!stats.missingPitchedFeatures || stats.missingPitchedFeatures.length === 0) && (
                      <p className="text-white/30 text-sm">No missing features — great job!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!stats && !loading && (
        <div className={`${glassStyle} p-12 text-center`}>
          <div className="text-4xl mb-4">🔗</div>
          <p className="text-white/40 text-lg mb-2" style={{ fontFamily: "'Questrial', sans-serif" }}>
            No repository synced yet
          </p>
          <p className="text-white/25 text-sm" style={{ fontFamily: "'Fustat', sans-serif" }}>
            Enter your GitHub URL above and hit Sync to get started with real-time analytics.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && !stats && (
        <div className={`${glassStyle} p-12 text-center`}>
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-white/40" style={{ fontFamily: "'Fustat', sans-serif" }}>
            Loading repository analytics...
          </p>
        </div>
      )}
    </div>
  );
}
