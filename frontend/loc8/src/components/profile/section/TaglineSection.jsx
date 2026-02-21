import React, { useState, useEffect } from "react";

const TaglineSection = ({ editData, isEditing, onSave }) => {
  const [formData, setFormData] = useState("");

  useEffect(() => {
    if (isEditing && editData) {
      setFormData(editData);
    } else {
      setFormData("");
    }
  }, [editData, isEditing]);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-white/60 text-xs mb-2 uppercase tracking-wider">
          Your Professional Tagline
        </label>
        <textarea
          value={formData || ""}
          onChange={(e) => setFormData(e.target.value)}
          placeholder="E.g., 'Full-stack developer specialized in React and Node.js'"
          rows="4"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-lime-400/60 transition-colors"
        />
        <p className="text-xs text-white/30 mt-3 leading-relaxed">
          A brief statement that summarizes your professional identity.
        </p>
      </div>
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-lime-400 text-black font-bold rounded-xl hover:bg-lime-300 transition-all shadow-lg shadow-lime-400/10"
        >
          {isEditing ? "Update Headline" : "Save & Continue"}
        </button>
      </div>
    </div>
  );
};

export default TaglineSection;