"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":  "Dashboard",
  "/test-cases": "Test Scenarios",
  "/user-guide":  "User Guide Factory",
  "/logs":       "Execution Logs",
  "/bugs":       "Bug Reports",
  "/bugs/new":   "Report New Bug",
  "/projects":   "Project Registry",
  "/settings":   "System Settings",
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pageTitle = PAGE_TITLES[pathname] || "QA Core";

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-red-950/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${isCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-red-50 sticky top-0 z-[50] px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Hamburger Button - Mobile Only */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 rounded-2xl bg-red-50 text-red-700 hover:bg-red-700 hover:text-white transition-all active:scale-90"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex flex-col">
              <div className="text-[10px] text-red-900/40 font-black uppercase tracking-[0.2em] hidden xs:block">QA Management System</div>
              <div className="text-red-950 font-black text-xl tracking-tight leading-none">{pageTitle}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-black text-red-950 leading-none">Garis Rayya</span>
              <span className="text-[9px] text-red-900/40 font-black uppercase tracking-widest mt-1">QA Lead</span>
            </div>
            <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-red-100 to-red-50 border-2 border-white shadow-xl flex items-center justify-center text-red-950 font-black text-xs">
              GR
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
