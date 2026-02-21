import React, { useState } from "react";

const SocialLinksSection = ({ onSave }) => {
  const [formData, setFormData] = useState({
    linkedin: "",
    github: "",
    portfolio: "",
    twitter: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-lime-400/60 transition-colors";
  const labelCls = "block text-white/60 text-[10px] mb-1.5 uppercase tracking-widest";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>LinkedIn Profile</label>
          <input name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="linkedin.com/in/..." className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>GitHub Profile</label>
          <input name="github" value={formData.github} onChange={handleInputChange} placeholder="github.com/..." className={inputCls} />
        </div>
      </div>
      <div className="pt-6">
        <button
          onClick={() => onSave(formData)}
          className="w-full py-4 bg-lime-400 text-black font-bold rounded-xl hover:bg-lime-300 transition-all shadow-lg shadow-lime-400/20"
        >
          Complete Profile & Explore Hackathons →
        </button>
      </div>
    </div>
  );
};

export default SocialLinksSection;