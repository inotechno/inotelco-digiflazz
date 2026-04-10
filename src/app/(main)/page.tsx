"use client";

import BalanceCard from "@/components/dashboard/BalanceCard";
import ServiceGrid from "@/components/dashboard/ServiceGrid";
import { ChevronRight, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";

export default function Home() {
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user-me"],
    queryFn: async () => {
      const res = await axios.get("/api/user/me");
      return res.data;
    },
  });

  const { data: transactions, isLoading: isTxLoading } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: async () => {
      const res = await axios.get("/api/transactions/history");
      return res.data;
    },
  });

  if (isUserLoading || isTxLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p className="text-sm font-medium">Memuat Dashboard...</p>
      </div>
    );
  }

  const recentTransactions = transactions?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <BalanceCard 
        balance={user?.balance || 0} 
        userName={user?.name || "Pengguna"} 
      />
      
      <ServiceGrid />

      <section>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-sm font-bold text-slate-900">Transaksi Terakhir</h3>
          <Link href="/history" className="text-[11px] font-bold text-primary flex items-center hover:underline">
            Lihat Semua <ChevronRight size={14} />
          </Link>
        </div>

        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="py-10 text-center bg-white rounded-2xl border border-dashed border-slate-200">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Belum Ada Transaksi</p>
            </div>
          ) : (
            recentTransactions.map((tx: any) => (
              <div key={tx.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-500' : 
                    tx.status === 'FAILED' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
                  }`}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-900 leading-tight">{tx.productName}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                      {new Date(tx.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900">{formatRupiah(tx.priceSell)}</p>
                  <span className={`text-[9px] font-black uppercase ${
                    tx.status === 'SUCCESS' ? 'text-emerald-500' : 
                    tx.status === 'FAILED' ? 'text-rose-500' : 'text-amber-500'
                  }`}>{tx.status === 'SUCCESS' ? 'Sukses' : tx.status === 'FAILED' ? 'Gagal' : 'Pending'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative group cursor-pointer">
        <div className="relative z-10">
          <p className="text-xs font-bold text-slate-400 mb-1">Promo Terbatas</p>
          <h3 className="text-lg font-bold mb-4">Diskon Produk Game s/d 20%</h3>
          <button className="text-[11px] font-bold bg-white text-slate-900 px-4 py-2 rounded-lg">
            Cek Sekarang
          </button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-primary/30 transition-all"></div>
      </div>
    </div>
  );
}
