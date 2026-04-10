"use client";

import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
             <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Admin</span>
                <span className="text-slate-200">/</span>
                <span className="text-xs font-bold text-slate-900 capitalize">{pathname.split("/").pop()?.replace("-", " ")}</span>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="text-xs font-black">A</span>
                </div>
             </div>
          </header>
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto pt-16 pb-24 px-4 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
