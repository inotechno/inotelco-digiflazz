"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Shield, Terminal, Clock, User, Loader2, Info, Lock, Settings, Search, Filter } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";

const ActionIcon = ({ action }: { action: string }) => {
  if (action?.includes("LOGIN")) return <Lock className="text-blue-500" size={16} />;
  if (action?.includes("REGISTER")) return <User className="text-emerald-500" size={16} />;
  if (action?.includes("CONFIG")) return <Settings className="text-amber-500" size={16} />;
  return <Info className="text-slate-400" size={16} />;
};

export default function AdminSystemLogsPage() {
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-system-logs", search, filterAction],
    queryFn: async () => {
      const res = await axios.get("/api/admin/logs/system", {
        params: { search, action: filterAction }
      });
      return res.data;
    },
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/profile" className="p-2 bg-white rounded-full shadow-sm text-slate-400">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-slate-900">System <span className="text-primary">Logs</span></h1>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
                type="text"
                placeholder="Cari Pesan atau User..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary transition-all text-sm font-bold"
            />
        </div>
        <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <select 
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary text-sm font-bold appearance-none cursor-pointer"
            >
                <option value="">Semua Aksi</option>
                <option value="LOGIN">Login</option>
                <option value="REGISTER">Register</option>
                <option value="ADMIN_UPDATE_USER">Update User</option>
                <option value="UPDATE_CONFIG">Update Config</option>
                <option value="SYNC_PRODUCTS">Sync Products</option>
            </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-slate-900 text-slate-400 p-2 px-4 rounded-xl text-[10px] font-mono flex items-center gap-2">
            <Terminal size={12} /> monitoring system activities...
          </div>

          {logs?.length === 0 && (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <Terminal size={32} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Belum ada aktivitas</p>
                <p className="text-xs text-slate-400 font-medium">Semua aktivitas sistem akan muncul di sini.</p>
              </div>
            </div>
          )}

          {logs?.map((log: any) => (
            <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                            <ActionIcon action={log.action} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{log.action}</p>
                            <p className="text-[9px] text-slate-400 font-medium">By: {log.user?.name || "System"}</p>
                        </div>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400">
                        {dayjs(log.createdAt).format("DD MMM, HH:mm:ss")}
                    </p>
                </div>

                <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-mono text-slate-600 break-words leading-relaxed">
                        {log.details}
                    </p>
                </div>

                {log.ipAddress && (
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
                        IP: {log.ipAddress}
                    </p>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
