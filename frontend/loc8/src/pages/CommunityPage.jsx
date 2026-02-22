import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Search, Filter, Send, Heart, MessageCircle, Pin, ChevronDown, X, Check, UserPlus, Users, MessageSquare, Inbox } from "lucide-react";
import {
    getCommunityTeams,
    applyToTeam,
    getCommunityRequests,
    respondToRequest,
    getCommunityDiscussions,
    createDiscussionPost,
} from "../api";
import {
    MOCK_TEAM_LISTINGS,
    MOCK_TEAMMATE_LISTINGS,
    MOCK_INCOMING_REQUESTS,
    MOCK_DISCUSSION_POSTS,
    COMMUNITY_STATS,
    ALL_SKILLS,
} from "../data/communityData";

/* ── Skill Match Calculator ── */
function calcSkillMatch(requiredSkills, userSkills) {
    if (!requiredSkills?.length || !userSkills?.length) return 0;
    const matched = requiredSkills.filter((s) =>
        userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
    );
    return Math.round((matched.length / requiredSkills.length) * 100);
}

/* ── Skill Badge ── */
function SkillBadge({ skill, matched }) {
    return (
        <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${matched
                ? "bg-[#B4ED57]/15 border-[#B4ED57]/30 text-[#B4ED57]"
                : "bg-white/5 border-white/10 text-white/40"
                }`}
        >
            {skill}
        </span>
    );
}

/* ── Match % Indicator ── */
function MatchIndicator({ percent }) {
    const color =
        percent >= 75
            ? "text-[#B4ED57]"
            : percent >= 40
                ? "text-yellow-400"
                : "text-white/40";
    const bg =
        percent >= 75
            ? "bg-[#B4ED57]"
            : percent >= 40
                ? "bg-yellow-400"
                : "bg-white/20";
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                    className={`h-full rounded-full ${bg} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                />
            </div>
            <span className={`text-xs font-bold ${color}`}>{percent}% match</span>
        </div>
    );
}

/* ── Avatar ── */
function Avatar({ letter, size = "md", gradient }) {
    const sizes = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-14 h-14 text-xl",
    };
    return (
        <div
            className={`${sizes[size]} rounded-full flex items-center justify-center font-black flex-shrink-0 ${gradient || "bg-gradient-to-br from-[#4D58D4] to-[#6B63D9]"
                }`}
        >
            {letter}
        </div>
    );
}

/* ═══════════════════════════════════════════════════ */
/*  TAB: FIND A TEAM                                  */
/* ═══════════════════════════════════════════════════ */
function FindTeamTab({ userSkills, hackathonId }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSkillFilter, setSelectedSkillFilter] = useState([]);
    const [appliedTeams, setAppliedTeams] = useState([]);
    const [teamListings, setTeamListings] = useState(MOCK_TEAM_LISTINGS);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const data = await getCommunityTeams(hackathonId);
                const teams = Array.isArray(data) ? data : data?.teams || [];
                if (teams.length > 0) setTeamListings(teams);
            } catch { /* use fallback */ }
        };
        fetchTeams();
    }, [hackathonId]);

    const handleApply = async (teamId) => {
        try {
            await applyToTeam(teamId, "I'd love to join your team!");
        } catch { /* fire and forget */ }
        setAppliedTeams((prev) => [...prev, teamId]);
    };

    const filteredTeams = useMemo(() => {
        return teamListings.filter((team) => {
            const matchesSearch =
                !searchQuery ||
                team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                team.domain.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSkills =
                selectedSkillFilter.length === 0 ||
                selectedSkillFilter.some((skill) =>
                    team.requiredSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
                );
            return matchesSearch && matchesSkills;
        });
    }, [searchQuery, selectedSkillFilter]);

    return (
        <div>
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search teams by name, domain, or description..."
                        className="w-full bg-[#111] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#B4ED57]/50 transition-colors"
                        style={{ fontFamily: "'Fustat', sans-serif" }}
                    />
                </div>
            </div>

            {/* Skill Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
                {ALL_SKILLS.slice(0, 12).map((skill) => (
                    <button
                        key={skill}
                        onClick={() =>
                            setSelectedSkillFilter((prev) =>
                                prev.includes(skill)
                                    ? prev.filter((s) => s !== skill)
                                    : [...prev, skill]
                            )
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedSkillFilter.includes(skill)
                            ? "bg-[#B4ED57]/15 border-[#B4ED57]/30 text-[#B4ED57]"
                            : "bg-white/5 border-white/10 text-white/40 hover:border-white/30 hover:text-white/60"
                            }`}
                    >
                        {skill}
                    </button>
                ))}
                {selectedSkillFilter.length > 0 && (
                    <button
                        onClick={() => setSelectedSkillFilter([])}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        Clear ✕
                    </button>
                )}
            </div>

            {/* Team Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team) => {
                    const matchPercent = calcSkillMatch(team.requiredSkills, userSkills);
                    const hasApplied = appliedTeams.includes(team.id);
                    return (
                        <div
                            key={team.id}
                            className="group relative rounded-2xl overflow-hidden bg-[#111] border border-white/10 hover:border-[#B4ED57]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#B4ED57]/5"
                            style={{ fontFamily: "'Fustat', sans-serif" }}
                        >
                            {/* Header gradient */}
                            <div
                                className="h-2 w-full"
                                style={{
                                    background:
                                        team.status === "Urgent"
                                            ? "linear-gradient(90deg, #ef4444, #f97316)"
                                            : "linear-gradient(90deg, #4D58D4, #6B63D9)",
                                }}
                            />

                            <div className="p-5">
                                {/* Team name + status */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar letter={team.leader.avatar} gradient="bg-gradient-to-br from-[#B4ED57] to-[#8bc34a] text-black" />
                                        <div>
                                            <h3
                                                className="text-white font-bold text-base group-hover:text-[#c5f278] transition-colors"
                                                style={{ fontFamily: "'Questrial', sans-serif" }}
                                            >
                                                {team.teamName}
                                            </h3>
                                            <p className="text-white/40 text-[11px]">
                                                {team.leader.name} · {team.leader.university}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${team.status === "Urgent"
                                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                            : "bg-[#B4ED57]/15 text-[#B4ED57] border border-[#B4ED57]/30"
                                            }`}
                                    >
                                        {team.status}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-white/50 text-xs mb-4 line-clamp-2 leading-relaxed">
                                    {team.description}
                                </p>

                                {/* Skills needed */}
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {team.requiredSkills.map((skill) => (
                                        <SkillBadge
                                            key={skill}
                                            skill={skill}
                                            matched={userSkills?.some(
                                                (us) => us.toLowerCase() === skill.toLowerCase()
                                            )}
                                        />
                                    ))}
                                </div>

                                {/* Match + Meta */}
                                <div className="flex items-center justify-between mb-4">
                                    <MatchIndicator percent={matchPercent} />
                                    <div className="flex items-center gap-3 text-white/30 text-xs">
                                        <span>👥 {team.currentMembers}/{team.maxMembers}</span>
                                        <span className="text-[10px]">{team.postedAt}</span>
                                    </div>
                                </div>

                                {/* Domain + Action */}
                                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                    <span className="px-3 py-1 bg-[#4D58D4]/15 border border-[#4D58D4]/30 rounded-full text-[10px] font-bold text-[#4D58D4] uppercase">
                                        {team.domain}
                                    </span>
                                    <button
                                        onClick={() => !hasApplied && handleApply(team.id)}
                                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${hasApplied
                                            ? "bg-[#B4ED57]/10 text-[#B4ED57] border border-[#B4ED57]/30 cursor-default"
                                            : "bg-[#B4ED57] hover:bg-[#c5f278] text-black hover:scale-105 active:scale-95"
                                            }`}
                                    >
                                        {hasApplied ? (
                                            <>
                                                <Check size={12} /> Applied
                                            </>
                                        ) : (
                                            <>
                                                <Send size={12} /> Apply
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredTeams.length === 0 && (
                <div className="text-center py-20 text-white/30">
                    <Users size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-sm">No teams match your filters. Try broadening your search.</p>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════ */
/*  TAB: FIND A TEAMMATE                              */
/* ═══════════════════════════════════════════════════ */
function FindTeammateTab({ userSkills, communityPool, inviteSoloToTeam, isTeamLeader }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [invitedPeople, setInvitedPeople] = useState([]);

    // Map API community pool (items have nested .participant) + mock data
    const allPeople = useMemo(() => {
        const apiPeople = (communityPool || []).map((entry, i) => {
            const p = entry.participant || entry;
            return {
                id: p.id || entry.id || `api_${i}`,
                participantId: p.id,
                name: p.fullName || p.name || p.email || "Hacker",
                avatar: (p.fullName || p.name || "H")[0]?.toUpperCase(),
                university: p.college || p.university || "",
                tagline: p.tagline || "Looking for a team",
                lookingFor: "A team to join",
                skills: p.primarySkillset || p.skills || [],
                preferredRoles: p.preferredRoles || [],
                experienceLevel: p.experienceLevel || "Beginner",
                postedAt: "Recently",
                githubUrl: p.githubUrl || "",
            };
        });
        return apiPeople.length > 0 ? [...apiPeople, ...MOCK_TEAMMATE_LISTINGS] : MOCK_TEAMMATE_LISTINGS;
    }, [communityPool]);

    const filtered = useMemo(() => {
        return allPeople.filter(
            (person) =>
                !searchQuery ||
                person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                person.skills.some((s) =>
                    s.toLowerCase().includes(searchQuery.toLowerCase())
                ) ||
                person.tagline.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, allPeople]);

    return (
        <div>
            {/* Search */}
            <div className="relative mb-8">
                <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search hackers by name, skills, or tagline..."
                    className="w-full bg-[#111] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#B4ED57]/50 transition-colors"
                    style={{ fontFamily: "'Fustat', sans-serif" }}
                />
            </div>

            {/* People Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((person) => {
                    const hasInvited = invitedPeople.includes(person.id);
                    return (
                        <div
                            key={person.id}
                            className="group rounded-2xl bg-[#111] border border-white/10 hover:border-[#4D58D4]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#4D58D4]/5 overflow-hidden"
                            style={{ fontFamily: "'Fustat', sans-serif" }}
                        >
                            {/* Top Stripe */}
                            <div
                                className="h-2 w-full"
                                style={{
                                    background:
                                        "linear-gradient(90deg, #4D58D4, #B4ED57)",
                                }}
                            />

                            <div className="p-5">
                                {/* Person info */}
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar letter={person.avatar} size="lg" />
                                    <div>
                                        <h3
                                            className="text-white font-bold text-base group-hover:text-[#c5f278] transition-colors"
                                            style={{ fontFamily: "'Questrial', sans-serif" }}
                                        >
                                            {person.name}
                                        </h3>
                                        <p className="text-white/40 text-[11px]">
                                            {person.university}
                                        </p>
                                        <span
                                            className={`inline-block mt-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${person.experienceLevel === "Advanced"
                                                ? "bg-[#B4ED57]/15 text-[#B4ED57] border border-[#B4ED57]/30"
                                                : "bg-[#4D58D4]/15 text-[#4D58D4] border border-[#4D58D4]/30"
                                                }`}
                                        >
                                            {person.experienceLevel}
                                        </span>
                                    </div>
                                </div>

                                {/* Tagline */}
                                <p className="text-white/50 text-xs mb-3 italic leading-relaxed">
                                    "{person.tagline}"
                                </p>

                                {/* Looking for */}
                                <p className="text-white/30 text-[11px] mb-4">
                                    <span className="text-white/50 font-semibold">Looking for:</span>{" "}
                                    {person.lookingFor}
                                </p>

                                {/* Skills */}
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {person.skills.map((skill) => (
                                        <SkillBadge
                                            key={skill}
                                            skill={skill}
                                            matched={userSkills?.some(
                                                (us) => us.toLowerCase() === skill.toLowerCase()
                                            )}
                                        />
                                    ))}
                                </div>

                                {/* Roles + Time */}
                                <div className="flex items-center justify-between mb-4 text-xs text-white/30">
                                    <div className="flex gap-1.5">
                                        {person.preferredRoles.map((role) => (
                                            <span
                                                key={role}
                                                className="px-2 py-0.5 bg-white/5 rounded text-[10px] uppercase"
                                            >
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-[10px]">{person.postedAt}</span>
                                </div>

                                {/* Action */}
                                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                                    <button
                                        onClick={async () => {
                                            if (hasInvited) return;
                                            if (person.participantId && isTeamLeader && inviteSoloToTeam) {
                                                const result = await inviteSoloToTeam(person.participantId);
                                                if (result?.success) {
                                                    setInvitedPeople((prev) => [...prev, person.id]);
                                                } else {
                                                    alert(result?.message || "Failed to invite");
                                                }
                                            } else {
                                                setInvitedPeople((prev) => [...prev, person.id]);
                                            }
                                        }}
                                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${hasInvited
                                            ? "bg-[#4D58D4]/10 text-[#4D58D4] border border-[#4D58D4]/30 cursor-default"
                                            : "bg-[#B4ED57] hover:bg-[#c5f278] text-black hover:scale-[1.02] active:scale-95"
                                            }`}
                                    >
                                        {hasInvited ? (
                                            <>
                                                <Check size={12} /> Invited
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={12} /> Invite to Team
                                            </>
                                        )}
                                    </button>
                                    <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
                                        <MessageCircle size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 text-white/30">
                    <UserPlus size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-sm">No hackers match your search.</p>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════ */
/*  TAB: REQUESTS                                     */
/* ═══════════════════════════════════════════════════ */
function RequestsTab({ userSkills }) {
    const [requests, setRequests] = useState(MOCK_INCOMING_REQUESTS);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await getCommunityRequests();
                const reqs = Array.isArray(data) ? data : data?.requests || [];
                if (reqs.length > 0) setRequests(reqs);
            } catch { /* use fallback */ }
        };
        fetchRequests();
    }, []);

    const handleAccept = async (id) => {
        setRequests((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: "accepted" } : r))
        );
        try { await respondToRequest(id, "accept"); } catch { /* already updated locally */ }
    };

    const handleReject = async (id) => {
        setRequests((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
        );
        try { await respondToRequest(id, "reject"); } catch { /* already updated locally */ }
    };

    const pending = requests.filter((r) => r.status === "pending");
    const resolved = requests.filter((r) => r.status !== "pending");

    return (
        <div>
            {/* Pending Requests */}
            <div className="mb-10">
                <h3
                    className="text-white font-bold text-lg mb-4 flex items-center gap-2"
                    style={{ fontFamily: "'Questrial', sans-serif" }}
                >
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    Pending Requests
                    <span className="ml-2 text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">
                        {pending.length}
                    </span>
                </h3>

                {pending.length === 0 ? (
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center text-white/30">
                        <Inbox size={36} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No pending requests right now.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pending.map((req) => {
                            const matchPercent = calcSkillMatch(req.skills, userSkills);
                            return (
                                <div
                                    key={req.id}
                                    className="bg-[#111] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all"
                                    style={{ fontFamily: "'Fustat', sans-serif" }}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Person */}
                                        <div className="flex items-center gap-3 flex-1">
                                            <Avatar letter={req.from.avatar} gradient="bg-gradient-to-br from-yellow-400 to-orange-500 text-black" />
                                            <div>
                                                <h4 className="text-white font-bold text-sm" style={{ fontFamily: "'Questrial', sans-serif" }}>
                                                    {req.from.name}
                                                </h4>
                                                <p className="text-white/40 text-[11px]">{req.from.university} · {req.preferredRole} · {req.experienceLevel}</p>
                                            </div>
                                        </div>

                                        {/* Match + Time */}
                                        <div className="flex items-center gap-4">
                                            <MatchIndicator percent={matchPercent} />
                                            <span className="text-white/20 text-[10px]">{req.requestedAt}</span>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <p className="text-white/40 text-xs mt-3 leading-relaxed pl-13">
                                        "{req.message}"
                                    </p>

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {req.skills.map((skill) => (
                                            <SkillBadge
                                                key={skill}
                                                skill={skill}
                                                matched={userSkills?.some(
                                                    (us) => us.toLowerCase() === skill.toLowerCase()
                                                )}
                                            />
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
                                        <button
                                            onClick={() => handleAccept(req.id)}
                                            className="px-5 py-2.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black text-xs font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                                        >
                                            <Check size={14} /> Accept
                                        </button>
                                        <button
                                            onClick={() => handleReject(req.id)}
                                            className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/60 text-xs font-bold rounded-xl hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all flex items-center gap-1.5"
                                        >
                                            <X size={14} /> Decline
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Resolved Requests */}
            {resolved.length > 0 && (
                <div>
                    <h3
                        className="text-white/50 font-bold text-sm mb-4 uppercase tracking-widest"
                        style={{ fontFamily: "'Questrial', sans-serif" }}
                    >
                        Resolved
                    </h3>
                    <div className="space-y-3">
                        {resolved.map((req) => (
                            <div
                                key={req.id}
                                className="bg-[#111]/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between opacity-60"
                                style={{ fontFamily: "'Fustat', sans-serif" }}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        letter={req.from.avatar}
                                        size="sm"
                                        gradient={
                                            req.status === "accepted"
                                                ? "bg-gradient-to-br from-[#B4ED57] to-[#8bc34a] text-black"
                                                : "bg-white/10 text-white/40"
                                        }
                                    />
                                    <div>
                                        <span className="text-white/60 text-sm font-semibold">{req.from.name}</span>
                                        <span className="text-white/20 text-xs ml-2">{req.from.university}</span>
                                    </div>
                                </div>
                                <span
                                    className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${req.status === "accepted"
                                        ? "bg-[#B4ED57]/15 text-[#B4ED57] border border-[#B4ED57]/30"
                                        : "bg-red-500/10 text-red-400 border border-red-500/30"
                                        }`}
                                >
                                    {req.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════ */
/*  TAB: DISCUSSION                                   */
/* ═══════════════════════════════════════════════════ */
function DiscussionTab({ hackathonId }) {
    const [posts, setPosts] = useState(MOCK_DISCUSSION_POSTS);
    const [newPost, setNewPost] = useState("");
    const [likedPosts, setLikedPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await getCommunityDiscussions(hackathonId);
                const fetched = Array.isArray(data) ? data : data?.posts || [];
                if (fetched.length > 0) setPosts(fetched);
            } catch { /* use fallback */ }
        };
        fetchPosts();
    }, [hackathonId]);

    const handleCreatePost = async () => {
        if (!newPost.trim()) return;
        const post = {
            id: `d_new_${Date.now()}`,
            author: { name: "You", avatar: "Y", role: "student" },
            content: newPost,
            tags: ["community"],
            likes: 0,
            comments: 0,
            postedAt: "Just now",
            isPinned: false,
        };
        setPosts((prev) => [post, ...prev]);
        setNewPost("");
        try {
            await createDiscussionPost(newPost, ["community"]);
        } catch { /* already added locally */ }
    };

    const toggleLike = (id) => {
        setLikedPosts((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        );
    };

    const tagColors = {
        announcement: "bg-[#B4ED57]/15 text-[#B4ED57] border-[#B4ED57]/30",
        welcome: "bg-[#4D58D4]/15 text-[#4D58D4] border-[#4D58D4]/30",
        "looking-for-team": "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
        healthcare: "bg-pink-400/15 text-pink-400 border-pink-400/30",
        ml: "bg-purple-400/15 text-purple-400 border-purple-400/30",
        tips: "bg-blue-400/15 text-blue-400 border-blue-400/30",
        "first-timers": "bg-cyan-400/15 text-cyan-400 border-cyan-400/30",
        resource: "bg-[#B4ED57]/15 text-[#B4ED57] border-[#B4ED57]/30",
        template: "bg-orange-400/15 text-orange-400 border-orange-400/30",
        react: "bg-sky-400/15 text-sky-400 border-sky-400/30",
        question: "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
        rules: "bg-white/10 text-white/50 border-white/20",
        ai: "bg-purple-400/15 text-purple-400 border-purple-400/30",
        community: "bg-[#4D58D4]/15 text-[#4D58D4] border-[#4D58D4]/30",
    };

    return (
        <div>
            {/* Create Post */}
            <div
                className="bg-[#111] border border-white/10 rounded-2xl p-5 mb-8"
                style={{ fontFamily: "'Fustat', sans-serif" }}
            >
                <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share something with the community... tips, questions, or find teammates!"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#B4ED57]/50 transition-colors min-h-[80px] resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/30 cursor-pointer hover:border-white/20 transition-all">
                            #community
                        </span>
                    </div>
                    <button
                        onClick={handleCreatePost}
                        disabled={!newPost.trim()}
                        className="px-5 py-2 bg-[#B4ED57] hover:bg-[#c5f278] text-black text-xs font-bold rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 flex items-center gap-1.5"
                    >
                        <Send size={12} /> Post
                    </button>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
                {posts
                    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                    .map((post) => {
                        const isLiked = likedPosts.includes(post.id);
                        return (
                            <div
                                key={post.id}
                                className={`bg-[#111] border rounded-2xl p-5 transition-all hover:border-white/20 ${post.isPinned
                                    ? "border-[#B4ED57]/20 shadow-lg shadow-[#B4ED57]/5"
                                    : "border-white/10"
                                    }`}
                                style={{ fontFamily: "'Fustat', sans-serif" }}
                            >
                                {/* Pinned badge */}
                                {post.isPinned && (
                                    <div className="flex items-center gap-1.5 mb-3 text-[#B4ED57] text-[10px] font-bold uppercase tracking-widest">
                                        <Pin size={10} /> Pinned
                                    </div>
                                )}

                                {/* Author */}
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar
                                        letter={post.author.avatar}
                                        size="sm"
                                        gradient={
                                            post.author.role === "organizer"
                                                ? "bg-gradient-to-br from-[#B4ED57] to-[#8bc34a] text-black"
                                                : "bg-gradient-to-br from-[#4D58D4] to-[#6B63D9]"
                                        }
                                    />
                                    <div>
                                        <span className="text-white font-bold text-sm">
                                            {post.author.name}
                                        </span>
                                        {post.author.role === "organizer" && (
                                            <span className="ml-2 text-[9px] bg-[#B4ED57]/20 text-[#B4ED57] px-1.5 py-0.5 rounded font-bold uppercase">
                                                Organizer
                                            </span>
                                        )}
                                        <p className="text-white/30 text-[11px]">{post.postedAt}</p>
                                    </div>
                                </div>

                                {/* Content */}
                                <p className="text-white/70 text-sm leading-relaxed mb-4">{post.content}</p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {post.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${tagColors[tag] || "bg-white/5 text-white/30 border-white/10"
                                                }`}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Engagement */}
                                <div className="flex items-center gap-4 pt-3 border-t border-white/5">
                                    <button
                                        onClick={() => toggleLike(post.id)}
                                        className={`flex items-center gap-1.5 text-xs transition-all ${isLiked
                                            ? "text-red-400 font-bold"
                                            : "text-white/30 hover:text-red-400"
                                            }`}
                                    >
                                        <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
                                        {post.likes + (isLiked ? 1 : 0)}
                                    </button>
                                    <button className="flex items-center gap-1.5 text-xs text-white/30 hover:text-[#4D58D4] transition-all">
                                        <MessageCircle size={14} />
                                        {post.comments}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════ */
/*  MAIN: COMMUNITY PAGE                              */
/* ═══════════════════════════════════════════════════ */
export default function CommunityPage() {
    const { currentUser, navigateTo, registerSolo, fetchCommunityPool, selectedHackathon, inviteSoloToTeam, isTeamLeader } = useApp();
    const [activeTab, setActiveTab] = useState("findTeam");
    const [communityPool, setCommunityPool] = useState([]);
    const [soloRegistered, setSoloRegistered] = useState(false);
    const [soloLoading, setSoloLoading] = useState(false);
    const [communityStats, setCommunityStats] = useState(COMMUNITY_STATS);
    const [pendingRequestCount, setPendingRequestCount] = useState(MOCK_INCOMING_REQUESTS.filter(r => r.status === "pending").length);

    // Fetch community pool on mount
    useEffect(() => {
        if (selectedHackathon?.id) {
            fetchCommunityPool(selectedHackathon.id).then(setCommunityPool);
        }
    }, [selectedHackathon?.id]);

    // Fetch pending request count
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const data = await getCommunityRequests();
                const reqs = Array.isArray(data) ? data : data?.requests || [];
                if (reqs.length > 0) {
                    setPendingRequestCount(reqs.filter(r => r.status === "pending").length);
                }
            } catch { /* use fallback */ }
        };
        fetchCount();
    }, []);

    const handleRegisterSolo = async () => {
        setSoloLoading(true);
        const result = await registerSolo({});
        if (result?.success) {
            setSoloRegistered(true);
        } else {
            alert(result?.message || "Failed to register as solo");
        }
        setSoloLoading(false);
    };

    // Retrieve user skills from profile (mirror CompleteProfilePage logic)
    const userKey = currentUser?.slug || currentUser?.name || "hacker";
    const profileData = (() => {
        try {
            return JSON.parse(localStorage.getItem(`profileData_${userKey}`)) || {};
        } catch {
            return {};
        }
    })();
    const userSkills = profileData.skills || [];

    const tabs = [
        { key: "findTeam", label: "Find a Team", icon: <Users size={16} /> },
        { key: "findTeammate", label: "Find a Teammate", icon: <UserPlus size={16} /> },
        { key: "requests", label: "Requests", icon: <Inbox size={16} />, badge: pendingRequestCount },
        { key: "discussion", label: "Discussion", icon: <MessageSquare size={16} /> },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Navbar />

            <main>
                {/* Hero Section — same style as landing page */}
                <section
                    className="relative min-h-[50vh] flex items-center justify-center overflow-hidden rounded-3xl mx-4 mt-[64px] mb-12"
                    style={{
                        background:
                            "linear-gradient(135deg, #1a1d5e 0%, #2a2f8a 20%, #4D58D4 40%, #6B63D9 60%, #7B6FE0 75%, #5a5fd6 100%)",
                    }}
                >
                    {/* Vertical background lines */}
                    <div className="absolute inset-0 opacity-[0.08]">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-px bg-white h-full"
                                style={{ left: `${(i + 1) * 5}%` }}
                            />
                        ))}
                    </div>

                    {/* Glow orbs */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6B63D9]/30 rounded-full blur-[120px]" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B7FFF]/15 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#4D58D4]/20 rounded-full blur-[100px]" />

                    {/* Content */}
                    <div className="relative text-center px-8 max-w-4xl flex flex-col items-center justify-center py-16">
                        <h1
                            className="text-white text-4xl md:text-[3.5rem] font-light tracking-tight"
                            style={{ fontFamily: "'Questrial', sans-serif", lineHeight: 1 }}
                        >
                            Find Your
                        </h1>
                        <span
                            className="text-[#B4ED57] text-6xl md:text-[8rem] leading-none block -my-2"
                            style={{ fontFamily: "'Pixelify Sans', cursive", fontStyle: "italic" }}
                        >
                            Dream Team
                        </span>
                        <h1
                            className="text-white text-4xl md:text-[3.5rem] font-light tracking-tight mb-6"
                            style={{ fontFamily: "'Questrial', sans-serif", lineHeight: 1 }}
                        >
                            Here
                        </h1>
                        <p
                            className="text-white/60 text-base md:text-lg max-w-lg mx-auto mb-8 leading-relaxed"
                            style={{ fontFamily: "'Fustat', sans-serif" }}
                        >
                            Connect with talented hackers, find the perfect teammates, and
                            build something extraordinary together.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => setActiveTab("findTeam")}
                                className="px-8 py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-full transition-all hover:scale-105 flex items-center gap-2 text-base"
                                style={{ fontFamily: "'Fustat', sans-serif" }}
                            >
                                Browse Teams &nbsp;→
                            </button>
                            <button
                                onClick={() => setActiveTab("findTeammate")}
                                className="px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-full transition-all border border-white/20 backdrop-blur-sm text-base"
                                style={{ fontFamily: "'Fustat', sans-serif" }}
                            >
                                Find Teammates
                            </button>
                            {!soloRegistered ? (
                                <button
                                    onClick={handleRegisterSolo}
                                    disabled={soloLoading}
                                    className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-full transition-all border border-white/15 backdrop-blur-sm text-base disabled:opacity-50"
                                    style={{ fontFamily: "'Fustat', sans-serif" }}
                                >
                                    {soloLoading ? "Registering..." : "Go Solo 🎯"}
                                </button>
                            ) : (
                                <span className="px-8 py-3.5 bg-[#B4ED57]/10 text-[#B4ED57] font-bold rounded-full border border-[#B4ED57]/30 text-base">
                                    ✓ Solo Registered
                                </span>
                            )}
                        </div>
                    </div>
                </section>

                {/* Stats Bar */}
                <div className="flex justify-center gap-5 px-4 mb-16 flex-wrap">
                    {communityStats.map((stat, i) => (
                        <div
                            key={i}
                            className={`bg-[#141414] border border-white/10 ${stat.border} border-l-2 rounded-xl px-6 py-5 min-w-[160px]`}
                        >
                            <div
                                className={`text-3xl font-bold ${stat.color} mb-1`}
                                style={{ fontFamily: "'Questrial', sans-serif" }}
                            >
                                {stat.value}
                            </div>
                            <div
                                className="text-white/40 text-sm"
                                style={{ fontFamily: "'Fustat', sans-serif" }}
                            >
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs + Content */}
                <div className="max-w-7xl mx-auto px-6 pb-20">
                    {/* Tab Navigation */}
                    <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.key
                                    ? "bg-[#B4ED57] text-black shadow-lg shadow-[#B4ED57]/20"
                                    : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/30"
                                    }`}
                                style={{ fontFamily: "'Fustat', sans-serif" }}
                            >
                                {tab.icon}
                                {tab.label}
                                {tab.badge && (
                                    <span
                                        className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.key
                                            ? "bg-black/20 text-black"
                                            : "bg-red-500/20 text-red-400"
                                            }`}
                                    >
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}

                        {/* Back to Dashboard */}
                        <button
                            onClick={() => navigateTo("studentDashboard")}
                            className="ml-auto px-4 py-2.5 bg-white/5 border border-white/10 text-white/40 text-xs rounded-full hover:text-white hover:border-white/30 transition-all whitespace-nowrap"
                            style={{ fontFamily: "'Fustat', sans-serif" }}
                        >
                            ← Dashboard
                        </button>
                    </div>

                    {/* Section Header */}
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2
                                className="text-3xl font-black italic mb-2 tracking-tighter text-lime-400"
                            >
                                {activeTab === "findTeam" && "OPEN TEAMS"}
                                {activeTab === "findTeammate" && "AVAILABLE HACKERS"}
                                {activeTab === "requests" && "YOUR REQUESTS"}
                                {activeTab === "discussion" && "COMMUNITY FEED"}
                            </h2>
                            <p className="text-white/40 text-sm" style={{ fontFamily: "'Fustat', sans-serif" }}>
                                {activeTab === "findTeam" && "Browse teams looking for talented members like you."}
                                {activeTab === "findTeammate" && "Discover skilled hackers ready to join your team."}
                                {activeTab === "requests" && "Review and manage incoming team requests."}
                                {activeTab === "discussion" && "Share ideas, ask questions, and connect with the community."}
                            </p>
                        </div>
                        {activeTab !== "discussion" && activeTab !== "requests" && (
                            <div className="hidden md:flex gap-2">
                                <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white/60">
                                    All Domains
                                </span>
                                <span className="px-4 py-2 bg-lime-400/10 border border-lime-400/20 rounded-full text-xs text-lime-400 font-bold">
                                    Best Match
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Tab Content */}
                    {activeTab === "findTeam" && <FindTeamTab userSkills={userSkills} hackathonId={selectedHackathon?.id} />}
                    {activeTab === "findTeammate" && <FindTeammateTab userSkills={userSkills} communityPool={communityPool} inviteSoloToTeam={inviteSoloToTeam} isTeamLeader={isTeamLeader} />}
                    {activeTab === "requests" && <RequestsTab userSkills={userSkills} />}
                    {activeTab === "discussion" && <DiscussionTab hackathonId={selectedHackathon?.id} />}
                </div>
            </main>

            <Footer />
        </div>
    );
}
