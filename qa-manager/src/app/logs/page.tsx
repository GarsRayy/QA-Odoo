"use client";

import { exportPDF } from "@/lib/export-pdf";
import { useState, useEffect } from "react";
import { 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Camera,
  Video,
  Activity,
  History,
  FileText
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Logs() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('test_runs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setLogs(data);
  };

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('logs_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'test_runs' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchesSearch = (l.test_case_id?.toLowerCase().includes(search.toLowerCase())) || 
                          (l.title?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "passed" && l.status === "passed") ||
                         (filterStatus === "failed" && (l.status === "failed" || l.status === "timedOut"));
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Evidence Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-red-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl bg-white rounded-[3rem] overflow-hidden shadow-2xl">
            <button 
              onClick={() => setSelectedMedia(null)}
              className="absolute top-8 right-8 z-10 w-14 h-14 rounded-2xl bg-red-50 text-red-900 flex items-center justify-center font-black hover:bg-red-700 hover:text-white transition-all transform hover:rotate-90"
            >
              ✕
            </button>
            <div className="p-12">
              <h3 className="text-3xl font-black text-red-950 mb-8 flex items-center gap-4 italic">
                {selectedMedia.type === 'video' ? <Video className="w-8 h-8 text-red-700" /> : <Camera className="w-8 h-8 text-red-700" />}
                Execution Forensic Evidence
              </h3>
              <div className="rounded-[2rem] overflow-hidden bg-black border-[12px] border-red-50 shadow-inner">
                {selectedMedia.type === 'image' ? (
                  <img src={selectedMedia.url} alt="Evidence" className="w-full h-auto" />
                ) : (
                  <video src={selectedMedia.url} controls autoPlay className="w-full h-auto" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-red-950">
            Execution <span className="text-red-700 font-serif italic">History</span>
          </h2>
          <p className="text-red-800/60 mt-2 font-medium flex items-center gap-2">
            <History className="w-4 h-4 text-red-400" /> Detailed forensic logs and media documentation.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.open('/api/export/csv', '_blank')}
            className="px-6 py-3 rounded-2xl bg-white border border-red-100 text-red-900 font-black text-xs shadow-xl shadow-red-900/5 hover:bg-red-50 transition-all active:scale-95"
          >
            Export CSV
          </button>
          <button 
            onClick={() => exportPDF(logs)}
            className="px-8 py-3 rounded-2xl bg-red-700 text-white font-black text-xs shadow-xl shadow-red-900/30 hover:bg-red-800 hover:translate-y-[-2px] transition-all active:scale-95 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Generate PDF Report
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-3 rounded-[2.5rem] shadow-2xl shadow-red-900/5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-red-900/30" />
          <input 
            type="text" 
            placeholder="Search by Log ID or Scenario Name..."
            className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-none bg-white/80 focus:bg-white focus:ring-8 focus:ring-red-500/5 transition-all text-sm font-bold text-red-950 placeholder:text-red-900/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex p-1.5 bg-white/60 rounded-[2rem] border border-red-50 shadow-inner gap-1">
          {["all", "passed", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-8 py-3 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                filterStatus === status 
                ? "bg-red-700 text-white shadow-xl shadow-red-900/20" 
                : "text-red-900/40 hover:text-red-900 hover:bg-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(127,29,29,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.3em] text-red-900/30 font-black border-b border-red-50">
                <th className="px-10 py-8">ID</th>
                <th className="px-10 py-8">Scenario Details</th>
                <th className="px-10 py-8 text-center">Stability</th>
                <th className="px-10 py-8 text-center">Documentation</th>
                <th className="px-10 py-8 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-red-50/20 transition-all duration-300 cursor-default">
                  <td className="px-10 py-8">
                     <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center font-black text-xs text-red-900/40 group-hover:bg-red-700 group-hover:text-white transition-all shadow-inner">
                        {log.test_case_id}
                     </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-base font-black text-red-950 group-hover:text-red-700 transition-colors">{log.title}</p>
                    <p className="text-[10px] text-red-900/30 font-black uppercase mt-1 tracking-widest flex items-center gap-2">
                      <Activity className="w-3 h-3" /> Agent: {log.executed_by || 'Playwright Cloud'}
                    </p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex justify-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider ${
                        log.status === "passed" ? "bg-green-50 text-green-700 border border-green-100" : 
                        "bg-red-50 text-red-700 border border-red-100"
                      }`}>
                        {log.status === "passed" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {log.status}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center justify-center gap-3">
                      {log.screenshot_path && (
                        <button 
                          onClick={() => setSelectedMedia({ type: 'image', url: log.screenshot_path })}
                          className="w-11 h-11 rounded-2xl bg-white border border-red-50 text-red-700 flex items-center justify-center hover:bg-red-700 hover:text-white transition-all shadow-sm group-hover:scale-110"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      )}
                      {log.video_path && (
                        <button 
                          onClick={() => setSelectedMedia({ type: 'video', url: log.video_path })}
                          className="w-11 h-11 rounded-2xl bg-red-950 text-white flex items-center justify-center hover:bg-black transition-all shadow-xl group-hover:scale-110"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                      )}
                      {!log.screenshot_path && !log.video_path && <span className="text-[10px] font-black text-red-900/10 uppercase tracking-widest">No Evidence</span>}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <p className="text-sm font-black text-red-950">{new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="text-[10px] font-bold text-red-900/20 uppercase tracking-[0.1em] mt-1 italic">{(log.duration_ms / 1000).toFixed(1)}s Runtime</p>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <FileText className="w-16 h-16 text-red-50 mx-auto mb-4" />
                    <p className="text-red-900/20 font-black uppercase tracking-[0.2em] text-xs">No execution history found in cloud archives.</p>
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
