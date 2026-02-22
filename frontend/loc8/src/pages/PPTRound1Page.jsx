import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { submitEntry } from "../api";

export default function PPTRound1Page() {
  const { selectedHackathon, teamData, allocatedProblem, setPptScore, proceedToNextPhase, currentUser } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [pptxFile, setPptxFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [entryId, setEntryId] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.pptx')) {
      setPptxFile(file);
      setError("");
    } else {
      setError("Please select a valid PPTX file");
    }
  };

  const handleSubmitPPT = async () => {
    if (!pptxFile) {
      setError("Please select a PPTX file to upload");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await submitEntry(teamData?.name || currentUser?.teamName, githubUrl, pptxFile);
      
      if (data.id) {
        setEntryId(data.id);
        setPptScore(data.finalScore || 0);
        setSubmitted(true);
      } else {
        setError(data.message || "Submission failed");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "An error occurred during submission");
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    proceedToNextPhase();
  };

  const cardCls = "bg-[#111] border border-white/10 rounded-2xl p-8";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#B4ED57]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black italic mb-2">PPT ROUND 1</h1>
          <p className="text-white/40">
            Present your solution to <span className="text-[#B4ED57] font-bold">{allocatedProblem?.title}</span>
          </p>
          <p className="text-white/60 text-sm mt-2">Team: {teamData?.name}</p>
        </div>

        {!submitted ? (
          <div className={cardCls}>
            <h2 className="text-2xl font-bold mb-6">Prepare Your Presentation</h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6 mb-8">
              {/* Problem Statement */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-2">ALLOCATED PROBLEM</p>
                <p className="text-white font-bold text-lg">{allocatedProblem?.title || "Innovation Challenge"}</p>
                <p className="text-white/60 text-sm mt-2">Domain: {allocatedProblem?.domain || "Technology"}</p>
              </div>

              {/* GitHub URL */}
              <div>
                <label className="block text-white/60 text-xs mb-2 uppercase tracking-wider">
                  GitHub Repository URL (Optional)
                </label>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30"
                  disabled={loading}
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-white/60 text-xs mb-2 uppercase tracking-wider">
                  Upload Presentation (PPTX)
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-8 cursor-pointer hover:border-[#B4ED57]/40 transition-colors group">
                  <span className="text-5xl mb-3">📊</span>
                  <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
                    {pptxFile ? pptxFile.name : "Click to upload your PPTX presentation"}
                  </span>
                  <span className="text-white/30 text-xs mt-2">
                    PowerPoint format (.pptx) - Max 50MB
                  </span>
                  <input
                    type="file"
                    accept=".pptx"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
                {pptxFile && (
                  <p className="text-[#B4ED57] text-xs mt-2">
                    ✓ {pptxFile.name} ({(pptxFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Timeline Info */}
              <div className="bg-[#B4ED57]/10 border border-[#B4ED57]/30 rounded-xl p-4">
                <p className="text-[#B4ED57] text-xs font-bold mb-3">PRESENTATION TIMELINE</p>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>📌 <strong>Presentation Time:</strong> 5 minutes</li>
                  <li>📌 <strong>Q&amp;A Time:</strong> 3 minutes</li>
                  <li>📌 <strong>Evaluation Criteria:</strong> Innovation, Feasibility, Presentation</li>
                  <li>📌 <strong>Judges:</strong> Industry experts &amp; mentors</li>
                </ul>
              </div>

              {/* How to Submit */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-3">HOW TO SUBMIT</p>
                <ol className="space-y-2 text-sm text-white/80">
                  <li>1. Upload your PPTX presentation file</li>
                  <li>2. Add your GitHub repository URL (optional but recommended)</li>
                  <li>3. Ensure all team members are present</li>
                  <li>4. Click "Submit for Evaluation"</li>
                </ol>
              </div>
            </div>

            <button
              onClick={handleSubmitPPT}
              disabled={loading || !pptxFile}
              className="w-full py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "⏳ Submitting..." : "Submit PPT for Evaluation →"}
            </button>
          </div>
        ) : (
          <div className={cardCls}>
            <div className="text-center mb-8">
              <p className="text-5xl mb-4">✓</p>
              <h2 className="text-2xl font-bold mb-2">PPT Submitted Successfully</h2>
              <p className="text-white/60">Your presentation has been received for evaluation</p>
              {entryId && (
                <p className="text-white/40 text-xs mt-2">Entry ID: {entryId}</p>
              )}
            </div>

            <div className="bg-[#B4ED57]/10 border border-[#B4ED57]/30 rounded-xl p-4 mb-8">
              <p className="text-[#B4ED57] text-xs font-bold mb-2">WHAT'S NEXT?</p>
              <p className="text-white/80 text-sm">
                Our AI-powered evaluation system is analyzing your presentation. 
                Shortlisted teams will be announced shortly. Keep checking your dashboard for updates!
              </p>
            </div>

            <button
              onClick={handleProceed}
              className="w-full py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all"
            >
              Check Shortlist Results →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
