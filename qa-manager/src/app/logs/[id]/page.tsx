"use client";

import { 
  ChevronLeft, 
  Clock, 
  Monitor, 
  Terminal, 
  CheckCircle2, 
  XCircle,
  Eye,
  Download,
  Share2
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ExecutionDetail() {
  const { id } = useParams();

  const steps = [
    { name: "Navigate to Odoo Login", status: "pass", time: "0.2s" },
    { name: "Enter Credentials", status: "pass", time: "1.5s" },
    { name: "Verify Dashboard Loaded", status: "pass", time: "0.8s" },
    { name: "Click 'Kerjasama LPPM' Menu", status: "pass", time: "1.1s" },
    { name: "Fill Partnership Form (HP-01)", status: "pass", time: "3.4s" },
    { name: "Upload Document attachment", status: "fail", time: "0.5s", error: "Timeout: Selector '.o_file_input' not found after 30000ms" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/logs" className="p-3 rounded-2xl bg-white border border-red-100 text-red-900 hover:bg-red-700 hover:text-white transition-all active:scale-95">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black tracking-tight text-red-900">Execution <span className="text-red-600">#{id}</span></h2>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-200">Failed</span>
            </div>
            <p className="text-red-800/60 mt-1 font-medium italic">Scenario: HP-01 - Buat Record Kerjasama Baru</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-4 rounded-2xl bg-white border border-red-100 text-red-900 hover:bg-red-50 transition-all">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-red-900/20 flex items-center gap-2 transition-all">
            <Download className="w-4 h-4" />
            Download Artifacts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Step Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-red-900/5 overflow-hidden">
            <div className="p-8 border-b border-red-900/5 bg-white/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-red-700" />
                <h3 className="font-black text-lg text-red-950">Step-by-Step Logs</h3>
              </div>
              <span className="text-[10px] font-black text-red-900/40 uppercase tracking-[0.2em]">6 Steps Executed</span>
            </div>
            <div className="p-8 space-y-0">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-6 relative group">
                  {idx !== steps.length - 1 && <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-red-900/5 group-hover:bg-red-200 transition-colors"></div>}
                  <div className="relative z-10 pt-1">
                    {step.status === "pass" ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 bg-white rounded-full" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="pb-10 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-black ${step.status === "fail" ? "text-red-700" : "text-red-950"}`}>{step.name}</p>
                      <span className="text-[10px] font-bold text-red-900/20 uppercase tracking-tighter">{step.time}</span>
                    </div>
                    {step.error && (
                      <div className="mt-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                        <p className="text-xs font-mono font-bold text-red-800 leading-relaxed">{step.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info & Screenshot */}
        <div className="space-y-8">
           <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-red-900/5 p-8">
              <h3 className="font-black text-lg text-red-950 mb-6">Last Screenshot</h3>
              <div className="relative aspect-video bg-red-950 rounded-2xl overflow-hidden group border-4 border-white shadow-xl shadow-red-900/10">
                 <div className="absolute inset-0 bg-red-900/20 group-hover:bg-transparent transition-all"></div>
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-4 rounded-full bg-white text-red-900 shadow-2xl transform scale-75 group-hover:scale-100 transition-all">
                      <Eye className="w-6 h-6" />
                    </button>
                 </div>
              </div>
              <div className="mt-6 space-y-4">
                 <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-red-900/40 uppercase tracking-widest">Browser</span>
                    <span className="text-red-950 uppercase">Chromium (Headless)</span>
                 </div>
                 <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-red-900/40 uppercase tracking-widest">Environment</span>
                    <span className="text-red-950 uppercase">Production-Odoo</span>
                 </div>
              </div>
           </div>

           <div className="bg-red-700 p-8 rounded-[2.5rem] shadow-2xl shadow-red-900/20 text-white">
              <div className="flex items-center gap-3 mb-6 opacity-60">
                 <Clock className="w-5 h-5" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Execution Stats</span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <p className="text-2xl font-black italic">6.4s</p>
                    <p className="text-[10px] font-bold uppercase opacity-40 mt-1">Duration</p>
                 </div>
                 <div>
                    <p className="text-2xl font-black italic">83%</p>
                    <p className="text-[10px] font-bold uppercase opacity-40 mt-1">Stability</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
