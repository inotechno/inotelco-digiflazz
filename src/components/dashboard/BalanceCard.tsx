import { Plus, ArrowUpRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";

interface BalanceCardProps {
  balance: number;
  userName?: string;
}

export default function BalanceCard({ balance, userName = "Pengguna" }: BalanceCardProps) {
  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-slate-500 font-medium">Selamat datang,</p>
          <h2 className="text-lg font-bold text-slate-900">{userName}</h2>
        </div>
        <div className="bg-primary/10 p-2 rounded-full">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Sisa Saldo</p>
        <h1 className="text-3xl font-extrabold text-slate-900">{formatRupiah(balance)}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <Link href="/deposit" className="flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all">
          <Plus size={18} />
          <span>Isi Saldo</span>
        </Link>
        <Link href="/mutations" className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all">
          <ArrowUpRight size={18} />
          <span>Mutasi</span>
        </Link>
      </div>
    </div>
  );
}
