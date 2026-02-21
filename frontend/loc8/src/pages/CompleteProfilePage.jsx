import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Code, User, Briefcase, Award, Globe, CheckCircle, BookOpen, Upload, FileText, X } from "lucide-react";

const CompleteProfilePage = () => {
  const { completeProfile, currentUser } = useApp();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);
  
  // Consolidated State for all profile fields
  const [formData, setFormData] = useState({
    tagline: "",
    university: "",
    degree: "",
    endYear: "",
    skills: [],
    github: "",
    linkedin: "",
    portfolio: "",
    resumeName: "", // Track file name
    resumeUrl: "",  // Track file preview/blob
    experienceLevel: "Beginner",
    preferredRoles: [],
    domainInterests: []
  });

  const [skillInput, setSkillInput] = useState("");

  const PREDEFINED_SKILLS = ["React", "Node.js", "Python", "Tailwind", "Machine Learning", "Cloud", "Java", "C++"];
  const ROLES = ["Frontend", "Backend", "Fullstack", "UI/UX", "Mobile", "DevOps", "AI/ML"];
  const DOMAINS = ["FinTech", "HealthTech", "Web3", "EdTech", "SaaS", "AI", "Cybersecurity"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a PDF or DOCX file");
        return;
      }
      // Create local URL for preview and store in state
      setFormData(prev => ({
        ...prev,
        resumeName: file.name,
        resumeUrl: URL.createObjectURL(file)
      }));
    }
  };

  const removeResume = () => {
    setFormData(prev => ({ ...prev, resumeName: "", resumeUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleList = (listName, item) => {
    setFormData(prev => {
      const list = prev[listName];
      const newList = list.includes(item) 
        ? list.filter(i => i !== item) 
        : [...list, item];
      return { ...prev, [listName]: newList };
    });
  };

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput)) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      }
      setSkillInput("");
    }
  };

  const handleFinalSubmit = () => {
    const userKey = currentUser?.slug || currentUser?.name || 'hacker';
    localStorage.setItem(`profileData_${userKey}`, JSON.stringify(formData));
    
    // Also store resume data separately for compatibility with ResumePage
    if (formData.resumeUrl) {
        localStorage.setItem(`resumeData_${userKey}`, JSON.stringify({
            url: formData.resumeUrl,
            name: formData.resumeName,
            lastUpdated: new Date().toISOString()
        }));
    }
    
    completeProfile();
  };

  // Shared Styles
  const cardCls = "bg-[#111] border border-white/10 rounded-2xl p-8 mb-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4";
  const labelCls = "block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold";
  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-all placeholder:text-white/10";
  const btnCls = "px-10 py-4 bg-lime-400 text-black font-black rounded-xl hover:bg-lime-300 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-lime-400/10";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black italic mb-2 tracking-tighter text-lime-400">INITIALIZING HACKER PROFILE</h1>
          <p className="text-white/40 text-sm">Step {step} of 3: {step === 1 ? "Identity" : step === 2 ? "Professional Docs & Tech" : "Match Preferences"}</p>
          <div className="flex gap-2 mt-6 max-w-xs mx-auto">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? "bg-lime-400" : "bg-white/10"}`} />
            ))}
          </div>
        </div>

        {/* STEP 1: IDENTITY & EDUCATION */}
        {step === 1 && (
          <div className={cardCls}>
            <div className="mb-8">
              <h3 className="flex items-center gap-2 font-bold mb-6 text-lime-400 uppercase tracking-tighter"><User size={20} /> Professional Identity</h3>
              <label className={labelCls}>Professional Tagline</label>
              <textarea 
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                placeholder="e.g. Fullstack Developer passionate about AI safety..."
                className={`${inputCls} min-h-[100px]`}
              />
            </div>
            
            <div className="border-t border-white/5 pt-8">
              <h3 className="flex items-center gap-2 font-bold mb-6 text-lime-400 uppercase tracking-tighter"><BookOpen size={20} /> Education</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls}>University / College</label>
                  <input name="university" value={formData.university} onChange={handleInputChange} className={inputCls} placeholder="Institution Name" />
                </div>
                <div>
                  <label className={labelCls}>Degree</label>
                  <input name="degree" value={formData.degree} onChange={handleInputChange} className={inputCls} placeholder="e.g. B.Tech CS" />
                </div>
                <div>
                  <label className={labelCls}>Graduation Year</label>
                  <input name="endYear" value={formData.endYear} onChange={handleInputChange} className={inputCls} placeholder="2026" />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-10">
              <button onClick={() => setStep(2)} className={btnCls}>PROCEED →</button>
            </div>
          </div>
        )}

        {/* STEP 2: RESUME, TECH STACK & SOCIALS */}
        {step === 2 && (
          <div className={cardCls}>
            {/* NEW: Resume Upload Section */}
            <div className="mb-10">
              <h3 className="flex items-center gap-2 font-bold mb-6 text-lime-400 uppercase tracking-tighter"><FileText size={20} /> Professional Resume</h3>
              {!formData.resumeName ? (
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="w-full border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center bg-white/2 hover:bg-white/5 hover:border-lime-400/50 transition-all cursor-pointer group"
                >
                  <Upload size={48} className="text-white/20 group-hover:text-lime-400 mb-3 transition-colors" />
                  <p className="text-sm font-bold text-white/40 group-hover:text-white transition-colors">Click to upload PDF / DOCX</p>
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
                      <p className="text-sm font-black text-lime-400 truncate max-w-[200px]">{formData.resumeName}</p>
                      <p className="text-[10px] text-lime-400/50 uppercase font-bold tracking-widest">Ready for upload</p>
                    </div>
                  </div>
                  <button onClick={removeResume} className="p-2 hover:bg-red-500/20 text-red-500 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-8 mb-8">
              <h3 className="flex items-center gap-2 font-bold mb-6 text-lime-400 uppercase tracking-tighter"><Code size={20} /> Technical Arsenal</h3>
              <div className="relative mb-4">
                <input 
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  className={inputCls} 
                  placeholder="Type a skill and press Enter..." 
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills.map(skill => (
                  <span key={skill} onClick={() => toggleList('skills', skill)} className="bg-lime-400 text-black px-3 py-1 rounded-lg text-xs font-black cursor-pointer hover:bg-red-400 transition-colors">{skill} ×</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_SKILLS.filter(s => !formData.skills.includes(s)).map(s => (
                  <button key={s} onClick={() => toggleList('skills', s)} className="text-[10px] border border-white/10 px-2 py-1 rounded hover:border-lime-400 transition-colors uppercase font-bold text-white/40">{s}</button>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-8">
              <h3 className="flex items-center gap-2 font-bold mb-6 text-lime-400 uppercase tracking-tighter"><Globe size={20} /> Network Links</h3>
              <div className="space-y-4">
                <input name="github" value={formData.github} onChange={handleInputChange} className={inputCls} placeholder="GitHub URL" />
                <input name="linkedin" value={formData.linkedin} onChange={handleInputChange} className={inputCls} placeholder="LinkedIn URL" />
                <input name="portfolio" value={formData.portfolio} onChange={handleInputChange} className={inputCls} placeholder="Portfolio / Website" />
              </div>
            </div>
            <div className="flex justify-between mt-10">
              <button onClick={() => setStep(1)} className="text-white/40 font-bold hover:text-white uppercase tracking-widest">Back</button>
              <button onClick={() => setStep(3)} className={btnCls}>PROCEED →</button>
            </div>
          </div>
        )}

        {/* STEP 3: MATCH PREFERENCES */}
        {step === 3 && (
          <div className={cardCls}>
            <div className="mb-8">
              <h3 className="flex items-center gap-2 font-bold mb-6 text-lime-400 uppercase tracking-tighter"><Award size={20} /> Hackathon Preferences</h3>
              <label className={labelCls}>Preferred Roles (Max 3)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                {ROLES.map(role => (
                  <button 
                    key={role} 
                    onClick={() => toggleList('preferredRoles', role)}
                    className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${formData.preferredRoles.includes(role) ? "bg-lime-400 border-lime-400 text-black" : "bg-white/5 border-white/10 text-white/40"}`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <label className={labelCls}>Domain Interests</label>
              <div className="flex flex-wrap gap-2 mb-8">
                {DOMAINS.map(domain => (
                  <button 
                    key={domain} 
                    onClick={() => toggleList('domainInterests', domain)}
                    className={`px-4 py-2 rounded-full border text-[10px] font-bold uppercase transition-all ${formData.domainInterests.includes(domain) ? "bg-lime-400 border-lime-400 text-black" : "bg-white/5 border-white/10 text-white/40"}`}
                  >
                    {domain}
                  </button>
                ))}
              </div>

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

            <div className="bg-lime-400/5 border border-lime-400/20 p-4 rounded-xl flex items-center gap-4">
              <CheckCircle className="text-lime-400 flex-shrink-0" size={24} />
              <p className="text-[10px] leading-relaxed text-lime-400/60 uppercase tracking-wider">
                Profile finalization will unlock dynamic QR generation and team matchmaking for the current event phase.
              </p>
            </div>

            <div className="flex justify-between mt-10">
              <button onClick={() => setStep(2)} className="text-white/40 font-bold hover:text-white uppercase tracking-widest">Back</button>
              <button onClick={handleFinalSubmit} className={btnCls}>FINALIZE PROFILE</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteProfilePage;