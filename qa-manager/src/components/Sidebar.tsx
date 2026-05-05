"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Bug, 
  History, 
  Settings, 
  FlaskConical,
  Zap,
  FolderKanban,
  BookOpen,
  X,
  ChevronRight
} from "lucide-react";
import logo from "../public/og-icon.png";

const navigation = [
  { name: "Dashboard",      href: "/dashboard",   icon: LayoutDashboard },
  { name: "Test Scenarios", href: "/test-cases",  icon: FlaskConical },
  { name: "User Guide",     href: "/user-guide",  icon: BookOpen },
  { name: "Execution Logs", href: "/logs",        icon: History },
  { name: "Bug Reports",    href: "/bugs",        icon: Bug },
  { name: "Projects",       href: "/projects",    icon: FolderKanban },
  { name: "System Settings",href: "/settings",   icon: Settings },
];

export default function Sidebar({ 
  isOpen, 
  onClose, 
  isCollapsed, 
  onToggleCollapse 
}: { 
  isOpen?: boolean; 
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-[70] bg-red-950 text-white flex flex-col 
      transition-all duration-500 ease-in-out border-r border-red-900/50 shadow-2xl
      lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      ${isCollapsed ? "w-24" : "w-72"}
    `}>
      {/* Desktop Collapse Toggle Button */}
      <button 
        onClick={onToggleCollapse}
        className="hidden lg:flex absolute -right-4 top-10 w-8 h-8 bg-white border-2 border-red-900 text-red-900 rounded-full items-center justify-center shadow-xl z-20 hover:scale-110 transition-all group"
      >
        <ChevronRight className={`w-4 h-4 transition-transform duration-500 ${isCollapsed ? "" : "rotate-180"}`} />
      </button>

      {/* Sidebar Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-32 bg-white/5 blur-3xl pointer-events-none"></div>

      <div className={`p-8 flex items-center justify-between relative z-10 ${isCollapsed ? "justify-center" : ""}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white p-2 rounded-2xl flex items-center justify-center shadow-xl shadow-black/20 rotate-3 shrink-0">
             <img src={logo.src} alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in duration-500">
              <h1 className="font-black text-xl tracking-tight leading-none text-white">QA <span className="text-red-400">CORE</span></h1>
              <p className="text-[10px] text-red-300/60 uppercase tracking-[0.3em] font-bold mt-1 text-nowrap">ITERA LPPM</p>
            </div>
          )}
        </div>
        
        {/* Close Button - Mobile Only */}
        {!isCollapsed && (
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-6 h-6 text-red-300" />
          </button>
        )}
      </div>

      <nav className={`flex-1 px-6 mt-8 space-y-2 relative z-10 overflow-y-auto custom-scrollbar ${isCollapsed ? "px-4" : ""}`}>
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              title={isCollapsed ? item.name : ""}
              className={`group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                isActive 
                ? "bg-[#FAF9F6] text-red-900 shadow-lg shadow-black/20" 
                : "text-red-100/60 hover:bg-white/5 hover:text-white"
              } ${isCollapsed ? "justify-center px-0 w-full" : "translate-x-2"}`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 shrink-0 ${isActive ? "text-red-700" : "text-red-300/40 group-hover:text-white"}`} />
              {!isCollapsed && <span className="font-bold text-sm tracking-tight animate-in slide-in-from-left-2 duration-300">{item.name}</span>}
              {isActive && !isCollapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]"></div>}
            </Link>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="p-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-br from-red-900/50 to-red-950/50 rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group backdrop-blur-sm text-nowrap">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-400/10 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                  <Zap className="w-4 h-4" />
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-red-100/80">Auto-Pilot</span>
            </div>
            <p className="text-[10px] text-red-200/40 leading-relaxed font-bold">
              Playwright session is active.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
