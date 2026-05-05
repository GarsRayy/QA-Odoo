"use client";

import { useState, useEffect } from "react";
import { 
  AlertCircle, 
  Plus, 
  Search, 
  Bug as BugIcon, 
  CheckCircle2, 
  Trash2, 
  ArrowRight, 
  Camera, 
  Video,
  Activity,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const severityStyles: Record<string, string> = {
  Critical: "bg-red-700 text-white shadow-lg shadow-red-900/40",
  High: "bg-red-500 text-white shadow-md shadow-red-900/20",
  Medium: "bg-orange-500 text-white shadow-md shadow-orange-900/20",
  Low: "bg-slate-500 text-white",
};

const statusStyles: Record<string, string> = {
  Open: "bg-red-50 text-red-700 border border-red-100",
  "In Progress": "bg-orange-50 text-orange-700 border border-orange-100",
  Resolved: "bg-green-50 text-green-700 border border-green-100",
};

const statusOrder = ["Open", "In Progress", "Resolved"];

export default function Bugs() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [bugs, setBugs] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

  const fetchBugs = async () => {
    const { data, error } = await supabase
      .from('bugs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setBugs(data);
  };

  useEffect(() => {
    fetchBugs();

    const channel = supabase
      .channel('bugs_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bugs' }, () => {
        fetchBugs();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const cycleStatus = async (id: string, currentStatus: string) => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    const { error } = await supabase
      .from('bugs')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (!error) fetchBugs();
  };

  const deleteBug = async (id: string) => {
    const { error } = await supabase.from('bugs').delete().eq('id', id);
    if (!error) {
      setDeleteId(null);
      fetchBugs();
    }
  };

  // Live stats
  const criticalCount = bugs.filter(b => b.severity === 'Critical' && b.status !== 'Resolved').length;
  const inProgressCount = bugs.filter(b => b.status === 'In Progress').length;
  const resolvedCount = bugs.filter(b => b.status === 'Resolved').length;

  const filteredBugs = bugs.filter(b => {
    const matchesSearch = b.title?.toLowerCase().includes(search.toLowerCase()) || 
      b.id?.toLowerCase().includes(search.toLowerCase()) ||
      b.test_code?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || b.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-red-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl bg-white rounded-[3rem] overflow-hidden shadow-2xl">
            <button 
              onClick={() => setSelectedMedia(null)}
              className="absolute top-8 right-8 z-10 w-14 h-14 rounded-2xl bg-red-50 text-red-900 flex items-center justify-center font-black hover:bg-red-700 hover:text-white transition-all transform hover:rotate-90"
            >
              ✕
            </button>
            <div className="p-12">
              <h3 className="text-3xl font-black text-red-950 mb-8 flex items-center gap-4 italic">
                <ShieldAlert className="w-8 h-8 text-red-700" /> Bug Forensic Proof
              </h3>
              <div className="rounded-[2rem] overflow-hidden bg-black border-[12px] border-red-50 shadow-inner">
                <img src={selectedMedia.url} alt="Bug Evidence" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Trash2 className="w-10 h-10 text-red-700" />
            </div>
            <h3 className="text-2xl font-black text-red-950 mb-4 text-center">Hapus Bug Report?</h3>
            <p className="text-sm text-red-900/60 mb-10 text-center leading-relaxed">Aksi ini tidak dapat dibatalkan. Data bug akan dihapus permanen dari cloud database.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-4 rounded-2xl font-black text-sm text-red-900/40 hover:bg-red-50 transition-all">
                Batal
              </button>
              <button onClick={() => deleteBug(deleteId)} className="flex-1 py-4 rounded-2xl bg-red-700 text-white font-black text-sm shadow-xl hover:bg-red-800 transition-all">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-red-950">
            Bug <span className="text-red-700 font-serif italic">Tracking</span>
          </h2>
          <p className="text-red-800/60 mt-2 font-medium flex items-center gap-2">
            <BugIcon className="w-4 h-4 text-red-400" /> Defect management and resolution workflow.
          </p>
        </div>
        <Link href="/bugs/new" className="px-8 py-4 rounded-2xl bg-red-700 text-white font-black text-sm shadow-2xl shadow-red-900/30 flex items-center gap-3 hover:translate-y-[-4px] transition-all active:scale-95">
          <Plus className="w-5 h-5" /> Report New Bug
        </Link>
      </div>

      {/* High-Fidelity Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="relative group bg-red-700 p-10 rounded-[2.5rem] shadow-2xl shadow-red-900/30 text-white hover:scale-[1.03] transition-all duration-500 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="flex items-center gap-4 opacity-80 mb-8">
            <AlertCircle className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Critical Issues</span>
          </div>
          <p className="text-6xl font-black tracking-tighter">{criticalCount.toString().padStart(2, '0')}</p>
          <div className="mt-8 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
             <div className="h-full bg-white transition-all duration-1000" style={{ width: `${(criticalCount / (bugs.length || 1)) * 100}%` }}></div>
          </div>
        </div>

        <div className="card-premium p-10 flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-4 text-red-900/30 mb-8">
              <Activity className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">In Progress</span>
            </div>
            <p className="text-6xl font-black text-red-950 tracking-tighter">{inProgressCount.toString().padStart(2, '0')}</p>
          </div>
          <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-widest">
             <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> Active Investigation
          </div>
        </div>

        <div className="card-premium p-10 flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-4 text-red-900/30 mb-8">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Resolved</span>
            </div>
            <p className="text-6xl font-black text-green-700 tracking-tighter">{resolvedCount.toString().padStart(2, '0')}</p>
          </div>
          <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest">
             <span className="w-2 h-2 rounded-full bg-green-500"></span> Quality Restored
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-3 rounded-[2.5rem] shadow-2xl shadow-red-900/5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-red-900/30" />
          <input 
            type="text" 
            placeholder="Search by ID, Title, or Test Case..."
            className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-none bg-white/80 focus:bg-white focus:ring-8 focus:ring-red-500/5 transition-all text-sm font-bold text-red-950 placeholder:text-red-900/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 p-1.5 bg-white/60 rounded-[2rem] border border-red-50 shadow-inner">
          {["All", "Open", "In Progress", "Resolved"].map(s => (
            <button 
              key={s}
              onClick={() => setFilter(s)}
              className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                filter === s ? "bg-red-700 text-white shadow-xl shadow-red-900/20" : "text-red-900/40 hover:text-red-900 hover:bg-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bug Table */}
      <div className="bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(127,29,29,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.3em] text-red-900/30 font-black border-b border-red-50">
                <th className="px-10 py-8">Issue ID</th>
                <th className="px-10 py-8">Defect Details</th>
                <th className="px-10 py-8 text-center">Priority</th>
                <th className="px-10 py-8 text-center">Forensic</th>
                <th className="px-10 py-8">Status</th>
                <th className="px-10 py-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-50">
              {filteredBugs.map((bug) => (
                <tr key={bug.id} className="group hover:bg-red-50/20 transition-all duration-300">
                  <td className="px-10 py-8">
                     <span className="font-mono text-xs font-black text-red-900/30 group-hover:text-red-700 transition-colors tracking-tighter">
                       {bug.id.slice(0, 8).toUpperCase()}
                     </span>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-base font-black text-red-950 group-hover:text-red-700 transition-colors">{bug.title}</p>
                    <p className="text-xs text-red-900/40 line-clamp-1 mt-1 font-medium italic">{bug.description || 'No detailed description.'}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex justify-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] ${severityStyles[bug.severity] || 'bg-slate-200 text-slate-600'}`}>
                        {bug.severity}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex justify-center">
                      {bug.screenshot_url ? (
                        <button 
                          onClick={() => setSelectedMedia({ type: 'image', url: bug.screenshot_url })}
                          className="w-11 h-11 rounded-2xl bg-white border border-red-50 text-red-700 flex items-center justify-center hover:bg-red-700 hover:text-white transition-all shadow-sm group-hover:scale-110"
                        >
                          <Camera className="w-5 h-5" />
                        </button>
                      ) : <span className="text-red-900/10 text-[10px] font-black uppercase tracking-widest italic">None</span>}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <button
                      onClick={() => cycleStatus(bug.id, bug.status)}
                      className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:opacity-80 transition-all shadow-sm ${statusStyles[bug.status] || 'bg-slate-100 text-slate-600'}`}
                      title="Click to cycle status"
                    >
                      {bug.status}
                    </button>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button
                      onClick={() => setDeleteId(bug.id)}
                      className="w-10 h-10 rounded-xl text-red-100 hover:text-red-700 hover:bg-red-50 transition-all flex items-center justify-center mx-auto lg:ml-auto lg:mr-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBugs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <ShieldAlert className="w-16 h-16 text-red-50 mx-auto mb-4" />
                    <p className="text-red-900/20 font-black uppercase tracking-[0.2em] text-xs">No active defects found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
