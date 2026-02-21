import React, { useState } from "react";

const EducationSection = ({ onSave }) => {
  const [formData, setFormData] = useState({
    university: "",
    degree: "",
    fieldOfStudy: "",
    endYear: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-lime-400/60 transition-colors";
  const labelCls = "block text-white/60 text-[10px] mb-1.5 uppercase tracking-widest";

  return (
    <div className="space-y-6">
      <h3 className="text-white font-bold text-sm flex items-center gap-2">
        <span className="text-lime-400">🎓</span> Academic Background
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelCls}>University / College</label>
          <input name="university" value={formData.university} onChange={handleInputChange} placeholder="University Name" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Degree</label>
          <input name="degree" value={formData.degree} onChange={handleInputChange} placeholder="e.g. B.Tech" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Graduation Year</label>
          <input name="endYear" type="number" value={formData.endYear} onChange={handleInputChange} placeholder="2026" className={inputCls} />
        </div>
      </div>
    </div>
  );
};

export default EducationSection;