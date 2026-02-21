import React, { useState } from "react";

export function ParticipantsTable() {
  const participants = [
    { id: 1, name: "Ananya Sharma", team: "404 Found", college: "IIT Bangalore", status: "Checked In", rank: 1 },
    { id: 2, name: "Ravi Kumar", team: "404 Found", college: "IIT Bangalore", status: "Checked In", rank: 2 },
    { id: 3, name: "Sara Patel", team: "NoSQL Gang", college: "BITS Pilani", status: "Checked In", rank: 3 },
    { id: 4, name: "Amit Verma", team: "PixelPushers", college: "NIT Trichy", status: "Pending", rank: 8 },
    { id: 5, name: "Priya Nair", team: "CodeCrafters", college: "VJTI Mumbai", status: "Checked In", rank: 5 },
  ];

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-white font-semibold">Participants</h3>
        <span className="text-white/40 text-sm">{participants.length} registered</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-5 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Team</th>
              <th className="text-left px-5 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">College</th>
              <th className="text-left px-5 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Rank</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-[#B4ED57] to-[#8bc34a] rounded-full flex items-center justify-center text-black text-xs font-bold">
                      {p.name[0]}
                    </div>
                    <span className="text-white text-sm">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-white/60 text-sm">{p.team}</td>
                <td className="px-5 py-3 text-white/60 text-sm">{p.college}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    p.status === "Checked In" ? "bg-[#B4ED57]/10 text-[#B4ED57]" : "bg-yellow-400/10 text-yellow-400"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-sm font-bold ${p.rank <= 3 ? "text-[#B4ED57]" : "text-white/60"}`}>
                    #{p.rank}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CreateJudgeWidget() {
  const [form, setForm] = useState({ name: "", email: "", specialty: "", password: "" });
  const [judges, setJudges] = useState([
    { id: "j1", name: "Dr. Priya Sharma", email: "priya@judge.hackos.com", specialty: "AI/ML" },
    { id: "j2", name: "Rahul Mehra", email: "rahul@judge.hackos.com", specialty: "Web3" },
  ]);
  const [success, setSuccess] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    const newJudge = {
      id: `j_${Date.now()}`,
      name: form.name,
      email: form.email,
      specialty: form.specialty,
    };
    setJudges((prev) => [...prev, newJudge]);
    setForm({ name: "", email: "", specialty: "", password: "" });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const inputCls = "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#B4ED57]/60 transition-colors";

  return (
    <div className="space-y-5">
      {/* Create Form */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Create Judge Credentials</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/40 text-xs mb-1.5">Full Name</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required placeholder="Judge Name" className={inputCls} />
          </div>
          <div>
            <label className="block text-white/40 text-xs mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required placeholder="judge@hackos.com" className={inputCls} />
          </div>
          <div>
            <label className="block text-white/40 text-xs mb-1.5">Specialty</label>
            <input value={form.specialty} onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))} placeholder="AI/ML, Web3, IoT..." className={inputCls} />
          </div>
          <div>
            <label className="block text-white/40 text-xs mb-1.5">Temporary Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required placeholder="Temp password" className={inputCls} />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="px-6 py-2.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold text-sm rounded-xl transition-all">
              + Create Judge Account
            </button>
            {success && <span className="ml-3 text-[#B4ED57] text-sm">✓ Judge created successfully!</span>}
          </div>
        </form>
      </div>

      {/* Judge List */}
      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h3 className="text-white font-semibold">Active Judges ({judges.length})</h3>
        </div>
        <div className="divide-y divide-white/5">
          {judges.map((j) => (
            <div key={j.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-[#4D58D4] to-[#B4ED57] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {j.name[0]}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{j.name}</div>
                  <div className="text-white/40 text-xs">{j.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {j.specialty && (
                  <span className="text-xs px-2 py-1 bg-[#4D58D4]/10 text-[#4D58D4] rounded-full">{j.specialty}</span>
                )}
                <span className="text-xs px-2 py-1 bg-[#B4ED57]/10 text-[#B4ED57] rounded-full">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminStatsBar({ hackathon }) {
  const stats = [
    { label: "Total Registered", value: "347", icon: "👥", delta: "+12 today" },
    { label: "Checked In", value: "289", icon: "✅", delta: "83% rate" },
    { label: "Teams", value: "78", icon: "🏷", delta: "4.4 avg/team" },
    { label: "Submissions", value: "62", icon: "📦", delta: "18% submitted" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl">{s.icon}</span>
            <span className="text-[#B4ED57] text-xs">{s.delta}</span>
          </div>
          <div className="text-white text-2xl font-black">{s.value}</div>
          <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}