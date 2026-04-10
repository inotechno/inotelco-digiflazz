"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, CheckCircle2, Clock, Wallet, User as UserIcon, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminDepositsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { data: deposits, isLoading } = useQuery({
    queryKey: ["admin-deposits", search, filterStatus],
    queryFn: async () => {
      const res = await axios.get("/api/admin/deposits/list", {
        params: { search, status: filterStatus }
      });
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (depositId: string) => axios.post("/api/admin/deposits/approve", { depositId }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ["admin-deposits"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal menyetujui deposit");
    }
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/profile" className="p-2 bg-white rounded-full shadow-sm text-slate-400">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-slate-900">Konfirmasi <span className="text-primary">Deposit</span></h1>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
                type="text"
                placeholder="Cari User atau Referensi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary transition-all text-sm font-bold"
            />
        </div>
        <div className="relative">
            <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary text-sm font-bold appearance-none cursor-pointer"
            >
                <option value="">Semua Status</option>
                <option value="PENDING">Pending</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
            </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
          <Loader2 className="animate-spin mb-4" size={40} strokeWidth={1} />
          <p className="text-sm font-bold uppercase tracking-widest">Memuat Tiket...</p>
        </div>
      ) : deposits?.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
            <p className="text-slate-400 text-sm font-medium">Belum ada permintaan deposit</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deposits?.map((dep: any) => (
            <div 
              key={dep.id} 
              className={`bg-white p-6 rounded-[2.5rem] border transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] ${
                dep.status === "PENDING" ? "border-primary/20 ring-1 ring-primary/5 shadow-primary/5" : "border-slate-100 opacity-80"
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    dep.status === "PENDING" ? "bg-primary/10 text-primary" : "bg-slate-50 text-slate-400"
                  }`}>
                    <Wallet size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">
                        {dep.user?.name || "User"}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">
                        REF: {dep.reference}
                    </p>
                  </div>
                </div>
                {dep.status === "PENDING" ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-wider">
                    <Clock size={10} className="animate-pulse duration-1000" /> Pending
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-wider">
                    <CheckCircle2 size={10} /> Disetujui
                  </span>
                )}
              </div>

              <div className="bg-slate-50/50 p-5 rounded-2xl mb-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nominal Deposit</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">
                      {formatRupiah(dep.amount)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-2 uppercase tracking-tighter">
                      <Clock size={10} /> {dayjs(dep.createdAt).format("DD MMM YYYY, HH:mm")}
                  </p>
              </div>
                
                {dep.status === "PENDING" && (
                    <button
                        onClick={() => approveMutation.mutate(dep.id)}
                        disabled={approveMutation.isPending}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {approveMutation.isPending ? "Sedang Memproses..." : "Konfirmasi Deposit"}
                    </button>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
