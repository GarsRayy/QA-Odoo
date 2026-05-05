"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Play,
  Clock,
  ChevronDown,
  ChevronUp,
  Users,
  FileText,
  Shield,
  X,
  Video,
  Code,
  Save,
  Wand2,
  Layers,
  Target,
  FileJson
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TestCases() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [confirmRun, setConfirmRun] = useState<any | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  
  // Form State for Recording
  const [newTestCode, setNewTestCode] = useState("");
  const [newTestName, setNewTestName] = useState("");
  const [newTestCategory, setNewTestCategory] = useState("Happy Path");
  const [newTestDescription, setNewTestDescription] = useState("");
  const [newTestRoles, setNewTestRoles] = useState("");
  const [newTestSteps, setNewTestSteps] = useState("");
  const [newTestExpected, setNewTestExpected] = useState("");
  const [recordedCode, setRecordedCode] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLaunchingRecorder, setIsLaunchingRecorder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/scenarios/seed");
      const data = await res.json();
      if (data.success) {
        alert("✅ " + data.message);
        fetchScenarios();
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to connect to seeding API.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScenarios = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_scenarios')
        .select('*')
        .order('code', { ascending: true });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setScenarios(data);
      } else {
        setScenarios([]);
      }
    } catch (err) {
      console.error('Fetch Scenarios Error:', err);
      setScenarios([]); // Fallback to empty to show the seed button
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLatestResults = async () => {
    const { data, error } = await supabase
      .from('test_runs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      const latest: Record<string, any> = {};
      data.forEach(run => {
        if (!latest[run.test_case_id]) {
          latest[run.test_case_id] = run;
        }
      });
      setTestResults(latest);
    }
  };

  useEffect(() => {
    fetchScenarios();
    fetchLatestResults();

    const resultChannel = supabase
      .channel('testcases_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'test_runs' }, () => {
        fetchLatestResults();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'test_scenarios' }, () => {
        fetchScenarios();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(resultChannel);
    };
  }, []);

  const runTest = async (code: string) => {
    setConfirmRun(null);
    setIsRunning(code);
    try {
      await fetch("/api/tests/run", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grep: code })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(null);
    }
  };

  const handleLaunchRecorder = async () => {
    setIsLaunchingRecorder(true);
    try {
      await fetch("/api/tests/record", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://edu-pusatpengabdianlppm.odoo.com" })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLaunchingRecorder(false);
    }
  };

  const handleSaveTest = async () => {
    if (!newTestCode || !newTestName || !recordedCode) {
      alert("Please fill in Code, Name, and paste the recorded code.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/tests/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newTestCode,
          name: newTestName,
          category: newTestCategory,
          description: newTestDescription,
          roles: newTestRoles.split(',').map(r => r.trim()),
          steps: newTestSteps.split('\n').map(s => s.trim()).filter(s => s),
          expectedResult: newTestExpected,
          content: recordedCode
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsRecordModalOpen(false);
        // Reset form
        setNewTestCode("");
        setNewTestName("");
        setNewTestDescription("");
        setRecordedCode("");
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save test.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCases = scenarios.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || c.code?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || c.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ["All", "Happy Path", "Negative Path", "Financial"];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Run Confirmation Modal */}
      {confirmRun && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto">
            <button onClick={() => setConfirmRun(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-red-50 text-red-900 flex items-center justify-center hover:bg-red-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-red-700" />
              </div>
              <div>
                <h3 className="text-xl font-black text-red-950">{confirmRun.code}: {confirmRun.name}</h3>
                <p className="text-xs text-red-900/40 font-bold uppercase tracking-widest">{confirmRun.category}</p>
              </div>
            </div>
            <p className="text-sm text-red-900/60 mb-6">{confirmRun.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-900/40 mb-3 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> Stakeholders
                </h4>
                <div className="flex flex-wrap gap-2">
                  {confirmRun.roles?.map((role: string) => (
                    <span key={role} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-xl text-[10px] font-black border border-red-100">
                      {role}
                    </span>
                  )) || <span className="text-xs italic text-red-900/30">N/A</span>}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-900/40 mb-3 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" /> Requirement
                </h4>
                <p className="text-xs text-red-900/70 font-medium">{confirmRun.precondition || 'No specific precondition'}</p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-900/40 mb-3">Test Steps Pipeline</h4>
              <div className="space-y-2">
                {confirmRun.steps?.map((step: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-red-900/70 font-medium text-xs">{step}</span>
                  </div>
                )) || <p className="text-xs italic text-red-900/30 text-center py-4">No steps documented.</p>}
              </div>
            </div>

            <div className="mb-10 p-5 bg-green-50 border border-green-100 rounded-3xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-700/60 mb-2">Success Criteria</h4>
              <p className="text-sm text-green-800 font-bold italic">"{confirmRun.expected_result || 'Record processing complete.'}"</p>
            </div>

            <div className="flex justify-end gap-4">
              <button onClick={() => setConfirmRun(null)} className="px-8 py-4 rounded-2xl font-black text-sm text-red-900/40 hover:bg-red-50 transition-all">
                Cancel
              </button>
              <button 
                onClick={() => runTest(confirmRun.code)}
                className="px-10 py-4 rounded-2xl bg-red-700 text-white font-black text-sm shadow-xl shadow-red-900/30 flex items-center gap-3 hover:translate-y-[-2px] transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                Initiate Run
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Record Scenario Modal - REDESIGNED 2-COLUMN */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-red-950/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-8 border-b border-red-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-red-700 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-red-900/20">
                  <Video className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-red-950">QA Studio <span className="text-red-700 font-serif italic text-2xl ml-2">Recorder</span></h3>
                  <p className="text-[10px] text-red-900/40 font-black uppercase tracking-[0.3em] mt-1">AI-Assisted Script Generator</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRecordModalOpen(false)} 
                className="w-14 h-14 rounded-2xl bg-red-50 text-red-900 flex items-center justify-center hover:bg-red-700 hover:text-white transition-all transform hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - 2 Column Grid */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-5 bg-slate-50/30">
              
              {/* Left Column: Metadata & Details */}
              <div className="lg:col-span-2 p-10 overflow-y-auto border-r border-red-50 space-y-8 custom-scrollbar">
                <section className="space-y-6">
                  <h4 className="text-xs font-black text-red-900/30 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Scenario Identity
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-red-900/40 ml-2 uppercase">Scenario ID</label>
                      <input 
                        type="text" 
                        placeholder="e.g. HP-15" 
                        className="w-full px-5 py-4 rounded-2xl bg-white border border-red-100 focus:ring-4 focus:ring-red-500/10 font-bold text-red-950 outline-none transition-all shadow-sm"
                        value={newTestCode}
                        onChange={(e) => setNewTestCode(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-red-900/40 ml-2 uppercase">Category</label>
                      <select 
                        className="w-full px-5 py-4 rounded-2xl bg-white border border-red-100 focus:ring-4 focus:ring-red-500/10 font-bold text-red-950 outline-none transition-all shadow-sm"
                        value={newTestCategory}
                        onChange={(e) => setNewTestCategory(e.target.value)}
                      >
                        {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-red-900/40 ml-2 uppercase">Scenario Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter scenario name..." 
                      className="w-full px-5 py-4 rounded-2xl bg-white border border-red-100 focus:ring-4 focus:ring-red-500/10 font-bold text-red-950 outline-none transition-all shadow-sm"
                      value={newTestName}
                      onChange={(e) => setNewTestName(e.target.value)}
                    />
                  </div>
                </section>

                <section className="space-y-6">
                  <h4 className="text-xs font-black text-red-900/30 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Documentation
                  </h4>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-red-900/40 ml-2 uppercase">Description</label>
                    <textarea 
                      placeholder="What is this test verifying?"
                      className="w-full h-24 px-5 py-4 rounded-2xl bg-white border border-red-100 focus:ring-4 focus:ring-red-500/10 font-medium text-red-900/70 outline-none transition-all shadow-sm resize-none"
                      value={newTestDescription}
                      onChange={(e) => setNewTestDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-red-900/40 ml-2 uppercase">Roles Involved (Comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="Tendik LPPM, Kepala LPPM" 
                      className="w-full px-5 py-4 rounded-2xl bg-white border border-red-100 focus:ring-4 focus:ring-red-500/10 font-bold text-red-950 outline-none transition-all shadow-sm"
                      value={newTestRoles}
                      onChange={(e) => setNewTestRoles(e.target.value)}
                    />
                  </div>
                </section>

                <section className="space-y-6">
                  <h4 className="text-xs font-black text-red-900/30 uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-4 h-4" /> Expectations
                  </h4>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-red-900/40 ml-2 uppercase">Step-by-Step Instructions (One per line)</label>
                    <textarea 
                      placeholder="1. Login as Admin..."
                      className="w-full h-32 px-5 py-4 rounded-2xl bg-white border border-red-100 focus:ring-4 focus:ring-red-500/10 font-medium text-red-900/70 outline-none transition-all shadow-sm resize-none"
                      value={newTestSteps}
                      onChange={(e) => setNewTestSteps(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-red-900/40 ml-2 uppercase">Expected Result</label>
                    <input 
                      type="text" 
                      placeholder="System status changes to..." 
                      className="w-full px-5 py-4 rounded-2xl bg-white border border-red-100 focus:ring-4 focus:ring-red-500/10 font-bold text-red-950 outline-none transition-all shadow-sm"
                      value={newTestExpected}
                      onChange={(e) => setNewTestExpected(e.target.value)}
                    />
                  </div>
                </section>
              </div>

              {/* Right Column: Recorder & Editor */}
              <div className="lg:col-span-3 p-10 flex flex-col gap-8">
                {/* Step 1: Launcher */}
                <div className="bg-red-700 p-8 rounded-[2rem] text-white shadow-xl shadow-red-900/20 flex items-center justify-between group">
                  <div className="flex gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
                      <Wand2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black flex items-center gap-2">Step 1: Capture Actions</h4>
                      <p className="text-red-100/60 text-xs font-medium mt-1">Open a dynamic browser session to record your Odoo workflow.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLaunchRecorder} 
                    disabled={isLaunchingRecorder} 
                    className="px-8 py-4 bg-white text-red-700 rounded-2xl text-sm font-black shadow-lg hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isLaunchingRecorder ? "Initializing..." : "Open Playwright Recorder"}
                  </button>
                </div>

                {/* Step 2: Code Editor */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <h4 className="text-xs font-black text-red-900/40 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Code className="w-4 h-4" /> Step 2: Playwright Script
                    </h4>
                    <span className="text-[9px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded tracking-widest uppercase">Auto-Generate Wrapper</span>
                  </div>
                  <div className="flex-1 bg-red-950 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                    <textarea 
                      className="absolute inset-0 w-full h-full p-8 bg-transparent text-red-200 font-mono text-sm leading-relaxed border-none focus:ring-0 outline-none resize-none custom-scrollbar"
                      placeholder="// Paste code from Playwright Inspector here..."
                      value={recordedCode}
                      onChange={(e) => setRecordedCode(e.target.value)}
                    />
                    <div className="absolute bottom-6 right-6 opacity-40 pointer-events-none group-focus-within:opacity-10 transition-opacity">
                      <FileJson className="w-20 h-20 text-white" />
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex justify-end pt-4 border-t border-red-50">
                  <button 
                    onClick={handleSaveTest} 
                    disabled={isSaving} 
                    className="px-12 py-5 rounded-[1.5rem] bg-red-700 text-white font-black text-lg shadow-2xl shadow-red-900/30 flex items-center gap-3 hover:translate-y-[-4px] transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : (<><Save className="w-6 h-6" /> Save & Build Scenario</>)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main UI Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-red-950">
            QA <span className="text-red-700 italic">Studio</span>
          </h2>
          <p className="text-red-800/60 mt-2 font-medium flex items-center gap-2">
            <Layers className="w-4 h-4" /> Manage and Record Dynamic Test Scenarios
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { console.log('Import Clicked'); handleSeed(); }}
            className="px-8 py-4 rounded-2xl bg-red-600 text-white font-black text-sm shadow-2xl shadow-red-600/40 hover:bg-red-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Import Scenarios (HP-01 to HP-14)
          </button>
          
          <button 
            onClick={() => setIsRecordModalOpen(true)} 
            className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-xl shadow-slate-900/20 flex items-center gap-3 hover:bg-black hover:translate-y-[-2px] transition-all active:scale-95"
          >
            <Play className="w-5 h-5 fill-current text-red-500" /> Record New
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-3 rounded-[2.5rem] shadow-2xl shadow-red-900/5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-red-900/30" />
          <input 
            type="text" 
            placeholder="Search by ID or Title..." 
            className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-none bg-white/80 focus:bg-white focus:ring-8 focus:ring-red-500/5 transition-all text-sm font-bold text-red-950 placeholder:text-red-900/20" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex gap-2 p-1.5 bg-white/60 rounded-[2.2rem] border border-red-50 shadow-inner">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)} 
              className={`px-6 py-3.5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filter === cat ? "bg-red-700 text-white shadow-xl shadow-red-900/20" : "text-red-900/40 hover:text-red-900 hover:bg-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scenarios Table */}
      <div className="bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(127,29,29,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-red-50 text-[10px] font-black uppercase tracking-[0.3em] text-red-900/30">
                <th className="px-10 py-8">Identity</th>
                <th className="px-10 py-8">Scenario Context</th>
                <th className="px-10 py-8">Complexity</th>
                <th className="px-10 py-8 text-center">Stability</th>
                <th className="px-10 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <Clock className="w-12 h-12 text-red-100 animate-spin mx-auto mb-4" />
                    <p className="text-red-200 font-black uppercase tracking-widest text-xs">Syncing with Supabase...</p>
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <Layers className="w-16 h-16 text-red-50 mx-auto mb-6" />
                    <p className="text-red-950 font-black uppercase tracking-widest text-sm mb-4">No scenarios found in Database</p>
                    <button 
                      onClick={handleSeed}
                      className="px-8 py-3 bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-800 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" /> Import HP-01 to HP-14
                    </button>
                  </td>
                </tr>
              ) : filteredCases.map((test) => {
                const result = testResults[test.code];
                const isExpanded = expandedCode === test.code;
                return (
                  <tr key={test.code} className="group hover:bg-red-50/20 transition-all cursor-pointer" onClick={() => setExpandedCode(isExpanded ? null : test.code)}>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${isExpanded ? "bg-red-700 text-white shadow-lg" : "bg-red-50 text-red-900/40"}`}>
                          {test.code}
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-red-700" /> : <ChevronDown className="w-5 h-5 text-red-200 group-hover:text-red-400 transition-colors" />}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        <p className="text-base font-black text-red-950 group-hover:text-red-700 transition-colors">{test.name}</p>
                        <p className="text-xs text-red-900/40 italic font-medium line-clamp-1">{test.description || 'No description provided.'}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {test.roles?.slice(0, 2).map((role: string) => (
                          <span key={role} className="px-2.5 py-1 bg-white border border-red-50 text-red-700 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm">
                            {role}
                          </span>
                        ))}
                        {test.roles?.length > 2 && <span className="text-[9px] font-black text-red-900/20">+{test.roles.length - 2} more</span>}
                        {(!test.roles || test.roles.length === 0) && <span className="text-[9px] font-black text-red-900/10 italic">N/A</span>}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        {isRunning === test.code ? (
                          <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest animate-pulse">
                            <Clock className="w-4 h-4 animate-spin" /> Live...
                          </div>
                        ) : result ? (
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider ${result.status === "passed" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                            {result.status === "passed" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {result.status}
                          </div>
                        ) : (
                          <span className="text-[10px] font-black uppercase text-red-900/10 tracking-widest">Pending Run</span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setConfirmRun(test)} 
                        disabled={!!isRunning} 
                        className="p-4 rounded-[1.25rem] bg-white border border-red-100 shadow-xl shadow-red-900/5 text-red-900 hover:bg-red-700 hover:text-white transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50"
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Logs - Shared Component Style */}
      <div className="pt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-red-950">Execution Timeline</h2>
            <p className="text-red-900/40 mt-1 font-bold text-[10px] uppercase tracking-[0.3em]">Live Feed from Supabase Cloud</p>
          </div>
        </div>

        <div className="bg-red-950 rounded-[3rem] shadow-2xl p-10 border border-white/5">
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-6 custom-scrollbar font-mono">
            {Object.values(testResults).length === 0 ? (
              <div className="py-20 text-center opacity-20">
                <Clock className="w-12 h-12 text-white mx-auto mb-4" />
                <p className="text-white font-black uppercase tracking-widest text-xs">Waiting for first execution...</p>
              </div>
            ) : Object.values(testResults).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((run: any) => (
              <div key={run.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6 hover:bg-white/[0.08] transition-all group">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner ${run.status === "passed" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    {run.test_case_id}
                  </div>
                  <div>
                    <h4 className="text-white font-black text-base group-hover:text-red-400 transition-colors">{run.title}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.1em]">{new Date(run.created_at).toLocaleTimeString('id-ID')}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${run.status === "passed" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{run.status}</span>
                    </div>
                  </div>
                </div>
                {run.screenshot_path && (
                  <div className="flex items-center gap-3">
                    <a 
                      href={run.screenshot_path} 
                      target="_blank" 
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest hover:bg-white/20 hover:text-white transition-all"
                    >
                      <Shield className="w-4 h-4" /> Evidence
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
