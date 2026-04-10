"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, TrendingUp, TrendingDown, User, Clock, Loader2, ListFilter, Search, Filter } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import dayjs from "dayjs";

export default function AdminMutationLogsPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-mutation-logs", search, filterType],
    queryFn: async () => {
      const res = await axios.get("/api/admin/logs/mutations", {
        params: { search, type: filterType }
      });
      return res.data;
    },
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/profile" className="p-2 bg-white rounded-full shadow-sm text-slate-400">
                <ArrowLeft size={20} />
            </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
                type="text"
                placeholder="Cari Nama atau Email User..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary transition-all text-sm font-bold"
            />
        </div>
        <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary text-sm font-bold appearance-none cursor-pointer"
            >
                <option value="">Semua Tipe</option>
                <option value="CREDIT">Masuk (Credit)</option>
                <option value="DEBIT">Keluar (Debit)</option>
            </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="space-y-4">
          {logs?.map((log: any) => (
            <div key={log.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            log.type === "CREDIT" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}>
                            {log.type === "CREDIT" ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-900 leading-none mb-1">
                                {log.user?.name || "User"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                                {log.user?.email}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-sm font-black ${
                            log.type === "CREDIT" ? "text-emerald-600" : "text-rose-600"
                        }`}>
                            {log.type === "CREDIT" ? "+" : "-"} {formatRupiah(log.amount)}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                            {log.type}
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                    <p className="text-[10px] text-slate-600 font-medium italic">
                        "{log.description}"
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
                        <div className="flex gap-4">
                            <div className="space-y-0.5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Awal</p>
                                <p className="text-[10px] font-bold text-slate-500">{formatRupiah(log.beginningBalance)}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Akhir</p>
                                <p className="text-[10px] font-black text-slate-900">{formatRupiah(log.endingBalance)}</p>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">
                            {dayjs(log.createdAt).format("DD/MM HH:mm")}
                        </p>
                    </div>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
