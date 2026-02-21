import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../api";
import {
  Code,
  User,
  Award,
  Globe,
  CheckCircle,
  Upload,
  FileText,
  X,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

const PREDEFINED_SKILLS = [
  "React",
  "Node.js",
  "Python",
  "Tailwind",
  "Machine Learning",
  "Cloud",
  "Java",
  "C++",
  "TypeScript",
  "Go",
  "Rust",
  "Docker",
];
const ROLES = [
  "Frontend",
  "Backend",
  "Fullstack",
  "UI/UX",
  "Mobile",
  "DevOps",
  "AI/ML",
];
const DOMAINS = [
  "FinTech",
  "HealthTech",
  "Web3",
  "EdTech",
  "SaaS",
  "AI",
  "Cybersecurity",
];

const CompleteProfilePage = () => {
  const { completeProfile, currentUser, token, navigateTo } = useApp();
  const fileInputRef = useRef(null);

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeParsing, setResumeParsing] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  // Initialize form with voice-extracted data + user signup data
  const [formData, setFormData] = useState(() => {
    let voiceData = {};
    try {
      const raw = localStorage.getItem("voiceExtractedData");
      if (raw) voiceData = JSON.parse(raw);
    } catch {}

    // Parse hackathonPreferences (could be string or object)
    let preferredRoles = [];
    let domainInterests = [];
    let experienceLevel = "Beginner";
    const hp = voiceData.hackathonPreferences;
    if (hp && typeof hp === "object" && !Array.isArray(hp)) {
      preferredRoles = hp.preferredRoles || [];
      domainInterests = hp.domainInterests || [];
      experienceLevel = hp.experienceLevel || "Beginner";
    } else if (typeof hp === "string") {
      const lower = hp.toLowerCase();
      DOMAINS.forEach((d) => {
        if (lower.includes(d.toLowerCase())) domainInterests.push(d);
      });
      ROLES.forEach((r) => {
        if (lower.includes(r.toLowerCase())) preferredRoles.push(r);
      });
    }

    // Parse skills (string or array)
    let skills = [];
    if (Array.isArray(voiceData.primarySkillset)) {
      skills = voiceData.primarySkillset;
    } else if (typeof voiceData.primarySkillset === "string") {
      skills = voiceData.primarySkillset
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    return {
      tagline: voiceData.tagline || "",
      university: currentUser?.college || "",
      degree: "",
      endYear: "",
      skills,
      github: voiceData.githubUrl || "",
      linkedin: "",
      portfolio: "",
      motivation: voiceData.motivation || "",
      resumeName: "",
      resumeUrl: "",
      experienceLevel,
      preferredRoles,
      domainInterests,
    };
  });

  useEffect(() => {
    return () => localStorage.removeItem("voiceExtractedData");
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or DOCX file");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      resumeName: file.name,
      resumeUrl: URL.createObjectURL(file),
    }));
    setResumeFile(file);
    setResumeError("");

    if (currentUser?.id) {
      setResumeParsing(true);
      try {
        const fd = new FormData();
        fd.append("resume", file);
        const res = await fetch(
          `${API_BASE_URL}/profile/${currentUser.id}/resume`,
          { method: "POST", body: fd },
        );
        const data = await res.json();
        if (res.ok && data.extractedData) {
          const ed = data.extractedData;
          setFormData((prev) => ({
            ...prev,
            skills: ed.skills?.length ? ed.skills : prev.skills,
            university: ed.education?.[0]?.institution || prev.university,
            degree: ed.education?.[0]?.degree || prev.degree,
            github: ed.socialLinks?.github || prev.github,
            linkedin: ed.socialLinks?.linkedin || prev.linkedin,
          }));
        } else {
          setResumeError(
            "Resume uploaded but AI parsing had an issue. Edit manually.",
          );
        }
      } catch {
        setResumeError("Could not reach server for resume parsing.");
      } finally {
        setResumeParsing(false);
      }
    }
  };

  const removeResume = () => {
    setFormData((prev) => ({ ...prev, resumeName: "", resumeUrl: "" }));
    setResumeFile(null);
    setResumeError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleList = (listName, item) => {
    setFormData((prev) => {
      const list = prev[listName];
      const updated = list.includes(item)
        ? list.filter((i) => i !== item)
        : [...list, item];
      return { ...prev, [listName]: updated };
    });
  };

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, skillInput.trim()],
        }));
      }
      setSkillInput("");
    }
  };

  const handleFinalSubmit = async () => {
    if (!currentUser?.id) {
      alert("No user session found.");
      return;
    }
    setSaving(true);
    try {
      const profilePayload = {
        tagline: formData.tagline || null,
        college: formData.university || null,
        primarySkillset: formData.skills,
        githubUrl: formData.github || null,
        linkedinUrl: formData.linkedin || null,
        motivation: formData.motivation || null,
        socialLinks: {
          portfolio: formData.portfolio || "",
          linkedin: formData.linkedin || "",
          github: formData.github || "",
        },
        hackathonPreferences: {
          preferredRoles: formData.preferredRoles,
          domainInterests: formData.domainInterests,
          experienceLevel: formData.experienceLevel,
        },
        education: [
          {
            institution: formData.university,
            degree: formData.degree,
            year: formData.endYear,
          },
        ],
      };

      const res = await fetch(`${API_BASE_URL}/profile/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Failed to save profile.");
        return;
      }
      completeProfile();
    } catch {
      alert("Network error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  const cardCls =
    "bg-[#111] border border-white/10 rounded-2xl p-8 mb-6 shadow-2xl";
  const labelCls =
    "block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold";
  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-all placeholder:text-white/10";
  const btnCls =
    "px-10 py-4 bg-lime-400 text-black font-black rounded-xl hover:bg-lime-300 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-lime-400/10";

  const hasVoiceData =
    formData.tagline ||
    formData.skills.length > 0 ||
    formData.github ||
    formData.motivation;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic mb-2 tracking-tighter text-lime-400">
            REVIEW YOUR PROFILE
          </h1>
          <p className="text-white/40 text-sm">
            {hasVoiceData
              ? "We pre-filled your profile from the voice session. Edit anything below and submit."
              : "Fill in your details and submit."}
          </p>
          {hasVoiceData && (
            <div className="inline-flex items-center gap-2 mt-3 bg-lime-400/10 border border-lime-400/20 px-4 py-1.5 rounded-full">
              <Sparkles size={14} className="text-lime-400" />
              <span className="text-lime-400 text-xs font-bold uppercase tracking-widest">
                Pre-filled via AI
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => navigateTo("voiceProfile")}
          className="flex items-center gap-2 text-white/30 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to voice session</span>
        </button>

        {/* Identity & Education */}
        <div className={cardCls}>
          <h3 className="flex items-center gap-2 font-bold mb-6 text-lime-400 uppercase tracking-tighter">
            <User size={20} /> Identity & Education
          </h3>
          <div className="space-y-4 mb-6">
            <div>
              <label className={labelCls}>Professional Tagline</label>
              <textarea
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                placeholder="e.g. Fullstack Developer passionate about AI safety..."
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
            <div>
              <label className={labelCls}>Motivation</label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                placeholder="Why do you want to participate?"
                className={`${inputCls} min-h-[80px]`}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelCls}>University / College</label>
              <input
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                className={inputCls}
                placeholder="Institution Name"
              />
            </div>
            <div>
              <label className={labelCls}>Degree</label>
              <input
                name="degree"
                value={formData.degree}
                onChange={handleInputChange}
                className={inputCls}
                placeholder="e.g. B.Tech CS"
              />
            </div>
            <div>
              <label className={labelCls}>Graduation Year</label>
              <input
                name="endYear"
                value={formData.endYear}
                onChange={handleInputChange}
                className={inputCls}
                placeholder="2026"
              />
            </div>
          </div>
        </div>

        {/* Resume Upload */}
        <div className={cardCls}>
          <h3 className="flex items-center gap-2 font-bold mb-6 text-lime-400 uppercase tracking-tighter">
            <FileText size={20} /> Resume (Optional)
          </h3>
          {!formData.resumeName ? (
            <div
              onClick={() => fileInputRef.current.click()}
              className="w-full border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center hover:bg-white/5 hover:border-lime-400/50 transition-all cursor-pointer group"
            >
              <Upload
                size={48}
                className="text-white/20 group-hover:text-lime-400 mb-3 transition-colors"
              />
              <p className="text-sm font-bold text-white/40 group-hover:text-white transition-colors">
                Click to upload PDF / DOCX
              </p>
              <p className="text-[10px] text-white/20 mt-1">
                AI will auto-fill fields from your resume
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.docx"
              />
            </div>
          ) : (
            <div className="w-full bg-lime-400/10 border border-lime-400/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-lime-400 p-2 rounded-lg text-black">
                  <FileText size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-lime-400 truncate max-w-[200px]">
                    {formData.resumeName}
                  </p>
                  <p className="text-[10px] text-lime-400/50 uppercase font-bold tracking-widest">
                    {resumeParsing ? "AI is parsing..." : "Parsed ✓"}
                  </p>
                </div>
              </div>
              <button
                onClick={removeResume}
                className="p-2 hover:bg-red-500/20 text-red-500 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}
          {resumeError && (
            <p className="text-yellow-400/80 text-xs mt-2">{resumeError}</p>
          )}
        </div>

        {/* Skills & Links */}
        <div className={cardCls}>
          <h3 className="flex items-center gap-2 font-bold mb-6 text-lime-400 uppercase tracking-tighter">
            <Code size={20} /> Skills & Links
          </h3>
          <div className="mb-6">
            <label className={labelCls}>Tech Stack</label>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              className={inputCls}
              placeholder="Type a skill and press Enter..."
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  onClick={() => toggleList("skills", skill)}
                  className="bg-lime-400 text-black px-3 py-1 rounded-lg text-xs font-black cursor-pointer hover:bg-red-400 transition-colors"
                >
                  {skill} ×
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {PREDEFINED_SKILLS.filter(
                (s) => !formData.skills.includes(s),
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => toggleList("skills", s)}
                  className="text-[10px] border border-white/10 px-2 py-1 rounded hover:border-lime-400 transition-colors uppercase font-bold text-white/40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>GitHub URL</label>
              <input
                name="github"
                value={formData.github}
                onChange={handleInputChange}
                className={inputCls}
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className={labelCls}>LinkedIn URL</label>
              <input
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                className={inputCls}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className={labelCls}>Portfolio / Website</label>
              <input
                name="portfolio"
                value={formData.portfolio}
                onChange={handleInputChange}
                className={inputCls}
                placeholder="https://yoursite.com"
              />
            </div>
          </div>
        </div>

        {/* Hackathon Preferences */}
        <div className={cardCls}>
          <h3 className="flex items-center gap-2 font-bold mb-6 text-lime-400 uppercase tracking-tighter">
            <Award size={20} /> Hackathon Preferences
          </h3>
          <div className="mb-6">
            <label className={labelCls}>Preferred Roles (Max 3)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => toggleList("preferredRoles", role)}
                  className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${formData.preferredRoles.includes(role) ? "bg-lime-400 border-lime-400 text-black" : "bg-white/5 border-white/10 text-white/40"}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className={labelCls}>Domain Interests</label>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((domain) => (
                <button
                  key={domain}
                  onClick={() => toggleList("domainInterests", domain)}
                  className={`px-4 py-2 rounded-full border text-[10px] font-bold uppercase transition-all ${formData.domainInterests.includes(domain) ? "bg-lime-400 border-lime-400 text-black" : "bg-white/5 border-white/10 text-white/40"}`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Experience Level</label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleInputChange}
              className={inputCls}
            >
              <option value="Beginner">Newbie (0-1 Hackathons)</option>
              <option value="Intermediate">Hobbyist (2-5 Hackathons)</option>
              <option value="Advanced">Veteran (6+ Hackathons)</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-lime-400" size={24} />
            <p className="text-[10px] text-lime-400/60 uppercase tracking-wider font-bold leading-relaxed">
              Finalize to unlock team matchmaking & QR generation
            </p>
          </div>
          <button
            onClick={handleFinalSubmit}
            disabled={saving}
            className={`${btnCls} disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {saving ? "SAVING..." : "SUBMIT PROFILE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
