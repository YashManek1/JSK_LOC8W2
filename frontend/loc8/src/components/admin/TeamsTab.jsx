import React, { useState } from "react";

/* ======================================================================= */
/*  MOCK DATA                                                               */
/* ======================================================================= */

const TEAMS = [
  {
    id: "t1",
    name: "404 Found",
    problemStatement: "AI-based Attendance Verification",
    domain: "AI/ML",
    members: [
      { name: "Ananya Sharma", role: "API Architect", verified: true, faceVerified: true, rsvp: "confirmed" },
      { name: "Ravi Kumar", role: "UI Wizard", verified: true, faceVerified: true, rsvp: "confirmed" },
      { name: "Priya Nair", role: "Database Don", verified: true, faceVerified: false, rsvp: "confirmed" },
      { name: "Sahil Desai", role: "ML Engineer", verified: false, faceVerified: false, rsvp: "pending" },
    ],
    github: {
      totalCommits: 187,
      memberCommits: { "Ananya Sharma": 62, "Ravi Kumar": 55, "Priya Nair": 48, "Sahil Desai": 22 },
      lastCommit: "2026-02-21 03:42 AM",
      hourlyFrequency: [0, 0, 1, 3, 0, 0, 0, 0, 2, 5, 8, 12, 10, 8, 6, 9, 11, 14, 12, 8, 5, 3, 2, 1],
      postDeadlineFlag: false,
      plagiarismScore: 4,
    },
    round1: { innovation: 8.5, feasibility: 7.8, techDepth: 9.0, clarity: 8.2, impact: 8.8, weighted: 84.6 },
    rank: 1,
    shortlisted: true,
    flagged: false,
    pptUrl: "#",
    resumeKeywords: ["TensorFlow", "React", "MongoDB", "REST API", "Computer Vision"],
    sponsors: { starred: ["TechCorp", "InnoVentures"], ndaTriggered: false, recruitmentInterest: true },
    judgeMarks: [{ judge: "Dr. Priya Sharma", note: "Strong technical depth" }, { judge: "Rahul Mehra", note: "Good demo" }],
  },
  {
    id: "t2",
    name: "ChainHackers",
    problemStatement: "Decentralised Student ID Verification",
    domain: "Web3",
    members: [
      { name: "Arjun Patel", role: "Smart Contract Dev", verified: true, faceVerified: true, rsvp: "confirmed" },
      { name: "Meera Joshi", role: "UI Wizard", verified: true, faceVerified: true, rsvp: "confirmed" },
      { name: "Karan Singh", role: "Backend Lead", verified: true, faceVerified: true, rsvp: "confirmed" },
    ],
    github: {
      totalCommits: 143,
      memberCommits: { "Arjun Patel": 58, "Meera Joshi": 47, "Karan Singh": 38 },
      lastCommit: "2026-02-21 02:15 AM",
      hourlyFrequency: [0, 1, 2, 1, 0, 0, 0, 0, 3, 6, 9, 11, 8, 7, 5, 8, 10, 12, 9, 6, 4, 3, 2, 0],
      postDeadlineFlag: false,
      plagiarismScore: 2,
    },
    round1: { innovation: 9.0, feasibility: 7.2, techDepth: 8.5, clarity: 7.8, impact: 8.0, weighted: 81.0 },
    rank: 3,
    shortlisted: true,
    flagged: false,
    pptUrl: "#",
    resumeKeywords: ["Solidity", "Ethereum", "IPFS", "React", "Node.js"],
    sponsors: { starred: ["BlockFund"], ndaTriggered: true, recruitmentInterest: true },
    judgeMarks: [{ judge: "Rahul Mehra", note: "Innovative approach to identity" }],
  },
  {
    id: "t3",
    name: "IoTSquad",
    problemStatement: "Smart Campus Energy Monitor",
    domain: "IoT",
    members: [
      { name: "Neha Gupta", role: "Hardware Lead", verified: true, faceVerified: true, rsvp: "confirmed" },
      { name: "Vikram Rao", role: "Firmware Dev", verified: true, faceVerified: false, rsvp: "confirmed" },
      { name: "Divya Menon", role: "Cloud Architect", verified: false, faceVerified: false, rsvp: "declined" },
    ],
    github: {
      totalCommits: 89,
      memberCommits: { "Neha Gupta": 41, "Vikram Rao": 35, "Divya Menon": 13 },
      lastCommit: "2026-02-20 11:30 PM",
      hourlyFrequency: [0, 0, 0, 0, 0, 0, 0, 1, 3, 5, 7, 6, 4, 5, 3, 4, 6, 5, 3, 2, 1, 0, 0, 0],
      postDeadlineFlag: true,
      plagiarismScore: 18,
    },
    round1: { innovation: 7.0, feasibility: 8.0, techDepth: 6.5, clarity: 7.5, impact: 7.8, weighted: 73.6 },
    rank: 12,
    shortlisted: false,
    flagged: true,
    pptUrl: "#",
    resumeKeywords: ["Arduino", "MQTT", "AWS IoT", "Python", "Grafana"],
    sponsors: { starred: [], ndaTriggered: false, recruitmentInterest: false },
    judgeMarks: [{ judge: "Dr. Priya Sharma", note: "Uneven contribution - check" }],
  },
  {
    id: "t4",
    name: "PixelPushers",
    problemStatement: "Accessible Learning Platform",
    domain: "EdTech",
    members: [
      { name: "Amit Verma", role: "Full Stack Dev", verified: true, faceVerified: true, rsvp: "confirmed" },
      { name: "Sneha Iyer", role: "UI Wizard", verified: true, faceVerified: true, rsvp: "confirmed" },
      { name: "Rohan Das", role: "ML Engineer", verified: true, faceVerified: true, rsvp: "confirmed" },
      { name: "Kavya Reddy", role: "DevOps", verified: true, faceVerified: true, rsvp: "confirmed" },
    ],
    github: {
      totalCommits: 210,
      memberCommits: { "Amit Verma": 68, "Sneha Iyer": 52, "Rohan Das": 55, "Kavya Reddy": 35 },
      lastCommit: "2026-02-21 04:10 AM",
      hourlyFrequency: [1, 1, 2, 3, 1, 0, 0, 0, 4, 7, 10, 13, 11, 9, 7, 10, 13, 15, 11, 7, 5, 3, 2, 1],
      postDeadlineFlag: false,
      plagiarismScore: 1,
    },
    round1: { innovation: 8.8, feasibility: 8.5, techDepth: 8.0, clarity: 9.0, impact: 9.2, weighted: 86.8 },
    rank: 2,
    shortlisted: true,
    flagged: false,
    pptUrl: "#",
    resumeKeywords: ["React Native", "Flask", "PostgreSQL", "Docker", "Accessibility"],
    sponsors: { starred: ["TechCorp", "EduGrant"], ndaTriggered: false, recruitmentInterest: true },
    judgeMarks: [{ judge: "Dr. Priya Sharma", note: "Excellent presentation" }, { judge: "Rahul Mehra", note: "Very polished" }],
  },
  {
    id: "t5",
    name: "CodeCrafters",
    problemStatement: "Real-time Plagiarism Detector",
    domain: "AI/ML",
    members: [
      { name: "Tanvi Shah", role: "ML Lead", verified: true, faceVerified: true, rsvp: "confirmed" },
      { name: "Aditya Kulkarni", role: "API Architect", verified: true, faceVerified: true, rsvp: "confirmed" },
      { name: "Ishaan Malik", role: "Frontend Dev", verified: true, faceVerified: false, rsvp: "pending" },
    ],
    github: {
      totalCommits: 156,
      memberCommits: { "Tanvi Shah": 72, "Aditya Kulkarni": 51, "Ishaan Malik": 33 },
      lastCommit: "2026-02-21 01:55 AM",
      hourlyFrequency: [0, 0, 1, 2, 0, 0, 0, 0, 3, 6, 8, 10, 9, 7, 6, 8, 11, 13, 10, 6, 4, 2, 1, 0],
      postDeadlineFlag: false,
      plagiarismScore: 6,
    },
    round1: { innovation: 7.5, feasibility: 8.2, techDepth: 8.8, clarity: 7.0, impact: 7.5, weighted: 78.0 },
    rank: 5,
    shortlisted: true,
    flagged: false,
    pptUrl: "#",
    resumeKeywords: ["NLP", "BERT", "FastAPI", "Vue.js", "Redis"],
    sponsors: { starred: ["InnoVentures"], ndaTriggered: false, recruitmentInterest: false },
    judgeMarks: [{ judge: "Rahul Mehra", note: "Interesting concept, needs polish" }],
  },
];

/* ======================================================================= */
/*  SUB-COMPONENTS                                                          */
/* ======================================================================= */

function Badge({ children, color = "white" }) {
  const colors = {
    green: "bg-[#B4ED57]/15 text-[#B4ED57]",
    red: "bg-red-500/15 text-red-400",
    yellow: "bg-yellow-400/15 text-yellow-400",
    blue: "bg-[#4D58D4]/15 text-[#4D58D4]",
    white: "bg-white/10 text-white/60",
    purple: "bg-purple-400/15 text-purple-400",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[color] || colors.white}`}>
      {children}
    </span>
  );
}

function MiniCommitChart({ data }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-px h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className="w-1 rounded-t-sm bg-[#B4ED57]/60 hover:bg-[#B4ED57] transition-colors"
          style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? 2 : 0 }}
          title={`${i}:00 - ${v} commits`}
        />
      ))}
    </div>
  );
}

function ScoreBar({ label, value, max = 10 }) {
  const pct = (value / max) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-white/50">{label}</span>
        <span className="text-[#B4ED57] font-bold">{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#4D58D4] to-[#B4ED57]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MemberRow({ m, commits }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/5">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4D58D4] to-[#B4ED57] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
        {m.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-xs font-medium truncate">{m.name}</div>
        <div className="text-white/30 text-[10px]">{m.role}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Badge color={m.verified ? "green" : "red"}>{m.verified ? "Verified" : "Unverified"}</Badge>
        <Badge color={m.faceVerified ? "green" : "yellow"}>{m.faceVerified ? "Face OK" : "No Face"}</Badge>
        <Badge color={m.rsvp === "confirmed" ? "green" : m.rsvp === "declined" ? "red" : "yellow"}>
          {m.rsvp === "confirmed" ? "RSVP Yes" : m.rsvp === "declined" ? "RSVP No" : "Pending"}
        </Badge>
      </div>
      {commits !== undefined && (
        <span className="text-[10px] text-white/40 shrink-0 min-w-[50px] text-right" style={{ fontFamily: "'Questrial', sans-serif" }}>
          {commits} commits
        </span>
      )}
    </div>
  );
}

/* ======================================================================= */
/*  EXPANDED TEAM DETAIL                                                    */
/* ======================================================================= */

function TeamDetail({ team, onClose, onToggleShortlist, onToggleFlag }) {
  const t = team;
  const allVerified = t.members.every((m) => m.verified);
  const allFace = t.members.every((m) => m.faceVerified);
  const allRsvp = t.members.every((m) => m.rsvp === "confirmed");

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4D58D4] to-[#B4ED57] flex items-center justify-center text-white font-black text-lg">
            {t.name[0]}
          </div>
          <div>
            <h3 className="text-white font-black text-lg" style={{ fontFamily: "'Questrial', sans-serif" }}>{t.name}</h3>
            <p className="text-white/40 text-xs">{t.domain} &middot; {t.problemStatement}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={t.shortlisted ? "green" : "yellow"}>{t.shortlisted ? "Shortlisted" : "Not Shortlisted"}</Badge>
          {t.flagged && <Badge color="red">Flagged</Badge>}
          <span className="text-white/30 text-xs ml-2 font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>Rank #{t.rank}</span>
          <button onClick={onClose} className="ml-4 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all text-lg">&times;</button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Members */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-bold text-sm" style={{ fontFamily: "'Questrial', sans-serif" }}>
                Members &middot;{" "}
                <span className="text-[#B4ED57] italic" style={{ fontFamily: "'Pixelify Sans', cursive" }}>
                  {t.members.length}
                </span>
              </h4>
              <div className="flex gap-1">
                {allVerified ? <Badge color="green">All Verified</Badge> : <Badge color="yellow">Partial</Badge>}
                {allFace ? <Badge color="green">Face OK</Badge> : <Badge color="yellow">Face Pending</Badge>}
                {allRsvp ? <Badge color="green">All RSVP</Badge> : <Badge color="yellow">RSVP Pending</Badge>}
              </div>
            </div>
            <div className="space-y-2">
              {t.members.map((m, i) => (
                <MemberRow key={i} m={m} commits={t.github.memberCommits[m.name]} />
              ))}
            </div>
          </div>

          {/* Round 1 AI Evaluation */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
            <h4 className="text-white font-bold text-sm mb-4" style={{ fontFamily: "'Questrial', sans-serif" }}>
              Round 1{" "}
              <span className="text-[#4D58D4] italic" style={{ fontFamily: "'Pixelify Sans', cursive" }}>
                AI Evaluation
              </span>
            </h4>
            <div className="space-y-3">
              <ScoreBar label="Innovation" value={t.round1.innovation} />
              <ScoreBar label="Feasibility" value={t.round1.feasibility} />
              <ScoreBar label="Technical Depth" value={t.round1.techDepth} />
              <ScoreBar label="Presentation Clarity" value={t.round1.clarity} />
              <ScoreBar label="Social Impact" value={t.round1.impact} />
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-white/50 text-xs">Weighted Score</span>
                <span className="text-[#B4ED57] font-black text-xl" style={{ fontFamily: "'Questrial', sans-serif" }}>{t.round1.weighted}</span>
              </div>
            </div>
          </div>

          {/* Resume Keywords */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
            <h4 className="text-white font-bold text-sm mb-3" style={{ fontFamily: "'Questrial', sans-serif" }}>Extracted Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {t.resumeKeywords.map((kw, i) => (
                <span key={i} className="text-xs px-3 py-1.5 bg-[#4D58D4]/10 text-[#4D58D4] rounded-xl border border-[#4D58D4]/20 font-medium">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* GitHub Metrics */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
            <h4 className="text-white font-bold text-sm mb-4" style={{ fontFamily: "'Questrial', sans-serif" }}>
              GitHub{" "}
              <span className="text-[#B4ED57] italic" style={{ fontFamily: "'Pixelify Sans', cursive" }}>
                Metrics
              </span>
            </h4>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-[#B4ED57] rounded-xl p-3">
                <div className="text-black text-xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{t.github.totalCommits}</div>
                <div className="text-black/50 text-[10px]">Total Commits</div>
              </div>
              <div className={`rounded-xl p-3 ${t.github.plagiarismScore > 10 ? "bg-red-500/15 border border-red-500/20" : "bg-white/5 border border-white/10"}`}>
                <div className={`text-xl font-black ${t.github.plagiarismScore > 10 ? "text-red-400" : "text-white"}`} style={{ fontFamily: "'Questrial', sans-serif" }}>{t.github.plagiarismScore}%</div>
                <div className="text-white/40 text-[10px]">Plagiarism</div>
              </div>
              <div className={`rounded-xl p-3 ${t.github.postDeadlineFlag ? "bg-red-500/15 border border-red-500/20" : "bg-white/5 border border-white/10"}`}>
                <div className={`text-xl font-black ${t.github.postDeadlineFlag ? "text-red-400" : "text-[#B4ED57]"}`} style={{ fontFamily: "'Questrial', sans-serif" }}>
                  {t.github.postDeadlineFlag ? "YES" : "NO"}
                </div>
                <div className="text-white/40 text-[10px]">Post-Deadline</div>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-white/40 text-[10px] mb-2">Hourly Commit Frequency (24h)</div>
              <MiniCommitChart data={t.github.hourlyFrequency} />
              <div className="flex justify-between text-[8px] text-white/20 mt-1">
                <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>24h</span>
              </div>
            </div>
            <div className="text-white/30 text-[10px] mt-3">Last commit: {t.github.lastCommit}</div>
          </div>

          {/* Sponsor & Judge Engagement */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
            <h4 className="text-white font-bold text-sm mb-4" style={{ fontFamily: "'Questrial', sans-serif" }}>
              Sponsor & Judge{" "}
              <span className="text-purple-400 italic" style={{ fontFamily: "'Pixelify Sans', cursive" }}>
                Engagement
              </span>
            </h4>
            {t.sponsors.starred.length > 0 && (
              <div className="mb-3">
                <div className="text-white/40 text-[10px] mb-1.5">Starred by Sponsors</div>
                <div className="flex gap-1.5">{t.sponsors.starred.map((s, i) => <Badge key={i} color="purple">{s}</Badge>)}</div>
              </div>
            )}
            <div className="flex gap-2 mb-3">
              <Badge color={t.sponsors.recruitmentInterest ? "green" : "white"}>
                {t.sponsors.recruitmentInterest ? "Recruitment Interest" : "No Recruitment Interest"}
              </Badge>
              <Badge color={t.sponsors.ndaTriggered ? "yellow" : "white"}>
                {t.sponsors.ndaTriggered ? "NDA Triggered" : "No NDA"}
              </Badge>
            </div>
            {t.judgeMarks.length > 0 && (
              <div>
                <div className="text-white/40 text-[10px] mb-2">Judge Notes</div>
                <div className="space-y-2">
                  {t.judgeMarks.map((jm, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white/60">
                      <span className="text-[#4D58D4] font-semibold">{jm.judge}:</span> {jm.note}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Controls */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
            <h4 className="text-white font-bold text-sm mb-4" style={{ fontFamily: "'Questrial', sans-serif" }}>Admin Controls</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onToggleShortlist}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  t.shortlisted
                    ? "bg-[#B4ED57] text-black hover:bg-[#c5f278]"
                    : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                }`}
              >
                {t.shortlisted ? "Remove from Shortlist" : "Add to Shortlist"}
              </button>
              <button
                onClick={onToggleFlag}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  t.flagged
                    ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                    : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                }`}
              >
                {t.flagged ? "Unflag Team" : "Flag Suspicious"}
              </button>
              <a href={t.pptUrl} target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all">
                View PPT
              </a>
              <button className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#4D58D4]/20 text-[#4D58D4] border border-[#4D58D4]/30 hover:bg-[#4D58D4]/30 transition-all">
                Send Notification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================================================================= */
/*  TEAM CARD                                                               */
/* ======================================================================= */

function TeamCard({ team, onClick }) {
  const t = team;
  const verifiedCount = t.members.filter((m) => m.verified).length;
  const pct = ((t.github.totalCommits / 210) * 100).toFixed(0);

  return (
    <div
      onClick={onClick}
      className="bg-[#111] border border-white/10 rounded-2xl p-5 hover:border-[#B4ED57]/30 transition-all cursor-pointer group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4D58D4] to-[#B4ED57] flex items-center justify-center text-white font-black text-sm">
            {t.name[0]}
          </div>
          <div>
            <div className="text-white font-bold text-sm" style={{ fontFamily: "'Questrial', sans-serif" }}>{t.name}</div>
            <div className="text-white/30 text-[10px]">{t.domain} &middot; {t.members.length} members</div>
          </div>
        </div>
        <span className={`text-sm font-black ${t.rank <= 3 ? "text-[#B4ED57]" : "text-white/40"}`} style={{ fontFamily: "'Questrial', sans-serif" }}>
          #{t.rank}
        </span>
      </div>

      {/* Problem statement */}
      <p className="text-white/50 text-xs mb-4 truncate">{t.problemStatement}</p>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/5 rounded-xl p-2.5">
          <div className="text-white text-sm font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{t.github.totalCommits}</div>
          <div className="text-white/30 text-[10px]">Commits</div>
        </div>
        <div className="bg-white/5 rounded-xl p-2.5">
          <div className="text-[#B4ED57] text-sm font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{t.round1.weighted}</div>
          <div className="text-white/30 text-[10px]">Score</div>
        </div>
        <div className={`rounded-xl p-2.5 ${t.github.plagiarismScore > 10 ? "bg-red-500/10" : "bg-white/5"}`}>
          <div className={`text-sm font-black ${t.github.plagiarismScore > 10 ? "text-red-400" : "text-white"}`} style={{ fontFamily: "'Questrial', sans-serif" }}>{t.github.plagiarismScore}%</div>
          <div className="text-white/30 text-[10px]">Plagiarism</div>
        </div>
      </div>

      {/* Commit bar */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full bg-[#B4ED57] transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <Badge color={t.shortlisted ? "green" : "white"}>{t.shortlisted ? "Shortlisted" : "Pending"}</Badge>
          {t.flagged && <Badge color="red">Flagged</Badge>}
          {t.github.postDeadlineFlag && <Badge color="red">Late</Badge>}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-white/20 text-[10px]">{verifiedCount}/{t.members.length} verified</span>
          {t.sponsors.starred.length > 0 && (
            <div className="flex gap-1">{t.sponsors.starred.slice(0, 2).map((s, i) => <Badge key={i} color="purple">{s}</Badge>)}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ======================================================================= */
/*  MAIN TEAMS TAB                                                          */
/* ======================================================================= */

export default function TeamsTab() {
  const [teams, setTeams] = useState(TEAMS);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("rank");

  const selectedTeam = teams.find((t) => t.id === selectedId);
  const domains = [...new Set(teams.map((t) => t.domain))];

  let filtered = teams.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.problemStatement.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDomain !== "all" && t.domain !== filterDomain) return false;
    if (filterStatus === "shortlisted" && !t.shortlisted) return false;
    if (filterStatus === "flagged" && !t.flagged) return false;
    if (filterStatus === "pending" && t.shortlisted) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "rank") return a.rank - b.rank;
    if (sortBy === "score") return b.round1.weighted - a.round1.weighted;
    if (sortBy === "commits") return b.github.totalCommits - a.github.totalCommits;
    if (sortBy === "plagiarism") return b.github.plagiarismScore - a.github.plagiarismScore;
    return 0;
  });

  const toggleShortlist = (id) => setTeams((prev) => prev.map((t) => t.id === id ? { ...t, shortlisted: !t.shortlisted } : t));
  const toggleFlag = (id) => setTeams((prev) => prev.map((t) => t.id === id ? { ...t, flagged: !t.flagged } : t));

  const totalTeams = teams.length;
  const shortlisted = teams.filter((t) => t.shortlisted).length;
  const flaggedCount = teams.filter((t) => t.flagged).length;
  const avgScore = (teams.reduce((s, t) => s + t.round1.weighted, 0) / totalTeams).toFixed(1);

  return (
    <div className="space-y-6" style={{ fontFamily: "'Fustat', sans-serif" }}>

      {/* Header */}
      <div>
        <h1 className="text-white text-3xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>
          Team{" "}
          <span className="text-[#B4ED57] italic" style={{ fontFamily: "'Pixelify Sans', cursive" }}>
            Command Center
          </span>
          {selectedTeam && (
            <span className="text-white/50 font-normal text-xl ml-3" style={{ fontFamily: "'Fustat', sans-serif" }}>
              — {selectedTeam.name}
            </span>
          )}
        </h1>
        <p className="text-white/40 text-sm mt-1">Monitor, evaluate & manage all participating teams</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Teams */}
        <div className="bg-[#B4ED57] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-5">
            <svg className="w-7 h-7 text-black/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            <span className="text-black/50 text-xs font-medium">Registered</span>
          </div>
          <div className="text-black text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{totalTeams}</div>
          <div className="text-black/50 text-sm mt-1">Total Teams</div>
        </div>

        {/* Shortlisted */}
        <div className="bg-[#4D58D4] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-5">
            <svg className="w-7 h-7 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01 9 11.01" />
            </svg>
            <span className="text-white/50 text-xs font-medium">{((shortlisted / totalTeams) * 100).toFixed(0)}% Rate</span>
          </div>
          <div className="text-white text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{shortlisted}</div>
          <div className="text-white/50 text-sm mt-1">Shortlisted</div>
        </div>

        {/* Flagged */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-5">
            <svg className="w-7 h-7 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Alerts</span>
          </div>
          <div className="text-red-400 text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{flaggedCount}</div>
          <div className="text-white/40 text-sm mt-1">Flagged</div>
        </div>

        {/* Avg Score */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-5">
            <svg className="w-7 h-7 text-[#4D58D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">AI Score</span>
          </div>
          <div className="text-[#B4ED57] text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{avgScore}</div>
          <div className="text-white/40 text-sm mt-1">Avg Score</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams or problem statements..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#B4ED57]/50 transition-colors"
            />
          </div>
          <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/60 text-sm focus:outline-none">
            <option value="all">All Domains</option>
            {domains.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/60 text-sm focus:outline-none">
            <option value="all">All Status</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="flagged">Flagged</option>
            <option value="pending">Pending</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/60 text-sm focus:outline-none">
            <option value="rank">Sort: Rank</option>
            <option value="score">Sort: Score</option>
            <option value="commits">Sort: Commits</option>
            <option value="plagiarism">Sort: Plagiarism</option>
          </select>
        </div>
      </div>

      {/* Detail or Grid */}
      {selectedTeam ? (
        <TeamDetail
          team={selectedTeam}
          onClose={() => setSelectedId(null)}
          onToggleShortlist={() => toggleShortlist(selectedTeam.id)}
          onToggleFlag={() => toggleFlag(selectedTeam.id)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <TeamCard key={t.id} team={t} onClick={() => setSelectedId(t.id)} />
          ))}
        </div>
      )}
    </div>
  );
}