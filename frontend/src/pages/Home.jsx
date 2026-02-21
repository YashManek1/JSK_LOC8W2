import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export default function Home() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const f = e.dataTransfer.files[0];
      if (f.name.endsWith(".pptx")) {
        setFile(f);
        setError("");
      } else {
        setError("Only .pptx files are accepted");
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim() || !githubUrl.trim() || !file) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    // GSAP loading pulse effect
    gsap.to(formRef.current, {
      scale: 0.98,
      opacity: 0.7,
      duration: 0.3,
      ease: "power2.out",
    });

    try {
      const formData = new FormData();
      formData.append("teamName", teamName.trim());
      formData.append("githubUrl", githubUrl.trim());
      formData.append("pptx", file);

      const res = await fetch("/api/evaluate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      // Animate out
      gsap.to(formRef.current, {
        scale: 0.95,
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => navigate(`/evaluations/${data.evaluationId}`),
      });
    } catch (err) {
      setError(err.message);
      gsap.to(formRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.3,
      });
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Background grid effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center mb-12 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Hack<span className="text-neutral-400">Eval</span>
          </h1>
        </div>
        <p className="text-neutral-500 text-lg max-w-md mx-auto">
          AI-powered submission scorer that separates facts from fiction.
        </p>
      </motion.div>

      {/* Form Card */}
      <motion.form
        ref={formRef}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full max-w-lg glass-strong rounded-2xl p-8 relative z-10"
      >
        {/* Team Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Team Name
          </label>
          <input
            id="teamName"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. NullPointers"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-600 outline-none"
          />
        </div>

        {/* GitHub URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            GitHub Repository URL
          </label>
          <input
            id="githubUrl"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/team/project"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-600 outline-none"
          />
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Presentation (.pptx)
          </label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`file-drop cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? "active border-white/50 bg-white/5"
                : file
                  ? "border-white/20 bg-white/[0.02]"
                  : "border-white/10"
            }`}
          >
            <input
              ref={fileInputRef}
              id="pptxFile"
              type="file"
              accept=".pptx"
              onChange={(e) => {
                if (e.target.files[0]) {
                  setFile(e.target.files[0]);
                  setError("");
                }
              }}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <svg
                  className="w-5 h-5 text-neutral-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
                <span className="text-neutral-300 font-medium">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-neutral-500 hover:text-white transition-colors ml-2"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <svg
                  className="w-8 h-8 text-neutral-600 mx-auto mb-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-neutral-500 text-sm">
                  Drop your <span className="text-neutral-300">.pptx</span> here
                  or click to browse
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400/80 text-sm mb-4 px-1"
          >
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <button
          id="submitBtn"
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-20"
                />
                <path
                  d="M12 2a10 10 0 019.95 9"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Submitting…
            </>
          ) : (
            <>
              Evaluate Submission
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </motion.form>

      {/* Navigation Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full max-w-lg mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10"
      >
        <div
          onClick={() => navigate("/voice-chat")}
          className="glass-strong rounded-2xl p-5 cursor-pointer hover:bg-white/5 transition-all border border-white/10 group flex flex-col items-center text-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
            🎙️
          </div>
          <h3 className="text-white font-medium">Voice Chat</h3>
          <p className="text-neutral-500 text-xs">Audio-native registration</p>
        </div>

        <div
          onClick={() => navigate("/verify-identity")}
          className="glass-strong rounded-2xl p-5 cursor-pointer hover:bg-white/5 transition-all border border-white/10 group flex flex-col items-center text-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
            📸
          </div>
          <h3 className="text-white font-medium">Identity Verify</h3>
          <p className="text-neutral-500 text-xs">Aadhaar + Face Match</p>
        </div>
      </motion.div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-neutral-600 text-xs mt-8 text-center relative z-10"
      >
        Powered by Gemini 1.5 Flash · Compares PPT claims against GitHub reality
      </motion.p>
    </motion.div>
  );
}
