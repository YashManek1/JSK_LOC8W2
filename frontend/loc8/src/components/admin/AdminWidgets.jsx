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
    <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden" style={{ fontFamily: "'Fustat', sans-serif" }}>
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-white font-semibold" style={{ fontFamily: "'Questrial', sans-serif" }}>Participants</h3>
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
                  <span className={`text-sm font-bold ${p.rank <= 3 ? "text-[#B4ED57]" : "text-white/60"}`} style={{ fontFamily: "'Questrial', sans-serif" }}>
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
  /* ── mock users ── */
  const [users, setUsers] = useState([
    { id: "u1", name: "Aarav Mehta", email: "aarav@hackos.admin", role: "Admin", status: "Active", twoFA: true, lastLogin: "21 Feb 2026, 9:12 AM" },
    { id: "u2", name: "Dr. Priya Sharma", email: "priya@judge.hackos.com", role: "Judge", status: "Active", twoFA: true, lastLogin: "21 Feb 2026, 8:45 AM" },
    { id: "u3", name: "Rahul Mehra", email: "rahul@judge.hackos.com", role: "Judge", status: "Active", twoFA: false, lastLogin: "20 Feb 2026, 11:30 PM" },
    { id: "u4", name: "Sneha Kapoor", email: "sneha@mentor.hackos.com", role: "Mentor", status: "Active", twoFA: true, lastLogin: "21 Feb 2026, 7:00 AM" },
    { id: "u5", name: "Vikram Rao", email: "vikram@mentor.hackos.com", role: "Mentor", status: "Suspended", twoFA: false, lastLogin: "18 Feb 2026, 4:15 PM" },
    { id: "u6", name: "Divya Menon", email: "divya@judge.hackos.com", role: "Judge", status: "Active", twoFA: true, lastLogin: "21 Feb 2026, 6:30 AM" },
    { id: "u7", name: "Karan Singh", email: "karan@hackos.admin", role: "Admin", status: "Active", twoFA: true, lastLogin: "21 Feb 2026, 9:00 AM" },
    { id: "u8", name: "Meera Joshi", email: "meera@mentor.hackos.com", role: "Mentor", status: "Active", twoFA: false, lastLogin: "20 Feb 2026, 10:00 PM" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Judge", password: "" });
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState("");

  /* ── derived stats ── */
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const twoFAEnabled = users.filter((u) => u.twoFA).length;
  const suspendedUsers = users.filter((u) => u.status === "Suspended").length;

  /* ── actions ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setUsers((prev) => [
      ...prev,
      {
        id: `u_${Date.now()}`,
        name: form.name,
        email: form.email,
        role: form.role,
        status: "Active",
        twoFA: false,
        lastLogin: "Never",
      },
    ]);
    setForm({ name: "", email: "", role: "Judge", password: "" });
    setShowForm(false);
    showToast(`${form.role} account for ${form.name} created`);
  };

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const next = u.status === "Active" ? "Suspended" : "Active";
        showToast(`${u.name} ${next === "Active" ? "activated" : "suspended"}`, next === "Active" ? "success" : "warn");
        return { ...u, status: next };
      })
    );
  };

  const toggle2FA = (id) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        showToast(`2FA ${!u.twoFA ? "enabled" : "disabled"} for ${u.name}`);
        return { ...u, twoFA: !u.twoFA };
      })
    );
  };

  const resetPassword = (user) => showToast(`Password reset link sent to ${user.email}`);

  const saveRole = (id) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        showToast(`${u.name} role changed to ${editRole}`);
        return { ...u, role: editRole };
      })
    );
    setEditingId(null);
  };

  /* ── filtered list ── */
  let filtered = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRole !== "all" && u.role !== filterRole) return false;
    if (filterStatus !== "all" && u.status !== filterStatus) return false;
    return true;
  });

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#B4ED57]/50 transition-colors";

  const roleBadge = (role) => {
    const m = { Admin: "bg-[#B4ED57]/15 text-[#B4ED57]", Judge: "bg-[#4D58D4]/15 text-[#4D58D4]", Mentor: "bg-purple-400/15 text-purple-400" };
    return m[role] || "bg-white/10 text-white/60";
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Fustat', sans-serif" }}>

      {/* ────────── Header ────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-3xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>
            Credential{" "}
            <span className="text-[#B4ED57] italic" style={{ fontFamily: "'Pixelify Sans', cursive" }}>
              Management
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Manage authentication, roles &amp; permissions for Admins, Mentors &amp; Judges
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold text-sm rounded-xl transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {showForm ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </>
            )}
          </svg>
          {showForm ? "Cancel" : "New Account"}
        </button>
      </div>

      {/* ────────── Stats Cards ────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-[#B4ED57] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-5">
            <svg className="w-7 h-7 text-black/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            <span className="text-black/50 text-xs font-medium">System</span>
          </div>
          <div className="text-black text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{totalUsers}</div>
          <div className="text-black/50 text-sm mt-1">Total Users</div>
        </div>

        {/* Active */}
        <div className="bg-[#4D58D4] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-5">
            <svg className="w-7 h-7 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01 9 11.01" />
            </svg>
            <span className="text-white/50 text-xs font-medium">{((activeUsers / totalUsers) * 100).toFixed(0)}%</span>
          </div>
          <div className="text-white text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{activeUsers}</div>
          <div className="text-white/50 text-sm mt-1">Active</div>
        </div>

        {/* 2FA Enabled */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-5">
            <svg className="w-7 h-7 text-[#B4ED57]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Security</span>
          </div>
          <div className="text-[#B4ED57] text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{twoFAEnabled}</div>
          <div className="text-white/40 text-sm mt-1">2FA Enabled</div>
        </div>

        {/* Suspended */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-5">
            <svg className="w-7 h-7 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Blocked</span>
          </div>
          <div className="text-red-400 text-4xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{suspendedUsers}</div>
          <div className="text-white/40 text-sm mt-1">Suspended</div>
        </div>
      </div>

      {/* ────────── Toast ────────── */}
      {toast && (
        <div
          className={`rounded-2xl px-5 py-3 flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-[#B4ED57]/10 border border-[#B4ED57]/30"
              : "bg-yellow-400/10 border border-yellow-400/30"
          }`}
        >
          <svg
            className={`w-5 h-5 shrink-0 ${toast.type === "success" ? "text-[#B4ED57]" : "text-yellow-400"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <path d="M22 4L12 14.01 9 11.01" />
          </svg>
          <span className={`text-sm font-medium ${toast.type === "success" ? "text-[#B4ED57]" : "text-yellow-400"}`}>
            {toast.msg}
          </span>
        </div>
      )}

      {/* ────────── Create Form ────────── */}
      {showForm && (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold text-sm mb-5" style={{ fontFamily: "'Questrial', sans-serif" }}>
            Create{" "}
            <span className="text-[#4D58D4] italic" style={{ fontFamily: "'Pixelify Sans', cursive" }}>
              New Account
            </span>
          </h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/40 text-xs mb-1.5">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                placeholder="Full name"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
                placeholder="user@hackos.com"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1.5">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className={inputCls}
              >
                <option value="Admin">Admin</option>
                <option value="Judge">Judge</option>
                <option value="Mentor">Mentor</option>
              </select>
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1.5">Temporary Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                placeholder="Temp password"
                className={inputCls}
              />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold text-sm rounded-xl transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 bg-white/5 border border-white/10 text-white/60 font-bold text-sm rounded-xl hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ────────── Filters ────────── */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#B4ED57]/50 transition-colors"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/60 text-sm focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Judge">Judge</option>
            <option value="Mentor">Mentor</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/60 text-sm focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* ────────── Master Table ────────── */}
      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-white font-bold text-sm" style={{ fontFamily: "'Questrial', sans-serif" }}>
            System{" "}
            <span className="text-[#B4ED57] italic" style={{ fontFamily: "'Pixelify Sans', cursive" }}>
              Users
            </span>
            <span className="text-white/30 text-xs font-normal ml-2">({filtered.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[22%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="text-left pl-5 pr-3 py-2.5 text-white/40 text-[10px] font-bold uppercase tracking-wider">User</th>
                <th className="text-left px-3 py-2.5 text-white/40 text-[10px] font-bold uppercase tracking-wider">Role</th>
                <th className="text-left px-3 py-2.5 text-white/40 text-[10px] font-bold uppercase tracking-wider">Status</th>
                <th className="text-left px-3 py-2.5 text-white/40 text-[10px] font-bold uppercase tracking-wider">2FA</th>
                <th className="text-left px-3 py-2.5 text-white/40 text-[10px] font-bold uppercase tracking-wider">Last Login</th>
                <th className="text-right pl-3 pr-5 py-2.5 text-white/40 text-[10px] font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  {/* User */}
                  <td className="pl-5 pr-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4D58D4] to-[#B4ED57] flex items-center justify-center text-white text-xs font-black shrink-0">
                        {u.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white text-sm font-medium truncate">{u.name}</div>
                        <div className="text-white/30 text-[11px] truncate">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-3 py-2.5">
                    {editingId === u.id ? (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Judge">Judge</option>
                          <option value="Mentor">Mentor</option>
                        </select>
                        <button
                          onClick={() => saveRole(u.id)}
                          className="w-6 h-6 rounded-lg bg-[#B4ED57]/20 flex items-center justify-center text-[#B4ED57] hover:bg-[#B4ED57]/30"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(u.id); setEditRole(u.role); }}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${roleBadge(u.role)}`}
                        title="Click to change role"
                      >
                        {u.role}
                      </button>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        u.status === "Active" ? "bg-[#B4ED57]/15 text-[#B4ED57]" : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>

                  {/* 2FA */}
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => toggle2FA(u.id)}
                      className="flex items-center gap-1.5 group/tfa cursor-pointer"
                      title={u.twoFA ? "Click to disable 2FA" : "Click to enable 2FA"}
                    >
                      <div className={`w-8 h-[18px] rounded-full relative transition-colors ${u.twoFA ? "bg-[#B4ED57]/30" : "bg-white/10"}`}>
                        <div
                          className={`absolute top-[2px] w-[14px] h-[14px] rounded-full transition-all ${
                            u.twoFA ? "left-[16px] bg-[#B4ED57]" : "left-[2px] bg-white/40"
                          }`}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${u.twoFA ? "text-[#B4ED57]" : "text-white/30"}`}>
                        {u.twoFA ? "ON" : "OFF"}
                      </span>
                    </button>
                  </td>

                  {/* Last Login */}
                  <td className="px-3 py-2.5">
                    <span className="text-white/40 text-xs">{u.lastLogin}</span>
                  </td>

                  {/* Actions */}
                  <td className="pl-3 pr-5 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Reset Password */}
                      <button
                        onClick={() => resetPassword(u)}
                        className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#4D58D4] hover:border-[#4D58D4]/30 hover:bg-[#4D58D4]/10 transition-all"
                        title="Reset password"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                      </button>

                      {/* Toggle Active/Suspend */}
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                          u.status === "Active"
                            ? "bg-white/5 border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                            : "bg-[#B4ED57]/10 border-[#B4ED57]/20 text-[#B4ED57] hover:bg-[#B4ED57]/20"
                        }`}
                        title={u.status === "Active" ? "Suspend user" : "Activate user"}
                      >
                        {u.status === "Active" ? (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <svg className="w-10 h-10 text-white/10 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="text-white/30 text-sm">No users match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminStatsBar({ hackathon }) {
  const stats = [
    { label: "Total Registered", value: "347", delta: "+12 today" },
    { label: "Checked In", value: "289", delta: "83% rate" },
    { label: "Teams", value: "78", delta: "4.4 avg/team" },
    { label: "Submissions", value: "62", delta: "18% submitted" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" style={{ fontFamily: "'Fustat', sans-serif" }}>
      {stats.map((s) => (
        <div key={s.label} className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#B4ED57] text-xs">{s.delta}</span>
          </div>
          <div className="text-white text-2xl font-black" style={{ fontFamily: "'Questrial', sans-serif" }}>{s.value}</div>
          <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}