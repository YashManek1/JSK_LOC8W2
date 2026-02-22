import React, { useState, useEffect } from "react";
import {
  getConfig,
  saveConfig,
  getLeaderboard,
  getAllEntries,
  startEvaluation,
  getQueueStatus,
  eliminateEntry,
  restoreEntry,
  requeueEntry,
  setAdminNote,
  overrideScore,
  publishLeaderboard,
  rescoreAll,
  uploadPPTXFiles
} from "../../api";

export default function ShortlistManagement() {
  const [activeTab, setActiveTab] = useState("config"); // config, leaderboard, entries, queue
  const [config, setConfig] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [entries, setEntries] = useState([]);
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const glassStyle = "backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl";

  useEffect(() => {
    loadData();
    // Poll queue status every 5 seconds
    const interval = setInterval(() => {
      if (activeTab === "queue") {
        fetchQueueStatus();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "config") {
        const configData = await getConfig();
        setConfig(configData);
      } else if (activeTab === "leaderboard") {
        const leaderboardData = await getLeaderboard();
        setLeaderboard(leaderboardData);
      } else if (activeTab === "entries") {
        const entriesData = await getAllEntries();
        setEntries(entriesData);
      } else if (activeTab === "queue") {
        await fetchQueueStatus();
      }
      setError("");
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const status = await getQueueStatus();
      setQueueStatus(status);
    } catch (err) {
      console.error("Failed to fetch queue status:", err);
    }
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await saveConfig(config);
      setSuccess("Configuration saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEvaluation = async () => {
    if (!confirm("Start evaluation for all pending entries?")) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await startEvaluation();
      setSuccess("Evaluation started! Check queue status.");
      setTimeout(() => setSuccess(""), 3000);
      fetchQueueStatus();
    } catch (err) {
      setError(err.message || "Failed to start evaluation");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishLeaderboard = async () => {
    if (!confirm("Publish final leaderboard? This action cannot be undone.")) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await publishLeaderboard();
      setSuccess("Leaderboard published successfully!");
      setTimeout(() => setSuccess(""), 3000);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to publish leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const handleRescoreAll = async () => {
    if (!confirm("Recalculate all scores based on current weights?")) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await rescoreAll();
      setSuccess("All scores recalculated!");
      setTimeout(() => setSuccess(""), 3000);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to rescore entries");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await uploadPPTXFiles(files);
      setSuccess(`Uploaded ${result.count} files. ETA: ${result.etaSeconds}s`);
      setTimeout(() => setSuccess(""), 5000);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to upload files");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminateEntry = async (entryId) => {
    if (!confirm("Eliminate this entry?")) return;
    
    try {
      await eliminateEntry(entryId);
      setSuccess("Entry eliminated");
      setTimeout(() => setSuccess(""), 3000);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to eliminate entry");
    }
  };

  const handleRestoreEntry = async (entryId) => {
    try {
      await restoreEntry(entryId);
      setSuccess("Entry restored");
      setTimeout(() => setSuccess(""), 3000);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to restore entry");
    }
  };

  const handleRequeueEntry = async (entryId) => {
    try {
      await requeueEntry(entryId);
      setSuccess("Entry queued for re-evaluation");
      setTimeout(() => setSuccess(""), 3000);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to requeue entry");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-2xl font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>
          Shortlist Management
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleStartEvaluation}
            disabled={loading}
            className="px-4 py-2 bg-[#4D58D4] hover:bg-[#4D58D4]/80 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            ▶ Start Evaluation
          </button>
          <button
            onClick={handlePublishLeaderboard}
            disabled={loading}
            className="px-4 py-2 bg-[#B4ED57] hover:bg-[#c5f278] text-black text-sm font-bold rounded-xl transition-all disabled:opacity-50"
          >
            📢 Publish Leaderboard
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[#B4ED57]/10 border border-[#B4ED57]/30 rounded-xl p-4 text-[#B4ED57] text-sm">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {["config", "leaderboard", "entries", "queue"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab
                ? "border-[#B4ED57] text-[#B4ED57] font-semibold"
                : "border-transparent text-white/60 hover:text-white"
            }`}
            style={{ fontFamily: "'Questrial', sans-serif" }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Config Tab */}
      {activeTab === "config" && config && (
        <div className={`${glassStyle} p-6 space-y-6`}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-white/60 text-xs mb-2 uppercase tracking-wider">
                Target Shortlist
              </label>
              <input
                type="number"
                value={config.targetShortlist || 10}
                onChange={(e) => setConfig({ ...config, targetShortlist: parseInt(e.target.value) })}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-2 uppercase tracking-wider">
                Max Slides
              </label>
              <input
                type="number"
                value={config.maxSlides || 15}
                onChange={(e) => setConfig({ ...config, maxSlides: parseInt(e.target.value) })}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-2 uppercase tracking-wider">
              Problem Statement
            </label>
            <textarea
              value={config.problemStatement || ""}
              onChange={(e) => setConfig({ ...config, problemStatement: e.target.value })}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white h-32 resize-none"
              placeholder="Enter the problem statement..."
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-2 uppercase tracking-wider">
              Scoring Weights (Total: 100)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {config.scoringWeights && Object.entries(config.scoringWeights).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-white/40 text-xs mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setConfig({
                      ...config,
                      scoringWeights: {
                        ...config.scoringWeights,
                        [key]: parseInt(e.target.value)
                      }
                    })}
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveConfig}
              disabled={loading}
              className="px-6 py-3 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Configuration"}
            </button>
            <button
              onClick={handleRescoreAll}
              disabled={loading}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              Recalculate All Scores
            </button>
          </div>

          <div className="border-t border-white/10 pt-6">
            <label className="block text-white/60 text-xs mb-2 uppercase tracking-wider">
              Mass Upload PPTX Files
            </label>
            <input
              type="file"
              multiple
              accept=".pptx"
              onChange={handleFileUpload}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#B4ED57] file:text-black file:font-semibold hover:file:bg-[#c5f278]"
            />
            <p className="text-white/40 text-xs mt-2">
              Select multiple PPTX files to upload at once. Files will be automatically evaluated.
            </p>
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <div className={`${glassStyle} p-6`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/60 text-xs py-3 px-4">Rank</th>
                  <th className="text-left text-white/60 text-xs py-3 px-4">Team Name</th>
                  <th className="text-left text-white/60 text-xs py-3 px-4">Final Score</th>
                  <th className="text-left text-white/60 text-xs py-3 px-4">Status</th>
                  <th className="text-left text-white/60 text-xs py-3 px-4">Slides</th>
                  <th className="text-left text-white/60 text-xs py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <span className={`font-bold ${entry.rank <= 3 ? 'text-[#B4ED57]' : 'text-white'}`}>
                        #{entry.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white">{entry.teamName}</td>
                    <td className="py-3 px-4 text-white font-semibold">{entry.finalScore?.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        entry.status === 'EVALUATED' ? 'bg-[#B4ED57]/20 text-[#B4ED57]' :
                        entry.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/60">{entry.slideCount}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleRequeueEntry(entry.id)}
                        className="text-[#4D58D4] hover:text-[#4D58D4]/80 text-xs mr-2"
                      >
                        ↻ Requeue
                      </button>
                      <button
                        onClick={() => handleEliminateEntry(entry.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        ✕ Eliminate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Entries Tab */}
      {activeTab === "entries" && (
        <div className={`${glassStyle} p-6`}>
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold text-lg">{entry.teamName}</h3>
                    <p className="text-white/60 text-sm">{entry.githubUrl || "No GitHub URL"}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    entry.status === 'EVALUATED' ? 'bg-[#B4ED57]/20 text-[#B4ED57]' :
                    entry.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                    entry.eliminated ? 'bg-red-500/20 text-red-500' :
                    'bg-white/10 text-white/60'
                  }`}>
                    {entry.eliminated ? 'ELIMINATED' : entry.status}
                  </span>
                </div>

                {entry.finalScore && (
                  <div className="mb-3">
                    <span className="text-white/40 text-xs">Score: </span>
                    <span className="text-white font-bold text-lg">{entry.finalScore.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  {entry.eliminated ? (
                    <button
                      onClick={() => handleRestoreEntry(entry.id)}
                      className="px-3 py-1.5 bg-[#B4ED57]/20 text-[#B4ED57] text-xs font-semibold rounded-lg"
                    >
                      ↻ Restore
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRequeueEntry(entry.id)}
                        className="px-3 py-1.5 bg-[#4D58D4]/20 text-[#4D58D4] text-xs font-semibold rounded-lg"
                      >
                        ↻ Requeue
                      </button>
                      <button
                        onClick={() => handleEliminateEntry(entry.id)}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg"
                      >
                        ✕ Eliminate
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue Tab */}
      {activeTab === "queue" && queueStatus && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${glassStyle} p-6`}>
            <p className="text-white/40 text-xs mb-2">Waiting</p>
            <p className="text-4xl font-bold text-yellow-500">{queueStatus.waiting}</p>
          </div>
          <div className={`${glassStyle} p-6`}>
            <p className="text-white/40 text-xs mb-2">Processing</p>
            <p className="text-4xl font-bold text-[#4D58D4]">{queueStatus.active}</p>
          </div>
          <div className={`${glassStyle} p-6`}>
            <p className="text-white/40 text-xs mb-2">Completed</p>
            <p className="text-4xl font-bold text-[#B4ED57]">{queueStatus.completed}</p>
          </div>
          <div className={`${glassStyle} p-6`}>
            <p className="text-white/40 text-xs mb-2">Failed</p>
            <p className="text-4xl font-bold text-red-500">{queueStatus.failed}</p>
          </div>
        </div>
      )}
    </div>
  );
}
