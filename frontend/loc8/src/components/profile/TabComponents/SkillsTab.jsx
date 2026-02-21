import React, { useState } from 'react';

const SkillsTab = ({ skills = [], addSkill = () => {}, deleteSkill = () => {}, predefinedSkills = [] }) => {
  const [searchInput, setSearchInput] = useState('');

  const filtered = predefinedSkills.filter(s => 
    s.toLowerCase().includes(searchInput.toLowerCase()) && !skills.includes(s)
  ).slice(0, 5);

  return (
    <div className="space-y-4">
      <h3 className="text-white font-bold text-sm flex items-center gap-2">
        <span className="text-lime-400">⚡</span> Technical Arsenal
      </h3>
      <div className="relative">
        <input 
          type="text" 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search skills (e.g. React, Python...)" 
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-lime-400/60 outline-none"
        />
        {searchInput && (
          <div className="absolute z-10 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            {filtered.map(skill => (
              <button 
                key={skill}
                onClick={() => { addSkill(skill); setSearchInput(''); }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-lime-400 hover:text-black transition-colors"
              >
                + {skill}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        {skills.map((skill, index) => (
          <div key={index} className="bg-lime-400/10 border border-lime-400/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-lime-400 text-xs font-bold uppercase tracking-wider">{skill}</span>
            <button onClick={() => deleteSkill(index)} className="text-lime-400/40 hover:text-lime-400 text-lg">×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsTab;