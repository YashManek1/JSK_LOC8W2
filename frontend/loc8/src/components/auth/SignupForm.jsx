import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function SignupForm() {
  const { loginUser, selectedHackathon, setAuthMode } = useApp();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    phone: "",
    aadhar: null,
  });
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = {
      id: `u_${Date.now()}`,
      ...form,
      role,
      hackathonId: selectedHackathon?.id || "h1",
      hackathonName: selectedHackathon?.name || "HackOS 2026",
      teamName: "Team " + form.name.split(" ")[0],
    };
    loginUser(user);
  };

  const inputCls =
    "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#B4ED57]/60 transition-colors";
  const labelCls = "block text-white/60 text-xs mb-1.5 uppercase tracking-wider";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Role Selector */}
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
        </select>
      </div>

      {/* Basic Info */}
      <div>
        <label className={labelCls}>Full Name</label>
        <input
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="Ananya Sharma"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Email</label>
        <input
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="ananya@college.edu"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Password</label>
        <input
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
          placeholder="Create a strong password"
          className={inputCls}
        />
      </div>

      {role === "student" && (
        <>
          <div>
            <label className={labelCls}>College / Institution</label>
            <input
              name="college"
              value={form.college}
              onChange={handleChange}
              placeholder="IIT Bangalore"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Phone Number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className={inputCls}
            />
          </div>

          {/* Aadhar Upload */}
          <div>
            <label className={labelCls}>Aadhar Card Upload</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-6 cursor-pointer hover:border-[#B4ED57]/40 transition-colors group">
              <span className="text-3xl mb-2">📄</span>
              <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
                {form.aadhar ? form.aadhar.name : "Click to upload Aadhar card"}
              </span>
              <span className="text-white/30 text-xs mt-1">PDF, JPG or PNG (max 5MB)</span>
              <input
                name="aadhar"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleChange}
                className="hidden"
              />
            </label>
            {form.aadhar && (
              <p className="text-[#B4ED57] text-xs mt-1.5">✓ {form.aadhar.name} uploaded</p>
            )}
          </div>
        </>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
      >
        Create Account →
      </button>

      <p className="text-center text-white/40 text-sm">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setAuthMode("login")}
          className="text-[#B4ED57] hover:underline"
        >
          Sign In
        </button>
      </p>
    </form>
  );
}