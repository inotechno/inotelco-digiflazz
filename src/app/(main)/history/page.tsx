"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Clock, CheckCircle2, XCircle, Search, Loader2 } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "SUCCESS":
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
          <CheckCircle2 size={12} /> Sukses
        </span>
      );
    case "FAILED":
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-wider">
          <XCircle size={12} /> Gagal
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider">
          <Clock size={12} className="animate-pulse" /> Pending
        </span>
      );
  }
};

export default function HistoryPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions-history"],
    queryFn: async () => {
      const res = await axios.get("/api/transactions/history");
      return res.data;
    },
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-slate-900">Riwayat <span className="text-primary">Transaksi</span></h1>
        <button className="p-2 text-slate-400 hover:text-slate-600">
          <Search size={22} strokeWidth={1.5} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
          <Loader2 className="animate-spin mb-4" size={40} strokeWidth={1} />
          <p className="text-sm font-bold uppercase tracking-widest">Memuat Riwayat...</p>
        </div>
      ) : transactions?.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <Clock size={32} />
            </div>
            <h3 className="text-slate-900 font-bold mb-1">Belum ada transaksi</h3>
            <p className="text-slate-400 text-xs">Ayo mulai transaksi pertamamu sekarang!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions?.map((tx: any) => (
            <div 
              key={tx.id} 
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                    <CheckCircle2 size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {tx.product?.name || tx.productId}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                        ID: {tx.customerNo} {isAdmin && `• 👤 ${tx.user?.name || 'User'}`}
                    </p>
                  </div>
                </div>
                <StatusBadge status={tx.status} />
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waktu</p>
                    <p className="text-xs font-bold text-slate-700">
                        {dayjs(tx.createdAt).format("DD MMM YYYY, HH:mm")}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                    <p className="text-sm font-black text-slate-900">
                        {formatRupiah(tx.priceSell || 0)}
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
