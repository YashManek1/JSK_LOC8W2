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
    setError("");
    setLoading(true);

    try {
      // Judge login uses mock credentials
      if (role === "judge") {
        const judge = MOCK_JUDGES.find(
          (j) => j.email === email && j.password === password,
        );
        if (judge) {
          loginUser(
            {
              id: judge.id,
              name: judge.name,
              email: judge.email,
              role: "judge",
              hackathonId: selectedHackathon?.id || "h1",
              hackathonName: selectedHackathon?.name || "HackOS 2026",
            },
            "mock-judge-token",
          );
        } else {
          setError("Invalid judge credentials.");
        }
        setLoading(false);
        return;
      }

      // Normal login via backend API
      const roleMap = { student: "Participant", mentor: "Mentor", organiser: "Organiser" };
      const mappedRoleToSend = roleMap[role] || "Participant";

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: mappedRoleToSend }),
      });
      const data = await res.json();

      if (res.ok) {
        const mappedRole =
          role === "organiser"
            ? "admin"
            : data.user?.role === "Participant"
              ? "student"
              : role;

        loginUser(
          {
            id: data.user?.id || data.userId,
            name: data.user?.fullName || email.split("@")[0],
            email,
            role: mappedRole,
            hackathonId: selectedHackathon?.id || "h1",
            hackathonName: selectedHackathon?.name || "HackOS 2026",
          },
          data.token || data.accessToken,
        );
      } else {
        setError(data.message || "Login failed. Check your credentials.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <>
          {/* GitHub OAuth Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* GitHub OAuth Button */}
          <button
            type="button"
            onClick={() => {
              window.location.href = `${API_BASE_URL}/auth/github`;
            }}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold rounded-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Sign in with GitHub
          </button>

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
        </>
      )}
    </form>
  );
}