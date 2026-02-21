import React, { useState } from "react";
import { useApp } from "../context/AppContext";

/* ── Shared input class ─────────────────────────────────────────── */
const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#B4ED57]/50 transition-colors";

/* ── Section wrapper with number + title ─────────────────────────── */
function Section({ number, title, subtitle, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-7 h-7 rounded-lg bg-[#4D58D4]/20 border border-[#4D58D4]/30 flex items-center justify-center text-[#4D58D4] text-xs font-bold shrink-0">
          {number}
        </span>
        <div>
          <h3 className="text-white font-semibold text-sm" style={{ fontFamily: "'Questrial', sans-serif" }}>{title}</h3>
          {subtitle && <p className="text-white/30 text-xs">{subtitle}</p>}
        </div>
      </div>
      <div className="pl-10">{children}</div>
    </div>
  );
}

/* ── Reusable: add-one-at-a-time list ────────────────────────────── */
function DynamicListField({ placeholder, items, setItems, icon = "•" }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    setItems([...items, draft.trim()]);
    setDraft("");
  };
  const remove = (i) => setItems(items.filter((_, idx) => idx !== i));
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          className={inputCls + " flex-1"}
          placeholder={placeholder}
        />
        <button type="button" onClick={add} className="px-4 py-2 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold text-sm rounded-xl transition-colors shrink-0">
          + Add
        </button>
      </div>
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
              <span className="text-[#B4ED57] text-xs font-bold shrink-0">{icon}{i + 1}</span>
              <span className="flex-1 text-white/80 text-sm truncate">{item}</span>
              <button type="button" onClick={() => remove(i)} className="text-white/20 hover:text-red-400 transition-colors text-sm shrink-0">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Domains → Problem Statements (nested) ───────────────────────── */
function DomainsSection({ domains, setDomains }) {
  const [domainDraft, setDomainDraft] = useState("");
  const [psDrafts, setPsDrafts] = useState({}); // { domainIdx: "draft text" }

  const addDomain = () => {
    if (!domainDraft.trim()) return;
    setDomains([...domains, { name: domainDraft.trim(), problems: [] }]);
    setDomainDraft("");
  };
  const removeDomain = (i) => setDomains(domains.filter((_, idx) => idx !== i));

  const addPS = (domainIdx) => {
    const text = (psDrafts[domainIdx] || "").trim();
    if (!text) return;
    const updated = [...domains];
    updated[domainIdx] = { ...updated[domainIdx], problems: [...updated[domainIdx].problems, text] };
    setDomains(updated);
    setPsDrafts({ ...psDrafts, [domainIdx]: "" });
  };
  const removePS = (domainIdx, psIdx) => {
    const updated = [...domains];
    updated[domainIdx] = {
      ...updated[domainIdx],
      problems: updated[domainIdx].problems.filter((_, idx) => idx !== psIdx),
    };
    setDomains(updated);
  };

  return (
    <div>
      {/* Add domain */}
      <label className="text-xs text-white/50 mb-2 block">Step 1 — Add a domain, then add problem statements under it</label>
      <div className="flex gap-2 mb-4">
        <input
          value={domainDraft}
          onChange={(e) => setDomainDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDomain())}
          className={inputCls + " flex-1"}
          placeholder="e.g. AI/ML, Web3, HealthTech …"
        />
        <button type="button" onClick={addDomain} className="px-4 py-2 bg-[#4D58D4] hover:bg-[#5b66e0] text-white font-bold text-sm rounded-xl transition-colors shrink-0">
          + Domain
        </button>
      </div>

      {/* Domain cards with nested PS */}
      {domains.length > 0 && (
        <div className="space-y-4">
          {domains.map((domain, di) => (
            <div key={di} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
              {/* Domain header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#4D58D4]/30 flex items-center justify-center text-[#4D58D4] text-[10px] font-bold">D{di + 1}</span>
                  <span className="text-white font-semibold text-sm" style={{ fontFamily: "'Questrial', sans-serif" }}>{domain.name}</span>
                  <span className="text-white/30 text-xs">({domain.problems.length} PS)</span>
                </div>
                <button type="button" onClick={() => removeDomain(di)} className="text-white/20 hover:text-red-400 transition-colors text-xs">Remove</button>
              </div>

              {/* Add PS under this domain */}
              <div className="flex gap-2 mb-2">
                <input
                  value={psDrafts[di] || ""}
                  onChange={(e) => setPsDrafts({ ...psDrafts, [di]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPS(di))}
                  className={inputCls + " flex-1 !text-xs !p-2.5"}
                  placeholder={`Add problem statement for "${domain.name}"`}
                />
                <button type="button" onClick={() => addPS(di)} className="px-3 py-1.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold text-xs rounded-lg transition-colors shrink-0">
                  + PS
                </button>
              </div>

              {/* Listed problem statements */}
              {domain.problems.length > 0 && (
                <div className="space-y-1.5 mt-2 pl-2 border-l-2 border-[#4D58D4]/20 ml-1">
                  {domain.problems.map((ps, pi) => (
                    <div key={pi} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-white/[0.02]">
                      <span className="text-[#B4ED57] text-[10px] font-bold shrink-0">PS{pi + 1}</span>
                      <span className="flex-1 text-white/70 text-xs">{ps}</span>
                      <button type="button" onClick={() => removePS(di, pi)} className="text-white/20 hover:text-red-400 transition-colors text-[10px] shrink-0">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Timeline: time + event, one at a time ───────────────────────── */
function TimelineListField({ items, setItems }) {
  const [time, setTime] = useState("");
  const [event, setEvent] = useState("");
  const add = () => {
    if (!time.trim() || !event.trim()) return;
    setItems([...items, { time: time.trim(), event: event.trim() }]);
    setTime("");
    setEvent("");
  };
  const remove = (i) => setItems(items.filter((_, idx) => idx !== i));
  return (
    <div>
      <label className="text-xs text-white/50 mb-2 block">Add each event with its scheduled time</label>
      <div className="flex gap-2 mb-3">
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          className={inputCls + " w-36"}
          placeholder="e.g. 10:00 AM"
        />
        <input
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          className={inputCls + " flex-1"}
          placeholder="Event description"
        />
        <button type="button" onClick={add} className="px-4 py-2 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold text-sm rounded-xl transition-colors shrink-0">
          + Add
        </button>
      </div>
      {items.length > 0 && (
        <div className="relative pl-5 border-l-2 border-[#4D58D4]/40 space-y-3 ml-2">
          {items.map((item, i) => (
            <div key={i} className="relative flex items-start gap-3">
              <span className="absolute -left-[21px] top-2 w-3 h-3 rounded-full bg-[#4D58D4] border-2 border-[#111] shrink-0" />
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-3">
                <span className="text-[#B4ED57] text-xs font-bold shrink-0 min-w-[70px]">{item.time}</span>
                <span className="text-white/80 text-sm flex-1 truncate">{item.event}</span>
                <button type="button" onClick={() => remove(i)} className="text-white/20 hover:text-red-400 transition-colors text-sm shrink-0">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Rules: add one at a time ────────────────────────────────────── */
function RulesField({ items, setItems }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    setItems([...items, draft.trim()]);
    setDraft("");
  };
  const remove = (i) => setItems(items.filter((_, idx) => idx !== i));
  return (
    <div>
      <label className="text-xs text-white/50 mb-2 block">Add rules one by one — commit intervals, repo format, T&C, etc.</label>
      <div className="flex gap-2 mb-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          className={inputCls + " flex-1"}
          placeholder="e.g. Commits every 2 hours mandatory"
        />
        <button type="button" onClick={add} className="px-4 py-2 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold text-sm rounded-xl transition-colors shrink-0">
          + Add
        </button>
      </div>
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
              <span className="text-white/40 text-xs font-bold shrink-0">§{i + 1}</span>
              <span className="flex-1 text-white/80 text-sm">{item}</span>
              <button type="button" onClick={() => remove(i)} className="text-white/20 hover:text-red-400 transition-colors text-sm shrink-0">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                         */
/* ═══════════════════════════════════════════════════════════════════ */
export default function AdminHackathonsPage() {
  const { navigateTo, setSelectedHackathon } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);

  /* ── Dynamic list states ── */
  const [sponsors, setSponsors] = useState([]);
  const [domains, setDomains] = useState([]); // [{ name, problems: [] }]
  const [timelineItems, setTimelineItems] = useState([]);
  const [rules, setRules] = useState([]);

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
    poster: null,
    sponsorLogos: null,
    prizePool: "",
    totalTeams: "",
    teamSize: "3",
    totalRemoteTeams: "",
    totalOfflineTeams: "",
    rooms: "",
    labs: "",
    teamsPerRoom: "",
    teamsPerLab: "",
    mapUrl: "",
    ndaRequired: false,
  });

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handlePublish = () => {
    const prepared = { ...form, sponsors, domains, timeline: timelineItems, rules };
    console.log("Publishing hackathon:", prepared);
    setShowCreateForm(false);
  };

  const myHackathons = [
    { id: "h1", name: "HackOS 2025", date: "Oct 12", status: "Completed" },
    { id: "h2", name: "Loc8 2026", date: "Feb 20", status: "Active" },
  ];

  const handleEnterDashboard = (hack) => {
    setSelectedHackathon(hack);
    navigateTo("adminDashboard");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8" style={{ fontFamily: "'Fustat', sans-serif" }}>
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black italic" style={{ fontFamily: "'Questrial', sans-serif" }}>MY HACKATHONS</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-[#B4ED57] text-black font-bold rounded-xl hover:scale-105 transition-transform"
          >
            + Create New Hackathon
          </button>
        </div>

        {/* My hackathons grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myHackathons.map((hack) => (
            <div key={hack.id} className="bg-[#111] border border-white/10 p-6 rounded-2xl hover:border-[#B4ED57]/50 transition-colors">
              <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Questrial', sans-serif" }}>{hack.name}</h3>
              <p className="text-white/40 text-sm mb-6">{hack.date} · {hack.status}</p>
              <button
                onClick={() => handleEnterDashboard(hack)}
                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold transition-colors"
              >
                Manage Hackathon →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════ CREATE FORM MODAL ════════════════════ */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-[#111] border border-white/10 w-full max-w-3xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: "'Questrial', sans-serif" }}>Create Hackathon</h2>
                <p className="text-white/30 text-xs mt-1">Fill in each section. Fields marked * are required.</p>
              </div>
              <button onClick={() => setShowCreateForm(false)} className="text-white/30 hover:text-white text-xl transition-colors">✕</button>
            </div>

            {/* ──────── 1. BASIC INFO ──────── */}
            <Section number={1} title="Basic Information" subtitle="Name, dates, location & description">
              <div className="space-y-4">
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} placeholder="Hackathon Name *" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Start Date *</label>
                    <input value={form.startDate} onChange={(e) => update("startDate", e.target.value)} className={inputCls} type="date" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">End Date *</label>
                    <input value={form.endDate} onChange={(e) => update("endDate", e.target.value)} className={inputCls} type="date" />
                  </div>
                </div>
                <input value={form.location} onChange={(e) => update("location", e.target.value)} className={inputCls} placeholder="Location / Venue Address *" />
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className={inputCls} placeholder="Short description about the hackathon" rows={3} />
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Poster (optional)</label>
                  <input type="file" accept="image/*" onChange={(e) => update("poster", e.target.files[0] || null)} className="w-full text-sm text-white/60" />
                </div>
              </div>
            </Section>

            {/* ──────── 2. TEAMS & PRIZES ──────── */}
            <Section number={2} title="Teams & Prizes" subtitle="Prize pool, team configuration & participation mode">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input value={form.prizePool} onChange={(e) => update("prizePool", e.target.value)} className={inputCls} placeholder="Prize Pool (e.g. ₹1,00,000)" />
                  <input value={form.totalTeams} onChange={(e) => update("totalTeams", e.target.value)} className={inputCls} placeholder="Max teams allowed" type="number" />
                  <select value={form.teamSize} onChange={(e) => update("teamSize", e.target.value)} className={inputCls}>
                    <option value="2">Team Size: 2</option>
                    <option value="3">Team Size: 3</option>
                    <option value="4">Team Size: 4</option>
                    <option value="5">Team Size: 5</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input value={form.totalOfflineTeams} onChange={(e) => update("totalOfflineTeams", e.target.value)} className={inputCls} placeholder="Offline team slots" type="number" />
                  <input value={form.totalRemoteTeams} onChange={(e) => update("totalRemoteTeams", e.target.value)} className={inputCls} placeholder="Remote team slots" type="number" />
                </div>
              </div>
            </Section>

            {/* ──────── 3. VENUE & INFRASTRUCTURE ──────── */}
            <Section number={3} title="Venue & Infrastructure" subtitle="Rooms, labs & seating allocation">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input value={form.rooms} onChange={(e) => update("rooms", e.target.value)} className={inputCls} placeholder="No. of rooms" type="number" />
                  <input value={form.teamsPerRoom} onChange={(e) => update("teamsPerRoom", e.target.value)} className={inputCls} placeholder="Teams per room" type="number" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input value={form.labs} onChange={(e) => update("labs", e.target.value)} className={inputCls} placeholder="No. of labs" type="number" />
                  <input value={form.teamsPerLab} onChange={(e) => update("teamsPerLab", e.target.value)} className={inputCls} placeholder="Teams per lab" type="number" />
                </div>
                <input value={form.mapUrl} onChange={(e) => update("mapUrl", e.target.value)} className={inputCls} placeholder="Venue Map URL (optional)" />
              </div>
            </Section>

            {/* ──────── 4. DOMAINS & PROBLEM STATEMENTS ──────── */}
            <Section number={4} title="Domains & Problem Statements" subtitle="Add domains first, then add problem statements under each">
              <DomainsSection domains={domains} setDomains={setDomains} />
            </Section>

            {/* ──────── 5. SPONSORS ──────── */}
            <Section number={5} title="Sponsors" subtitle="Add each sponsor name & upload logos">
              <DynamicListField placeholder="Enter sponsor name" items={sponsors} setItems={setSponsors} icon="🏢 " />
              <div className="mt-3">
                <label className="text-xs text-white/40 mb-1.5 block">Sponsor Logos (optional)</label>
                <input type="file" accept="image/*" multiple onChange={(e) => update("sponsorLogos", e.target.files)} className="w-full text-sm text-white/60" />
              </div>
            </Section>

            {/* ──────── 6. TIMELINE ──────── */}
            <Section number={6} title="Event Timeline" subtitle="Schedule each event in order — meals, mentor rounds, submissions, etc.">
              <TimelineListField items={timelineItems} setItems={setTimelineItems} />
            </Section>

            {/* ──────── 7. RULES & COMPLIANCE ──────── */}
            <Section number={7} title="Rules & Compliance" subtitle="GitHub commit rules, repo format, terms & conditions">
              <RulesField items={rules} setItems={setRules} />
              <div className="flex items-center gap-3 mt-4 p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                <input
                  type="checkbox"
                  checked={form.ndaRequired}
                  onChange={(e) => update("ndaRequired", e.target.checked)}
                  className="w-4 h-4 accent-[#B4ED57] rounded"
                />
                <span className="text-white/60 text-sm">Require participants to sign an NDA before joining</span>
              </div>
            </Section>

            {/* ──────── ACTIONS ──────── */}
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <button onClick={() => setShowCreateForm(false)} className="flex-1 py-3 border border-white/10 rounded-xl font-bold text-white/60 hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button onClick={handlePublish} className="flex-1 py-3 bg-[#B4ED57] hover:bg-[#c5f278] text-black rounded-xl font-bold transition-colors">
                🚀 Publish Hackathon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}