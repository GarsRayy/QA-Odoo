"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  Users, 
  Building2, 
  ShieldCheck, 
  UserRound, 
  ChevronRight, 
  Download, 
  FileText,
  Briefcase,
  ExternalLink
} from "lucide-react";

const ROLES = [
  {
    id: "tendik",
    name: "Tendik LPPM",
    icon: <Users className="w-6 h-6" />,
    color: "bg-red-600",
    description: "Panduan administrasi penuh untuk pengelolaan record kerjasama dari awal hingga penutupan.",
    scenarios: ["HP-02", "HP-03", "HP-07", "HP-08", "HP-09", "HP-10", "HP-13"]
  },
  {
    id: "fakultas",
    name: "Fakultas (FTI)",
    icon: <Briefcase className="w-6 h-6" />,
    color: "bg-orange-500",
    description: "Panduan untuk Manajer Fakultas dalam melakukan review, approval, dan penugasan tim.",
    scenarios: ["HP-03", "HP-04", "HP-06"]
  },
  {
    id: "kepala",
    name: "Kepala LPPM",
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "bg-purple-600",
    description: "Panduan validasi akhir dan otorisasi strategis untuk proyek kerjasama skala besar.",
    scenarios: ["HP-06", "HP-14"]
  },
  {
    id: "pelaksana",
    name: "Tim Pelaksana",
    icon: <UserRound className="w-6 h-6" />,
    color: "bg-green-600",
    description: "Panduan teknis bagi ketua dan anggota tim dalam mengelola proposal, RAB, dan deliverables.",
    scenarios: ["HP-05", "HP-11", "HP-12"]
  }
];

export default function UserGuideFactory() {
  const [selectedRole, setSelectedRole] = useState<any>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <div className="relative p-12 bg-red-950 rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-800/20 to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/60 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
              <BookOpen className="w-4 h-4" /> Automated Factory
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight leading-tight">
              User Guide <span className="text-red-500">Factory</span>
            </h1>
            <p className="text-white/40 text-lg font-medium max-w-xl">
              Pilih peran pengguna untuk menghasilkan panduan operasional otomatis berdasarkan skenario pengujian yang telah divalidasi oleh sistem.
            </p>
          </div>
          <div className="w-48 h-48 bg-white/5 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-3xl animate-pulse">
            <FileText className="w-20 h-20 text-white/10" />
          </div>
        </div>
      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role)}
            className={`group p-8 rounded-[2.5rem] border transition-all text-left relative overflow-hidden ${
              selectedRole?.id === role.id 
                ? "bg-white border-red-200 shadow-2xl shadow-red-900/10 -translate-y-2" 
                : "bg-white/40 border-white hover:bg-white hover:shadow-xl hover:-translate-y-1"
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl ${role.color} text-white flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
              {role.icon}
            </div>
            <h3 className="text-xl font-black text-red-950 mb-3">{role.name}</h3>
            <p className="text-xs text-red-900/40 font-bold leading-relaxed line-clamp-3">
              {role.description}
            </p>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-red-900/20">{role.scenarios.length} Steps</span>
              <ChevronRight className={`w-5 h-5 transition-transform ${selectedRole?.id === role.id ? "text-red-700 translate-x-1" : "text-red-100"}`} />
            </div>
          </button>
        ))}
      </div>

      {/* Preview Section */}
      {selectedRole ? (
        <div className="bg-white rounded-[3rem] border border-red-50 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="p-10 border-b border-red-50 bg-red-50/30 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-[1.5rem] ${selectedRole.color} text-white flex items-center justify-center shadow-xl`}>
                {selectedRole.icon}
              </div>
              <div>
                <h2 className="text-3xl font-black text-red-950">Panduan Operasional: {selectedRole.name}</h2>
                <p className="text-red-900/40 text-sm font-bold uppercase tracking-widest mt-1">Generated Based on Verified Automation Suite</p>
              </div>
            </div>
            <button className="flex items-center gap-3 px-8 py-4 bg-red-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-800 transition-all shadow-xl active:scale-95">
              <Download className="w-4 h-4" /> Export PDF Guide
            </button>
          </div>
          
          <div className="p-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-900/30">Workflow Checklist</h4>
                <div className="space-y-4">
                  {selectedRole.scenarios.map((code: string, i: number) => (
                    <div key={code} className="flex items-center gap-5 p-6 bg-red-50/20 rounded-2xl border border-red-50/50 group hover:bg-white hover:shadow-lg transition-all">
                      <div className="w-10 h-10 rounded-xl bg-white border border-red-100 flex items-center justify-center text-red-700 font-black text-xs">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-red-950 font-black text-sm uppercase tracking-tight">{code}</p>
                        <p className="text-[10px] text-red-900/40 font-bold uppercase tracking-widest">Aktivitas Terverifikasi</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-900/30">Visual Evidence (Last Run)</h4>
                <div className="aspect-video bg-red-50 rounded-[2rem] border border-dashed border-red-200 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:bg-white hover:shadow-xl transition-all">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                    <ExternalLink className="w-6 h-6 text-red-300" />
                  </div>
                  <p className="text-red-950 font-black text-base">Klik untuk Lihat Bukti Visual</p>
                  <p className="text-red-900/40 text-xs mt-2 font-bold max-w-xs">
                    Sistem akan mengambil screenshot terbaru dari modul Odoo LPPM untuk panduan visual ini.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-32 text-center space-y-6 opacity-20">
          <BookOpen className="w-20 h-20 text-red-900 mx-auto" />
          <p className="text-red-950 font-black uppercase tracking-[0.5em] text-lg">Silakan Pilih Role</p>
        </div>
      )}
    </div>
  );
}
