"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { 
  ArrowLeft, Search, Filter, 
  CheckCircle2, XCircle, Clock, 
  ArrowRightLeft, User, Package, Loader2 
} from "lucide-react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import dayjs from "dayjs";
import { useState } from "react";
import { toast } from "sonner";

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    PENDING: "bg-amber-50 text-amber-600",
    PROCESSING: "bg-blue-50 text-blue-600",
    SUCCESS: "bg-emerald-50 text-emerald-600",
    FAILED: "bg-rose-50 text-rose-600"
  };
  return (
    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${styles[status]}`}>
        {status}
    </span>
  );
};

export default function AdminTransactionsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [syncing, setSyncing] = useState(false);

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ["admin-transactions", search, filterStatus],
    queryFn: async () => {
      const res = await axios.get("/api/admin/transactions", {
        params: { search, status: filterStatus }
      });
      return res.data;
    },
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
        const res = await axios.post("/api/admin/transactions/sync");
        toast.success(res.data.message);
        refetch();
    } catch (err: any) {
        toast.error(err.response?.data?.message || "Gagal sinkronisasi");
    } finally {
        setSyncing(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/profile" className="p-2 bg-white rounded-full shadow-sm text-slate-400">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-black text-slate-900">History <span className="text-primary">Transaksi</span></h1>
        </div>
        
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-50"
        >
          {syncing ? <Loader2 size={12} className="animate-spin" /> : <ArrowRightLeft size={12} />}
          Sinkronisasi Status
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
                type="text"
                placeholder="Cari User, No Tujuan, atau Ref ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary transition-all text-sm font-bold"
            />
        </div>
        <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary text-sm font-bold appearance-none cursor-pointer"
            >
                <option value="">Semua Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Proses</option>
                <option value="SUCCESS">Berhasil</option>
                <option value="FAILED">Gagal</option>
            </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="mt-4 text-[10px] font-black uppercase text-slate-400">Memuat Transaksi...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transactions?.map((trx: any) => (
            <div key={trx.id} className="bg-white p-6 rounded-[2rem] border border-slate-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300">
               <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                             <Package size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-0.5 line-clamp-1">{trx.productName}</p>
                            <p className="text-[10px] text-primary font-bold tracking-tight">{trx.customerNo}</p>
                        </div>
                    </div>
                    <StatusBadge status={trx.status} />
               </div>

                <div className="space-y-4">
                    <div className="bg-slate-50/50 p-4 rounded-2xl space-y-2.5">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">Pelanggan</span>
                            <span className="text-slate-900 font-black flex items-center gap-1.5 uppercase">
                                <User size={10} className="text-slate-300" /> {trx.user?.name}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ref ID</span>
                            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{trx.refId}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-1">
                        <div className="bg-white border border-slate-100 p-2.5 rounded-xl text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Modal</p>
                            <p className="text-[11px] font-bold text-slate-500">{formatRupiah(trx.priceCost)}</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-2.5 rounded-xl text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Jual</p>
                            <p className="text-[11px] font-black text-slate-900">{formatRupiah(trx.priceSell)}</p>
                        </div>
                        <div className="bg-white border border-primary/10 p-2.5 rounded-xl text-center shadow-sm shadow-primary/5">
                            <p className="text-[8px] font-black text-primary uppercase tracking-tighter mb-1 font-black">Laba</p>
                            <p className="text-[11px] font-black text-emerald-600">{formatRupiah(trx.profit)}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 px-1">
                        <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                            <Clock size={10} strokeWidth={3} /> {dayjs(trx.createdAt).format("DD MMM, HH:mm")}
                        </p>
                        {trx.sn && (
                            <div className="px-2.5 py-1 bg-slate-900 text-white rounded-lg font-mono text-[9px] font-bold shadow-lg shadow-slate-200">
                                SN: {trx.sn}
                            </div>
                        )}
                    </div>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
