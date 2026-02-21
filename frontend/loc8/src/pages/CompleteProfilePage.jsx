import React, { useState } from "react";
import { useApp } from "../context/AppContext";
// Integrating your uploaded Profile components
import TaglineSection from "../components/profile/section/TaglineSection";
import SocialLinksSection from "../components/profile/section/SocialLinksSection";
import EducationSection from "../components/profile/section/EducationSection";
import SkillsTab from "../components/profile/TabComponents/SkillsTab";

export default function CompleteProfilePage() {
  const { completeProfile, currentUser } = useApp();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    tagline: "",
    education: {},
    skills: [],
    social: {},
  });

  const handleSaveTagline = (tagline) => {
    setProfileData((p) => ({ ...p, tagline }));
    setStep(2);
  };

  const handleSaveEducation = (education) => {
    setProfileData((p) => ({ ...p, education }));
  };

  const handleCompleteSocial = (social) => {
    setProfileData((p) => ({ ...p, social }));
    completeProfile();
  };

  // Theme-consistent styles
  const cardCls = "bg-[#111] border border-white/10 rounded-2xl p-8";
  const progressCls = (s) => 
    `h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? "bg-lime-400" : "bg-white/10"}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header & Progress */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black italic mb-2">COMPLETE YOUR HACKER PROFILE</h1>
          <p className="text-white/40 text-sm">Step {step} of 3: {step === 1 ? "Basic Info" : step === 2 ? "Skills & Education" : "Social Presence"}</p>
          <div className="flex gap-3 mt-6 max-w-xs mx-auto">
            <div className={progressCls(1)} />
            <div className={progressCls(2)} />
            <div className={progressCls(3)} />
          </div>
        </div>

        {/* Step 1: Tagline & Intro */}
        {step === 1 && (
          <div className={`${cardCls} animate-in fade-in slide-in-from-bottom-4`}>
            <TaglineSection onSave={handleSaveTagline} isEditing={false} editData={profileData.tagline} />
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setStep(2)}
                className="px-8 py-3 bg-lime-400 text-black font-bold rounded-xl hover:bg-lime-300 transition-all"
              >
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Education & Skills */}
        {step === 2 && (
          <div className={`${cardCls} space-y-8 animate-in fade-in slide-in-from-bottom-4`}>
            <EducationSection onSave={handleSaveEducation} />
            <div className="border-t border-white/5 pt-8">
              <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm text-lime-400">Technical Arsenal</h3>
              <SkillsTab />
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="text-white/40 hover:text-white transition-colors">← Back</button>
              <button 
                onClick={() => setStep(3)}
                className="px-8 py-3 bg-lime-400 text-black font-bold rounded-xl hover:bg-lime-300 transition-all"
              >
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Socials & Finalize */}
        {step === 3 && (
          <div className={`${cardCls} animate-in fade-in slide-in-from-bottom-4`}>
            <SocialLinksSection onSave={handleCompleteSocial} />
            <div className="mt-10 p-4 bg-lime-400/5 border border-lime-400/20 rounded-xl">
              <p className="text-xs text-lime-400/80 leading-relaxed">
                By finalizing your profile, you'll gain access to registration for global hackathons and team invitations.
              </p>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(2)} className="text-white/40 hover:text-white transition-colors">← Back</button>
              <button 
                onClick={completeProfile}
                className="px-10 py-3 bg-lime-400 text-black font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-lime-400/10"
              >
                Launch Dashboard →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}