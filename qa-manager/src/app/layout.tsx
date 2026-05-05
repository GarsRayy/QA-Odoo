import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QA Management System | ITERA",
  description: "Advanced Automated Testing & QA Management for Odoo ERP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-72 min-h-screen bg-slate-50">
            <header className="h-16 bg-white border-b border-border sticky top-0 z-40 px-8 flex items-center justify-between">
              <div className="text-sm text-muted">
                System Overview / <span className="text-foreground font-medium">Dashboard</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold">Garis Rayya Rabbani</span>
                  <span className="text-[10px] text-muted uppercase">QA Engineer</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 border border-border"></div>
              </div>
            </header>
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
