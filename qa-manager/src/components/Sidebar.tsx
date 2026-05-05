"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Bug, 
  History, 
  Settings, 
  FlaskConical,
  Zap
} from "lucide-react";
import Image from "next/image";
import logo from "../public/og-icon.png";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Test Scenarios", href: "/test-cases", icon: FlaskConical },
  { name: "Execution Logs", href: "/logs", icon: History },
  { name: "Bug Reports", href: "/bugs", icon: Bug },
  { name: "System Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-red-950 text-white h-screen flex flex-col fixed left-0 top-0 z-50 shadow-2xl border-r border-red-900/50">
      {/* Sidebar Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-32 bg-white/5 blur-3xl pointer-events-none"></div>

      <div className="p-8 flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 bg-white p-2 rounded-2xl flex items-center justify-center shadow-xl shadow-black/20 rotate-3 hover:rotate-0 transition-all duration-500">
           <img src={logo.src} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="font-black text-xl tracking-tight leading-none text-white">QA <span className="text-red-400">CORE</span></h1>
          <p className="text-[10px] text-red-300/60 uppercase tracking-[0.3em] font-bold mt-1">ITERA LPPM</p>
        </div>
      </div>

      <nav className="flex-1 px-6 mt-8 space-y-2 relative z-10">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                isActive 
                ? "bg-[#FAF9F6] text-red-900 shadow-lg shadow-black/20 translate-x-2" 
                : "text-red-100/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-red-700" : "text-red-300/40 group-hover:text-white"}`} />
              <span className="font-bold text-sm tracking-tight">{item.name}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]"></div>}
            </Link>
          );
        })}
      </nav>

      <div className="p-8 relative z-10">
        <div className="bg-gradient-to-br from-red-900/50 to-red-950/50 rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group backdrop-blur-sm">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-red-500/20 rounded-lg">
                <Zap className="w-4 h-4 text-red-400" />
             </div>
             <span className="text-xs font-black uppercase tracking-widest text-red-100/80">Auto-Pilot</span>
          </div>
          <p className="text-[10px] text-red-200/40 leading-relaxed font-bold mb-4">
            Playwright session is active and monitoring Odoo Instance.
          </p>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
