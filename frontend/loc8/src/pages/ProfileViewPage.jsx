import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../api";
import { User, Code, Award, Globe, ArrowLeft, Edit3, Github, Linkedin, ExternalLink, FileText, Mail, Phone, Building } from "lucide-react";

export default function ProfileViewPage() {
    const { currentUser, token, navigateTo, logout } = useApp();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!currentUser?.id) return;

        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/profile/${currentUser.id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.profile || data);
                } else if (res.status === 404) {
                    setError("noProfile");
                } else {
                    setError("Failed to load profile");
                }
            } catch {
                setError("Network error loading profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [currentUser?.id, token]);

    const cardCls = "bg-[#111] border border-white/10 rounded-2xl p-6 mb-5";

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-white/40">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error === "noProfile") {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <p className="text-5xl mb-4">📝</p>
                    <h2 className="text-2xl font-bold mb-2">No Profile Yet</h2>
                    <p className="text-white/40 mb-6">You haven't completed your profile. Let's set it up!</p>
                    <button
                        onClick={() => navigateTo("completeProfile")}
                        className="px-8 py-3 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all"
                    >
                        Complete Profile →
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-5xl mb-4">⚠️</p>
                    <p className="text-white/60">{error}</p>
                </div>
            </div>
        );
    }

    const skills = profile?.primarySkillset || [];
    const prefs = profile?.hackathonPreferences || {};
    const education = profile?.education || {};

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-10 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigateTo("studentDashboard")}
                    className="flex items-center gap-2 text-white/30 hover:text-white text-sm mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    <span>Back to Dashboard</span>
                </button>

                {/* Header Card */}
                <div className={`${cardCls} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#B4ED57]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative flex items-start justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#B4ED57] to-[#8bc34a] flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-[#B4ED57]/20">
                                {currentUser?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                                <h1 className="text-2xl font-black">{profile?.fullName || currentUser?.name || "User"}</h1>
                                {profile?.tagline && (
                                    <p className="text-white/50 text-sm mt-1 max-w-md">{profile.tagline}</p>
                                )}
                                <div className="flex items-center gap-4 mt-3">
                                    {(profile?.email || currentUser?.email) && (
                                        <span className="flex items-center gap-1.5 text-white/40 text-xs">
                                            <Mail size={12} />
                                            {profile?.email || currentUser.email}
                                        </span>
                                    )}
                                    {profile?.phone && (
                                        <span className="flex items-center gap-1.5 text-white/40 text-xs">
                                            <Phone size={12} />
                                            {profile.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigateTo("completeProfile")}
                            className="flex items-center gap-2 px-4 py-2 bg-[#B4ED57]/10 border border-[#B4ED57]/30 text-[#B4ED57] text-xs font-bold rounded-xl hover:bg-[#B4ED57]/20 transition-colors"
                        >
                            <Edit3 size={14} />
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Education */}
                {(education.institution || profile?.college) && (
                    <div className={cardCls}>
                        <h3 className="flex items-center gap-2 font-bold mb-4 text-[#B4ED57] uppercase tracking-wider text-xs">
                            <Building size={16} />
                            Education
                        </h3>
                        <div className="space-y-2">
                            <p className="text-white font-semibold">{education.institution || profile?.college}</p>
                            {education.degree && <p className="text-white/50 text-sm">{education.degree}</p>}
                            {education.year && <p className="text-white/40 text-xs">Class of {education.year}</p>}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <div className={cardCls}>
                        <h3 className="flex items-center gap-2 font-bold mb-4 text-[#B4ED57] uppercase tracking-wider text-xs">
                            <Code size={16} />
                            Tech Stack
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="bg-[#B4ED57]/15 text-[#B4ED57] border border-[#B4ED57]/20 px-3 py-1.5 rounded-lg text-xs font-bold"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Social Links */}
                {(profile?.githubUrl || profile?.linkedinUrl || profile?.portfolioUrl) && (
                    <div className={cardCls}>
                        <h3 className="flex items-center gap-2 font-bold mb-4 text-[#B4ED57] uppercase tracking-wider text-xs">
                            <Globe size={16} />
                            Links
                        </h3>
                        <div className="space-y-3">
                            {profile?.githubUrl && (
                                <a
                                    href={profile.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-colors group"
                                >
                                    <Github size={18} className="text-white/50 group-hover:text-white transition-colors" />
                                    <span className="text-white/70 text-sm flex-1">{profile.githubUrl}</span>
                                    <ExternalLink size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
                                </a>
                            )}
                            {profile?.linkedinUrl && (
                                <a
                                    href={profile.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-colors group"
                                >
                                    <Linkedin size={18} className="text-white/50 group-hover:text-white transition-colors" />
                                    <span className="text-white/70 text-sm flex-1">{profile.linkedinUrl}</span>
                                    <ExternalLink size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
                                </a>
                            )}
                            {profile?.portfolioUrl && (
                                <a
                                    href={profile.portfolioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-colors group"
                                >
                                    <ExternalLink size={18} className="text-white/50 group-hover:text-white transition-colors" />
                                    <span className="text-white/70 text-sm flex-1">{profile.portfolioUrl}</span>
                                    <ExternalLink size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Hackathon Preferences */}
                {(prefs.roles?.length > 0 || prefs.domains?.length > 0) && (
                    <div className={cardCls}>
                        <h3 className="flex items-center gap-2 font-bold mb-4 text-[#B4ED57] uppercase tracking-wider text-xs">
                            <Award size={16} />
                            Hackathon Preferences
                        </h3>
                        {prefs.roles?.length > 0 && (
                            <div className="mb-4">
                                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">Preferred Roles</p>
                                <div className="flex flex-wrap gap-2">
                                    {prefs.roles.map((r) => (
                                        <span key={r} className="bg-[#4D58D4]/20 text-[#8b93ff] border border-[#4D58D4]/30 px-3 py-1.5 rounded-lg text-xs font-bold">
                                            {r}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {prefs.domains?.length > 0 && (
                            <div className="mb-4">
                                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">Domain Interests</p>
                                <div className="flex flex-wrap gap-2">
                                    {prefs.domains.map((d) => (
                                        <span key={d} className="bg-white/5 text-white/60 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                            {d}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {prefs.experienceLevel && (
                            <div>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">Experience Level</p>
                                <span className="bg-[#B4ED57]/10 text-[#B4ED57] border border-[#B4ED57]/20 px-4 py-2 rounded-lg text-sm font-bold">
                                    {prefs.experienceLevel}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Motivation */}
                {profile?.motivation && (
                    <div className={cardCls}>
                        <h3 className="flex items-center gap-2 font-bold mb-4 text-[#B4ED57] uppercase tracking-wider text-xs">
                            <FileText size={16} />
                            Motivation
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed">{profile.motivation}</p>
                    </div>
                )}

                {/* Bottom actions */}
                <div className="flex items-center justify-between mt-4 mb-10">
                    <button
                        onClick={() => navigateTo("completeProfile")}
                        className="px-6 py-3 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-xl transition-all hover:scale-[1.01]"
                    >
                        Edit Profile →
                    </button>
                    <button
                        onClick={logout}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white font-semibold rounded-xl transition-all text-sm"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
