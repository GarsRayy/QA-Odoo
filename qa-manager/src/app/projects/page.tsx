"use client";

import { useState, useEffect } from "react";
import {
  FolderKanban,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Pencil,
  X,
  Save,
  ExternalLink,
  Layers,
  Activity,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  Active:   { label: "Active",   color: "bg-green-50 text-green-700 border border-green-100",   dot: "bg-green-500" },
  On_Hold:  { label: "On Hold",  color: "bg-orange-50 text-orange-700 border border-orange-100", dot: "bg-orange-500" },
  Completed:{ label: "Completed",color: "bg-slate-100 text-slate-600 border border-slate-200",   dot: "bg-slate-400" },
};

const emptyForm = { name: "", description: "", status: "Active", odoo_url: "" };

export default function Projects() {
  const [projects, setProjects]       = useState<any[]>([]);
  const [runStats, setRunStats]       = useState<Record<string, { total: number; passed: number; failed: number }>>({});
  const [isLoading, setIsLoading]     = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [form, setForm]               = useState(emptyForm);
  const [isSaving, setIsSaving]       = useState(false);

  // ── Fetch projects ────────────────────────────────────────────────────────
  const fetchProjects = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProjects(data);
    setIsLoading(false);
  };

  // ── Aggregate test_runs stats per project (by name matching odoo_url) ────
  const fetchRunStats = async (projectList: any[]) => {
    const { data: runs } = await supabase
      .from("test_runs")
      .select("test_case_id, status");

    if (!runs) return;

    // Group all runs globally (projects don't have FK to test_runs yet)
    const total  = runs.length;
    const passed = runs.filter((r) => r.status === "passed").length;
    const failed = runs.filter((r) => r.status === "failed" || r.status === "timedOut").length;

    const stats: Record<string, { total: number; passed: number; failed: number }> = {};
    projectList.forEach((p) => { stats[p.id] = { total, passed, failed }; });
    setRunStats(stats);
  };

  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel("projects_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (projects.length > 0) fetchRunStats(projects);
  }, [projects]);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (project: any) => {
    setEditingId(project.id);
    setForm({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "Active",
      odoo_url: project.odoo_url || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Project name is required.");
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        await supabase
          .from("projects")
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq("id", editingId);
      } else {
        await supabase.from("projects").insert([{ ...form }]);
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert("Failed to save project.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    setDeleteId(null);
    fetchProjects();
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">

      {/* ── Delete Confirmation Modal ───────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Trash2 className="w-10 h-10 text-red-700" />
            </div>
            <h3 className="text-2xl font-black text-red-950 mb-4 text-center">Hapus Project?</h3>
            <p className="text-sm text-red-900/60 mb-10 text-center leading-relaxed">
              Aksi ini tidak dapat dibatalkan. Project akan dihapus permanen dari database.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-4 rounded-2xl font-black text-sm text-red-900/40 hover:bg-red-50 transition-all">
                Batal
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-4 rounded-2xl bg-red-700 text-white font-black text-sm shadow-xl hover:bg-red-800 transition-all">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-red-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-8 border-b border-red-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-700 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <FolderKanban className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-red-950">
                    {editingId ? "Edit Project" : "New Project"}
                  </h3>
                  <p className="text-[10px] text-red-900/40 font-black uppercase tracking-widest mt-0.5">
                    ERP Version / Release Tracking
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-12 h-12 rounded-2xl bg-red-50 text-red-900 flex items-center justify-center hover:bg-red-700 hover:text-white transition-all transform hover:rotate-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-red-900/40 ml-1">Project Name *</label>
                <input
                  type="text"
                  placeholder="e.g. LPPM ITERA Odoo 19"
                  className="w-full px-5 py-4 rounded-2xl bg-white border border-red-100 focus:ring-4 focus:ring-red-500/10 font-bold text-red-950 outline-none transition-all shadow-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-red-900/40 ml-1">Description</label>
                <textarea
                  placeholder="Brief description of this project/release..."
                  className="w-full h-24 px-5 py-4 rounded-2xl bg-white border border-red-100 focus:ring-4 focus:ring-red-500/10 font-medium text-red-900/70 outline-none transition-all shadow-sm resize-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-red-900/40 ml-1">Status</label>
                  <select
                    className="w-full px-5 py-4 rounded-2xl bg-white border border-red-100 focus:ring-4 focus:ring-red-500/10 font-bold text-red-950 outline-none transition-all shadow-sm"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="On_Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-red-900/40 ml-1">Odoo Instance URL</label>
                  <input
                    type="text"
                    placeholder="https://lppm-itera.odoo.com"
                    className="w-full px-5 py-4 rounded-2xl bg-white border border-red-100 focus:ring-4 focus:ring-red-500/10 font-bold text-red-950 outline-none transition-all shadow-sm"
                    value={form.odoo_url}
                    onChange={(e) => setForm({ ...form, odoo_url: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-2xl font-black text-sm text-red-900/40 hover:bg-red-50 transition-all">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-10 py-4 rounded-2xl bg-red-700 text-white font-black text-sm shadow-xl shadow-red-900/30 flex items-center gap-3 hover:translate-y-[-2px] transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : editingId ? "Save Changes" : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-red-950">
            Project <span className="text-red-700 font-serif italic">Registry</span>
          </h2>
          <p className="text-red-800/60 mt-2 font-medium flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-red-400" />
            Track Odoo ERP versions and QA release cycles.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-8 py-4 rounded-2xl bg-red-700 text-white font-black text-sm shadow-2xl shadow-red-900/30 flex items-center gap-3 hover:translate-y-[-4px] transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> New Project
        </button>
      </div>

      {/* ── Stats Strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Projects",  value: projects.length,                                              icon: Layers,       color: "from-red-600 to-red-800",    shadow: "shadow-red-500/20" },
          { label: "Active",          value: projects.filter((p) => p.status === "Active").length,          icon: Activity,     color: "from-green-500 to-emerald-700", shadow: "shadow-green-500/20" },
          { label: "Completed",       value: projects.filter((p) => p.status === "Completed").length,       icon: CheckCircle2, color: "from-slate-600 to-slate-800",  shadow: "shadow-slate-400/20" },
        ].map((s) => (
          <div key={s.label} className="relative group bg-white p-8 rounded-[2.5rem] shadow-2xl border border-red-50/50 overflow-hidden hover:scale-[1.03] transition-all duration-500">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.color} opacity-[0.04] rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-700`} />
            <div className="flex flex-col gap-6">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white ${s.shadow} shadow-lg group-hover:rotate-12 transition-transform duration-500`}>
                <s.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-red-900/30 uppercase tracking-[0.25em]">{s.label}</p>
                <p className="text-5xl font-black text-red-950 tracking-tighter">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Projects Grid ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="py-32 text-center">
          <Clock className="w-12 h-12 text-red-100 animate-spin mx-auto mb-4" />
          <p className="text-red-300 font-black uppercase tracking-widest text-xs">Loading from Supabase...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-32 text-center bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[3rem] shadow-xl">
          <FolderKanban className="w-16 h-16 text-red-50 mx-auto mb-6" />
          <p className="text-red-950 font-black uppercase tracking-widest text-sm mb-4">No projects yet</p>
          <button
            onClick={openCreate}
            className="px-8 py-3 bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-red-800 transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.map((project) => {
            const stats   = runStats[project.id];
            const passRate = stats && stats.total > 0
              ? Math.round((stats.passed / stats.total) * 100)
              : null;
            const cfg = statusConfig[project.status] || statusConfig["Active"];

            return (
              <div
                key={project.id}
                className="group relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2.5rem] shadow-[0_16px_48px_-8px_rgba(127,29,29,0.08)] p-8 flex flex-col gap-6 hover:shadow-[0_32px_64px_-12px_rgba(127,29,29,0.15)] hover:translate-y-[-4px] transition-all duration-500"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-900/20 group-hover:rotate-6 transition-transform duration-500">
                    <FolderKanban className="w-7 h-7" />
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />
                    {cfg.label}
                  </span>
                </div>

                {/* Project name & description */}
                <div className="flex-1">
                  <h3 className="text-xl font-black text-red-950 group-hover:text-red-700 transition-colors leading-tight">
                    {project.name}
                  </h3>
                  <p className="text-sm text-red-900/40 mt-2 font-medium leading-relaxed line-clamp-2">
                    {project.description || "No description provided."}
                  </p>
                </div>

                {/* Pass rate bar */}
                {stats && stats.total > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-900/30">Pass Rate</span>
                      <span className="text-sm font-black text-red-950">{passRate}%</span>
                    </div>
                    <div className="h-2 w-full bg-red-50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${passRate}%` }}
                      />
                    </div>
                    <div className="flex gap-4 mt-3">
                      <span className="text-[10px] font-black text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {stats.passed} Passed
                      </span>
                      <span className="text-[10px] font-black text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {stats.failed} Failed
                      </span>
                      <span className="text-[10px] font-black text-red-900/20 ml-auto">
                        {stats.total} total runs
                      </span>
                    </div>
                  </div>
                )}

                {/* Odoo URL */}
                {project.odoo_url && (
                  <a
                    href={project.odoo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[10px] font-black text-red-700 hover:text-red-900 transition-colors uppercase tracking-widest"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Odoo Instance
                  </a>
                )}

                {/* Created at */}
                <p className="text-[9px] text-red-900/20 font-bold uppercase tracking-widest">
                  Created {new Date(project.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </p>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2 border-t border-red-50">
                  <button
                    onClick={() => openEdit(project)}
                    className="flex-1 py-3 rounded-2xl bg-white border border-red-100 text-red-900 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(project.id)}
                    className="w-12 h-12 rounded-2xl bg-white border border-red-100 text-red-200 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
