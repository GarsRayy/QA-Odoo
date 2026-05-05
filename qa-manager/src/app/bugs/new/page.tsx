"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Camera, ChevronLeft, Send, Video, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function NewBug() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [failedRuns, setFailedRuns] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState("");
  const [evidence, setEvidence] = useState<{ screenshot?: string, video?: string } | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [testCode, setTestCode] = useState("");

  useEffect(() => {
    const fetchFailedRuns = async () => {
      const { data } = await supabase
        .from('test_runs')
        .select('*')
        .eq('status', 'failed')
        .order('created_at', { ascending: false });
      
      if (data) setFailedRuns(data);
    };
    fetchFailedRuns();
  }, []);

  const handleRunChange = (id: string) => {
    setSelectedRunId(id);
    const run = failedRuns.find(r => r.id === id);
    if (run) {
      setEvidence({ screenshot: run.screenshot_path, video: run.video_path });
      setTestCode(run.test_case_id || '');
      if (!title) setTitle(`[${run.test_case_id}] ${run.title} — Failed`);
    } else {
      setEvidence(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.from('bugs').insert({
        title,
        description,
        severity,
        status: 'Open',
        test_code: testCode || null,
        screenshot_url: evidence?.screenshot || null,
        reported_by: 'Garis Rayya Rabbani',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Failed to submit bug:', error.message);
        alert('Gagal menyimpan bug report: ' + error.message);
      } else {
        router.push("/bugs");
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <Link href="/bugs" className="flex items-center gap-2 text-sm font-bold text-red-700 hover:underline">
        <ChevronLeft className="w-4 h-4" />
        Back to Bug Tracking
      </Link>

      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-red-100 rounded-[1.5rem] flex items-center justify-center text-red-700 shadow-xl shadow-red-900/5">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight text-red-950 uppercase italic">Report <span className="text-red-700">Issue</span></h2>
          <p className="text-red-800/60 mt-1 font-medium">Dokumentasikan bug dengan evidence dari automation run.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-xl border border-white p-10 rounded-[3rem] shadow-2xl shadow-red-900/5 space-y-8">
        {/* Bug Title */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-900/40 ml-2">Bug Title *</label>
          <input 
            required
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., HP-01 Failed to find 'Baru' button in Odoo"
            className="w-full px-8 py-5 rounded-[1.5rem] border border-red-100 bg-white/80 focus:outline-none focus:ring-8 focus:ring-red-500/5 transition-all font-bold text-red-950 placeholder:text-red-900/20 shadow-inner"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-900/40 ml-2">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan detail bug, langkah reproduksi, dan expected vs actual behavior..."
            rows={4}
            className="w-full px-8 py-5 rounded-[1.5rem] border border-red-100 bg-white/80 focus:outline-none focus:ring-8 focus:ring-red-500/5 transition-all font-bold text-red-950 placeholder:text-red-900/20 shadow-inner resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Link Failed Run */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-900/40 ml-2">Link with Failed Test Run</label>
            <div className="relative">
              <select 
                value={selectedRunId}
                onChange={(e) => handleRunChange(e.target.value)}
                className="w-full px-8 py-5 rounded-[1.5rem] border border-red-100 bg-white/80 focus:outline-none focus:ring-8 focus:ring-red-500/5 transition-all font-bold text-red-950 appearance-none shadow-inner"
              >
                <option value="">-- Select Failed Run --</option>
                {failedRuns.map(run => (
                  <option key={run.id} value={run.id}>
                    [{run.test_case_id}] {run.title} — {new Date(run.created_at).toLocaleString()}
                  </option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-red-900/30">
                <LinkIcon className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-900/40 ml-2">Severity Level *</label>
            <select 
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-8 py-5 rounded-[1.5rem] border border-red-100 bg-white/80 focus:outline-none focus:ring-8 focus:ring-red-500/5 transition-all font-bold text-red-950 appearance-none shadow-inner"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Test Code Manual */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-900/40 ml-2">Test Case Code (Manual)</label>
          <input 
            type="text" 
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            placeholder="e.g., HP-01, HP-02"
            className="w-full px-8 py-5 rounded-[1.5rem] border border-red-100 bg-white/80 focus:outline-none focus:ring-8 focus:ring-red-500/5 transition-all font-bold text-red-950 placeholder:text-red-900/20 shadow-inner"
          />
        </div>

        {/* Evidence */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-900/40 ml-2">Auto-Attached Evidence</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evidence ? (
              <>
                <div className="aspect-video bg-black rounded-[2rem] overflow-hidden border-4 border-white shadow-xl group relative">
                  {evidence.screenshot ? (
                    <img src={evidence.screenshot} alt="Evidence" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : <div className="flex items-center justify-center h-full text-white/20 font-black italic">No Screenshot</div>}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-red-950/40 backdrop-blur-sm">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                </div>
                <div className="aspect-video bg-red-950 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl flex items-center justify-center group relative">
                  {evidence.video ? (
                    <Video className="w-12 h-12 text-white/40 group-hover:scale-150 transition-transform duration-500" />
                  ) : <div className="text-white/20 font-black italic">No Video Recorded</div>}
                  <div className="absolute top-4 left-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Automation Recording Attached</div>
                </div>
              </>
            ) : (
              <div className="md:col-span-2 border-4 border-dashed border-red-100 rounded-[2.5rem] p-16 text-center bg-red-50/30">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-900/5">
                  <Camera className="w-8 h-8 text-red-200" />
                </div>
                <p className="text-sm font-black text-red-900/40 uppercase tracking-widest">Pilih failed run di atas untuk attach evidence otomatis.</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-8 flex justify-end gap-6">
           <button type="button" onClick={() => router.back()} className="px-10 py-5 rounded-[1.5rem] font-black text-sm text-red-900/40 hover:bg-red-50 transition-all uppercase tracking-widest">
             Discard
           </button>
           <button 
             type="submit" 
             disabled={loading}
             className={`px-12 py-5 rounded-[1.5rem] font-black text-sm shadow-2xl transition-all flex items-center gap-3 ${loading ? "bg-red-200 text-red-400 cursor-not-allowed" : "bg-red-700 text-white hover:bg-red-800 hover:translate-y-[-4px] shadow-red-900/40"}`}
           >
             {loading ? "Menyimpan..." : <><Send className="w-4 h-4" /> Submit ke Supabase</>}
           </button>
        </div>
      </form>
    </div>
  );
}
