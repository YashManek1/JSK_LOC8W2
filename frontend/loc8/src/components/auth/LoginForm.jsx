import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { MOCK_JUDGES } from "../../data/hackathons";
import { API_BASE_URL } from "../../api";

export default function LoginForm() {
  const { loginUser, navigateTo, selectedHackathon, setAuthMode } = useApp();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputCls =
    "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#B4ED57]/60 transition-colors";
  const labelCls =
    "block text-white/60 text-xs mb-1.5 uppercase tracking-wider";

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Temporarily navigate directly to judge dashboard
    navigateTo("judgeDashboard");
    return;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Role */}
      <div>
        <label className={labelCls}>Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={inputCls}
        >
          <option value="student">🎓 Student / Hacker</option>
          <option value="mentor">🧑‍💼 Mentor</option>
          <option value="organiser">🛠 Organiser / Admin</option>
          <option value="judge">⚖️ Judge</option>
        </select>
      </div>

      {role === "judge" && (
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3 text-yellow-300 text-xs">
          ⚠️ Judge credentials are provided by the hackathon organiser.
        </div>
      )}

      <div>
        <label className={labelCls}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          className={inputCls}
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign In →"}
      </button>

      {role !== "judge" && (
        <p className="text-center text-white/40 text-sm">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className="text-[#B4ED57] hover:underline"
          >
            Sign Up
          </button>
        </p>
      )}
    </form>
  );
}
