import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { API_BASE_URL, PYTHON_API_BASE_URL } from "../../api";

export default function SignupForm() {
  const { loginUser, navigateTo, selectedHackathon, setAuthMode } = useApp();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    phone: "",
    aadhar: null,
    collegeId: null,
    otp: "",
  });
  const [step, setStep] = useState(1);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState(null);
  const [aadhaarLoading, setAadhaarLoading] = useState(false);
  const [aadhaarError, setAadhaarError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "aadhar" && files && files[0]) {
      setForm((prev) => ({ ...prev, aadhar: files[0] }));
      performAadhaarOCR(files[0]);
      return;
    }
    
    if (files && files[0]) {
      const file = files[0];
      
      // File validation logic from friend's code
      const maxSize = 5 * 1024 * 1024; // 5MB
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const validPdfTypes = ['application/pdf'];
      
      if (name === 'aadhar') {
        if (!validImageTypes.includes(file.type) && !validPdfTypes.includes(file.type)) {
          setOtpError("Aadhaar: Please upload a valid image or PDF file");
          return;
        }
        if (file.size > maxSize) {
          setOtpError("Aadhaar file size exceeds 5MB limit");
          return;
        }
      }
      
      if (name === 'collegeId') {
        if (!validImageTypes.includes(file.type)) {
          setOtpError("College ID: Please upload a valid image file (JPG, PNG)");
          return;
        }
        if (file.size > maxSize) {
          setOtpError("College ID file size exceeds 5MB limit");
          return;
        }
      }
      
      setOtpError("");
      setForm((prev) => ({ ...prev, [name]: file }));
      
      // Log file upload (simulated backend)
      console.log(`[FILE UPLOAD] ${name}:`, file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Call Python OCR service when Aadhaar card is uploaded
  const performAadhaarOCR = async (file) => {
    setAadhaarLoading(true);
    setAadhaarError("");
    setAadhaarNumber(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${PYTHON_API_BASE_URL}/ocr/aadhaar`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.aadhaarNumber) {
        setAadhaarNumber(data.aadhaarNumber);
      } else {
        setAadhaarError(
          "Could not read Aadhaar number. Please try a clearer image.",
        );
      }
    } catch {
      setAadhaarError(
        "OCR service unavailable. Upload will still be sent during signup.",
      );
    } finally {
      setAadhaarLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Temporarily navigate directly to judge dashboard
    navigateTo("judgeDashboard");
    return;
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!form.email || !form.phone) {
      setOtpError("Please enter email and phone first");
      return;
    }
    setOtpError("");
    setOtpRequested(true);
    // In production: await backend OTP API call
    alert(`OTP sent to ${form.email}. Check your email.`);
  };

  const inputCls =
    "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#B4ED57]/60 transition-colors";
  const labelCls =
    "block text-white/60 text-xs mb-1.5 uppercase tracking-wider";

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

          {/* OTP Verification */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <label className={labelCls}>OTP Verification</label>
            <p className="text-white/50 text-xs mb-3">
              We'll send an OTP to your email for verification.
            </p>
            <div className="flex gap-2 mb-3">
              <input
                name="otp"
                value={form.otp}
                onChange={handleChange}
                placeholder="Enter 6-digit OTP"
                className={inputCls}
                maxLength="6"
                disabled={!otpRequested}
              />
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={otpRequested}
                className="px-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {otpRequested ? "✓ Sent" : "Request OTP"}
              </button>
            </div>
            {otpRequested && (
              <p className="text-[#B4ED57] text-xs">OTP sent to {form.email}</p>
            )}
          </div>

          {/* Aadhar Upload */}
          <div>
            <label className={labelCls}>Aadhar Card Upload</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-6 cursor-pointer hover:border-[#B4ED57]/40 transition-colors group">
              <span className="text-3xl mb-2">📄</span>
              <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
                {form.aadhar ? form.aadhar.name : "Click to upload Aadhar card"}
              </span>
              <span className="text-white/30 text-xs mt-1">
                PDF, JPG or PNG (max 5MB)
              </span>
              <input
                name="aadhar"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleChange}
                className="hidden"
              />
            </label>
            {form.aadhar && (
              <p className="text-[#B4ED57] text-xs mt-1.5">
                ✓ {form.aadhar.name} uploaded
              </p>
            )}
            {aadhaarLoading && (
              <div className="mt-2 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="animate-spin text-sm">⏳</span>
                <span className="text-white/60 text-xs">
                  Reading Aadhaar number via OCR...
                </span>
              </div>
            )}
            {aadhaarNumber && (
              <div className="mt-2 bg-[#B4ED57]/10 border border-[#B4ED57]/30 rounded-xl p-3">
                <div className="text-[#B4ED57]/70 text-xs mb-1">
                  ✓ Aadhaar Number Detected
                </div>
                <div className="text-white font-mono text-sm tracking-widest">
                  {aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3")}
                </div>
              </div>
            )}
            {aadhaarError && (
              <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs">
                {aadhaarError}
              </div>
            )}
          </div>

          {/* College ID Upload */}
          <div>
            <label className={labelCls}>College ID Card Upload</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-6 cursor-pointer hover:border-[#B4ED57]/40 transition-colors group">
              <span className="text-3xl mb-2">🎓</span>
              <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
                {form.collegeId
                  ? form.collegeId.name
                  : "Click to upload College ID"}
              </span>
              <span className="text-white/30 text-xs mt-1">
                JPG or PNG (max 5MB)
              </span>
              <input
                name="collegeId"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleChange}
                className="hidden"
              />
            </label>
            {form.collegeId && (
              <p className="text-[#B4ED57] text-xs mt-1.5">
                ✓ {form.collegeId.name} uploaded
              </p>
            )}
          </div>
        </>
      )}

      {otpError && role === "student" && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {otpError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Creating Account..." : "Create Account →"}
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
