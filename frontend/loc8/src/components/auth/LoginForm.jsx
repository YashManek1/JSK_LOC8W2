import React, { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { MOCK_JUDGES } from "../../data/hackathons";

export default function LoginForm() {
  const { loginUser, selectedHackathon, setAuthMode } = useApp();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selfie, setSelfie] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const inputCls =
    "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-lime-400/60 transition-colors";
  const labelCls = "block text-white/60 text-xs mb-1.5 uppercase tracking-wider";

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      alert("Camera access denied. Please allow camera access.");
    }
  };

  const captureSelfie = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    setSelfiePreview(dataUrl);
    setSelfie(dataUrl);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Judge login validation
    if (role === "judge") {
      const judge = MOCK_JUDGES.find(
        (j) => j.email === email && j.password === password
      );
      if (!judge) {
        setError("Invalid judge credentials. Please check with the organiser.");
        return;
      }
      loginUser({ ...judge, role: "judge" });
      return;
    }

    if (role === "student" && !selfie) {
      setError("Please take a selfie to verify your identity.");
      return;
    }

    // Simulate student/mentor/organiser login
    loginUser({
      id: `u_${Date.now()}`,
      name: email.split("@")[0].replace(/\./g, " "),
      email,
      role,
      hackathonId: selectedHackathon?.id || "h1",
      hackathonName: selectedHackathon?.name || "HackOS 2026",
      teamName: "Team Alpha",
      selfie,
    });
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

      {/* Selfie for students */}
      {role === "student" && (
        <div>
          <label className={labelCls}>Identity Verification — Selfie</label>
          {!selfiePreview && !cameraActive && (
            <button
              type="button"
              onClick={startCamera}
              className="w-full border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-lime-400/40 transition-colors group"
            >
              <span className="text-3xl">📷</span>
              <span className="text-white/60 text-sm group-hover:text-white/80">Click to open camera</span>
              <span className="text-white/30 text-xs">Used for Aadhar matching</span>
            </button>
          )}
          {cameraActive && (
            <div className="relative rounded-xl overflow-hidden border border-lime-400/30">
              <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={captureSelfie}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-lime-400 text-black text-sm font-bold rounded-full hover:bg-lime-300 transition-colors"
              >
                📸 Capture
              </button>
            </div>
          )}
          {selfiePreview && (
            <div className="relative rounded-xl overflow-hidden border border-lime-400/40">
              <img src={selfiePreview} alt="Selfie" className="w-full h-36 object-cover" />
              <div className="absolute top-2 right-2 bg-lime-400 text-black text-xs px-2 py-0.5 rounded-full font-semibold">✓ Captured</div>
              <button
                type="button"
                onClick={() => { setSelfie(null); setSelfiePreview(null); }}
                className="absolute bottom-2 right-2 text-xs text-white/60 bg-black/60 px-2 py-1 rounded-lg hover:text-white"
              >
                Retake
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full py-3.5 bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-xl transition-all hover:scale-[1.01]"
      >
        Sign In →
      </button>

      {role !== "judge" && (
        <p className="text-center text-white/40 text-sm">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className="text-lime-400 hover:underline"
          >
            Sign Up
          </button>
        </p>
      )}
    </form>
  );
}