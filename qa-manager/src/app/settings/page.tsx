"use client";

import { useState } from "react";
import { 
  Settings, 
  Globe, 
  Key, 
  Bell, 
  Monitor, 
  Database,
  Save,
  RefreshCw,
  Trash2,
  ShieldAlert
} from "lucide-react";

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("General Integration");
  const [odooUrl, setOdooUrl] = useState("https://lppm-itera.odoo.com");
  const [apiKey, setApiKey] = useState("***************************");

  const menuItems = [
    { name: "General Integration", icon: Globe },
    { name: "API & Webhooks", icon: Key },
    { name: "Notification Rules", icon: Bell },
    { name: "Display & Preferences", icon: Monitor },
    { name: "Database Maintenance", icon: Database },
  ];

  const [isPurging, setIsPurging] = useState(false);

  const handlePurgeData = async () => {
    if (!confirm("CRITICAL: This will delete ALL test runs, logs, and bug reports. This action cannot be undone. Are you sure?")) {
      return;
    }

    setIsPurging(true);
    try {
      const response = await fetch('/api/system/cleanup', { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
      } else {
        alert("Cleanup failed: " + result.error);
      }
    } catch (error) {
      alert("Error connecting to cleanup API");
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-red-900">System Settings</h2>
          <p className="text-red-800/60 mt-1 font-medium italic">Configure Odoo integration and testing environment.</p>
        </div>
        <button className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-red-900/20 flex items-center gap-2 transition-all active:scale-95">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation / Categories */}
        <div className="space-y-2">
          {menuItems.map(item => (
            <button 
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                activeTab === item.name
                ? "bg-white text-red-900 shadow-xl shadow-red-900/5 border border-red-100" 
                : "text-red-900/40 hover:bg-white/40"
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.name ? "text-red-700" : "text-red-900/20"}`} />
              {item.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          {activeTab === "General Integration" && (
            <>
              <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-red-900/5 p-10">
                <h3 className="text-xl font-black text-red-950 mb-8">Odoo Instance Connection</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-900/40 ml-1">Instance URL</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-red-900/30" />
                      <input 
                        type="text" 
                        value={odooUrl}
                        onChange={(e) => setOdooUrl(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-red-100/50 bg-white/40 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/5 outline-none transition-all text-sm font-bold text-red-950"
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <button className="flex items-center gap-2 text-xs font-black text-red-700 hover:text-red-900 transition-colors uppercase tracking-widest">
                      <RefreshCw className="w-4 h-4" />
                      Test Connection
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-red-900/5 p-10">
                <h3 className="text-xl font-black text-red-950 mb-8">Automation Engine</h3>
                <div className="flex items-center justify-between p-6 rounded-2xl bg-red-50/50 border border-red-100">
                   <div>
                     <p className="text-sm font-black text-red-900">Headless Mode</p>
                     <p className="text-xs text-red-800/40 font-medium italic">Run tests without opening browser window</p>
                   </div>
                   <div className="w-12 h-6 bg-red-700 rounded-full relative p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-md"></div>
                   </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "API & Webhooks" && (
            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-red-900/5 p-10">
              <h3 className="text-xl font-black text-red-950 mb-8">API Authentication</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-900/40 ml-1">API Access Token</label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-red-900/30" />
                    <input 
                      type="password" 
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-red-100/50 bg-white/40 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/5 outline-none transition-all text-sm font-bold text-red-950"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Notification Rules" && (
            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-red-900/5 p-10">
              <h3 className="text-xl font-black text-red-950 mb-8">Notification Settings</h3>
              <div className="space-y-4">
                {["Email on Test Failure", "Slack/Discord Webhook", "Monthly QA Summary"].map(pref => (
                  <div key={pref} className="flex items-center justify-between p-4 rounded-xl hover:bg-red-50 transition-colors">
                    <span className="text-sm font-bold text-red-900">{pref}</span>
                    <div className="w-10 h-5 bg-slate-200 rounded-full relative p-1 cursor-pointer">
                      <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Display & Preferences" && (
            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-red-900/5 p-10 text-center py-20">
              <Monitor className="w-12 h-12 text-red-100 mx-auto mb-4" />
              <h3 className="text-xl font-black text-red-950">UI Customization</h3>
              <p className="text-red-900/40 text-sm mt-2">Display settings are synchronized with your system preferences.</p>
            </div>
          )}

          {activeTab === "Database Maintenance" && (
            <div className="space-y-8">
              <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-red-900/5 p-10">
                <h3 className="text-xl font-black text-red-950 mb-8">Database Status</h3>
                <div className="p-6 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-green-900">Supabase Connection</p>
                    <p className="text-xs text-green-700/60 font-medium">Operational • Latency: 42ms</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-red-100/50 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-[5rem] group-hover:scale-110 transition-transform"></div>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-red-950">Danger Zone</h3>
                    <p className="text-xs text-red-900/40 font-bold uppercase tracking-widest mt-1">System Reset & Cleanup</p>
                  </div>
                </div>

                <div className="p-6 bg-red-50 rounded-3xl border border-red-100 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-red-200 rounded-lg text-red-700">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-red-950">Purge Execution History</h4>
                      <p className="text-xs text-red-900/60 mt-1 leading-relaxed">
                        Aksi ini akan menghapus semua data <b>Test Runs</b>, <b>Bugs</b>, dan <b>Logs</b> lama. 
                        Data Skenario (HP-01, dll) tidak akan dihapus.
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handlePurgeData}
                    disabled={isPurging}
                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-900/20 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isPurging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {isPurging ? "Cleaning Up..." : "Purge All Data Now"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
