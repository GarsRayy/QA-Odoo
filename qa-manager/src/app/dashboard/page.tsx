"use client";

import { exportPDF } from "@/lib/export-pdf";
import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Play, 
  FileText, 
  Activity, 
  Zap, 
  ArrowUpRight,
  ExternalLink,
  Camera,
  Video,
  Monitor,
  Trophy,
  ShieldAlert,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [testOutput, setTestOutput] = useState("");
  const [testRuns, setTestRuns] = useState<any[]>([]);
  const [scenarioCount, setScenarioCount] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

  const fetchData = async () => {
    // Fetch test runs
    const { data: runs } = await supabase
      .from('test_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (runs) setTestRuns(runs);

    // Fetch scenarios count
    const { count } = await supabase
      .from('test_scenarios')
      .select('*', { count: 'exact', head: true });
    
    if (count !== null) setScenarioCount(count);
  };

  useEffect(() => {
    fetchData();
    
    const channel = supabase
      .channel('dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'test_runs' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const runTestSuite = async () => {
    setIsRunning(true);
    setTestOutput("🚀 Initializing Engine...\n");
    try {
      const res = await fetch("/api/tests/run", { method: "POST" });
      const data = await res.json();
      setTestOutput(data.output || data.message || "No output received.");
      fetchData(); 
    } catch (err) {
      setTestOutput("❌ Failed to connect to test engine.");
    } finally {
      setIsRunning(false);
    }
  };

  // Stats calculation
  const totalTests = testRuns.length;
  const passedTests = testRuns.filter(r => r.status === 'passed').length;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  const stats = [
    { name: "Live Scenarios", value: scenarioCount.toString(), icon: FileText, color: "from-red-600 to-red-800", shadow: "shadow-red-500/20" },
    { name: "Global Pass Rate", value: `${passRate}%`, icon: Trophy, color: "from-green-500 to-emerald-700", shadow: "shadow-green-500/20" },
    { name: "Total Executions", value: totalTests.toString(), icon: Activity, color: "from-slate-800 to-black", shadow: "shadow-slate-500/20" },
    { name: "Security Score", value: "98%", icon: ShieldAlert, color: "from-orange-500 to-red-600", shadow: "shadow-orange-500/20" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Media Evidence Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-red-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl bg-white rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
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
              <div className="rounded-[2rem] overflow-hidden bg-black border-[12px] border-red-50 shadow-inner ring-1 ring-red-200">
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

      {/* Hero / Command Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full text-red-700 text-[10px] font-black uppercase tracking-widest border border-red-100">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            Real-time Monitoring Active
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-red-950">
            Command <span className="text-red-700 font-serif italic">Center</span>
          </h2>
          <p className="text-red-800/60 font-medium flex items-center gap-2 max-w-2xl">
            Integrated QA orchestration for the Odoo ITERA ecosystem. Orchestrating 14+ Happy Paths and dynamic negative scenarios.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 print:hidden">
          <div className="flex items-center gap-2 p-2 bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm">
             <button onClick={() => window.open('/api/export/csv', '_blank')} className="px-5 py-3 rounded-xl bg-white text-red-900 font-black text-xs hover:bg-red-50 transition-all active:scale-95 shadow-sm">CSV</button>
             <button onClick={() => exportPDF(testRuns)} className="px-5 py-3 rounded-xl bg-white text-red-900 font-black text-xs hover:bg-red-50 transition-all active:scale-95 shadow-sm">PDF</button>
          </div>
          
          <button 
            onClick={runTestSuite}
            disabled={isRunning}
            className={`px-10 py-5 rounded-[1.5rem] bg-red-700 text-white font-black text-sm shadow-2xl shadow-red-900/30 flex items-center gap-3 hover:translate-y-[-4px] transition-all active:scale-95 ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isRunning ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                Engine Running...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current" />
                Launch Full Suite
              </>
            )}
          </button>
        </div>
      </div>

      {/* High-Fidelity Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.name} className="relative group overflow-hidden bg-white p-8 rounded-[2.5rem] shadow-2xl border border-red-50/50 hover:scale-[1.03] transition-all duration-500">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.03] rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="flex flex-col gap-8">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white ${stat.shadow} group-hover:rotate-12 transition-transform duration-500`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-red-900/30 uppercase tracking-[0.25em]">{stat.name}</p>
                <p className="text-5xl font-black text-red-950 tracking-tighter">{stat.value}</p>
              </div>
            </div>
            <div className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-500">
              <ArrowUpRight className="w-6 h-6 text-red-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Terminal & Live Feed Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Terminal Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-xl text-red-950 flex items-center gap-3 italic">
              <Activity className="w-5 h-5 text-red-600" /> Live Execution Stream
            </h3>
            {isRunning && <span className="text-[10px] font-black text-green-600 uppercase tracking-widest animate-pulse">Connection: Secure • Stream: Active</span>}
          </div>
          
          <div className="bg-red-950 rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-red-900/20 group">
            <div className="bg-red-900/40 px-8 py-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="font-mono text-[9px] font-bold text-white/30 uppercase tracking-widest">kernel@itera-qa-engine:~/logs</span>
            </div>
            <div className="p-10 h-[450px] overflow-y-auto font-mono text-sm leading-relaxed text-red-100/70 bg-red-950/30 custom-scrollbar">
              {testOutput ? (
                <pre className="whitespace-pre-wrap animate-in fade-in duration-500">{testOutput}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                  <Zap className="w-16 h-16 animate-pulse" />
                  <p className="font-black uppercase tracking-widest text-xs">Ready for initialization</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Activity Feed */}
        <div className="lg:col-span-4 space-y-8">
           <div className="card-premium p-10 h-full flex flex-col">
              <h3 className="font-black text-xl text-red-950 mb-8 flex items-center gap-3">
                <Clock className="w-5 h-5 text-red-600" /> Recent Forensic
              </h3>
              <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {testRuns.length === 0 ? (
                  <div className="py-20 text-center opacity-20 italic font-medium">No recent activity.</div>
                ) : testRuns.map((run, i) => (
                  <div key={run.id} className="group cursor-pointer flex gap-5 items-start animate-in fade-in slide-in-from-right-4" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${run.status === 'passed' ? 'bg-green-500 text-white' : 'bg-red-600 text-white'}`}>
                      {run.status === 'passed' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 border-b border-red-50 pb-4 group-last:border-none">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-black text-red-950 group-hover:text-red-700 transition-colors line-clamp-1">{run.title}</h4>
                        <span className="text-[10px] font-bold text-red-900/20">{new Date(run.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {run.screenshot_path && (
                          <button onClick={() => setSelectedMedia({ type: 'image', url: run.screenshot_path })} className="text-[9px] font-black uppercase text-red-400 hover:text-red-700 transition-colors flex items-center gap-1">
                            <Camera className="w-3 h-3" /> View Proof
                          </button>
                        )}
                        <span className="text-[9px] font-bold text-red-900/20 uppercase tracking-tighter">{run.test_case_id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/logs" className="mt-8 py-4 bg-red-50 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest text-red-700 hover:bg-red-700 hover:text-white transition-all shadow-sm">
                View Detailed Archives
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
