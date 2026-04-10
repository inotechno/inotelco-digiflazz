"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import dayjs from "dayjs";

export default function MutationsPage() {
  const { data: mutations, isLoading } = useQuery({
    queryKey: ["user-mutations"],
    queryFn: async () => {
      const res = await axios.get("/api/user/mutations");
      return res.data;
    },
  });

  return (
    <div className="space-y-6 pb-20 text-slate-900">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 bg-white rounded-full shadow-sm text-slate-400">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-slate-900">Mutasi <span className="text-primary">Saldo</span></h1>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : mutations?.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <Clock size={32} />
            </div>
            <h3 className="font-bold mb-1">Belum ada mutasi</h3>
            <p className="text-slate-400 text-xs text-center">Riwayat perubahan saldomu akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mutations?.map((mutation: any) => (
            <div key={mutation.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  mutation.type === "CREDIT" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                }`}>
                  {mutation.type === "CREDIT" ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight line-clamp-1">{mutation.description}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {dayjs(mutation.createdAt).format("DD MMM YYYY, HH:mm")}
                  </p>
                </div>
              </div>
              <div className="text-right whitespace-nowrap ml-2">
                <p className={`text-sm font-black ${
                  mutation.type === "CREDIT" ? "text-emerald-600" : "text-rose-600"
                }`}>
                  {mutation.type === "CREDIT" ? "+" : "-"} {formatRupiah(mutation.amount)}
                </p>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
                   Saldo: {formatRupiah(mutation.endingBalance)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
