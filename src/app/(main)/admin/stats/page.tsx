"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { 
  BarChart3, Wallet, Users, ShoppingBag, 
  ArrowUpRight, ArrowDownRight, RefreshCcw, 
  ShieldCheck, AlertCircle, TrendingUp, Info,
  Package, Activity
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";
import dayjs from "dayjs";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/stats");
      return res.data;
    },
  });

  const { data: dfBalance, isLoading: balanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ["admin-df-balance"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/digiflazz/balance");
      return res.data;
    },
  });

  const StatCard = ({ title, value, titleToday, todayValue, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
      <div className="flex justify-between items-start relative z-10">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-opacity-90`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="mt-8 relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
      </div>
      
      {titleToday && (
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between relative z-10">
              <span className="text-[9px] font-bold text-slate-400 uppercase">{titleToday}</span>
              <div className="flex items-center gap-1">
                  <ArrowUpRight size={10} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-slate-700">{todayValue}</span>
              </div>
          </div>
      )}

      <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${color} rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700`}></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-end">
        <div>
           <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Executive Overview</p>
           <h1 className="text-2xl font-black text-slate-900">Dashboard <span className="text-primary">Eksklusif</span></h1>
        </div>
        <button 
          onClick={() => { refetchStats(); refetchBalance(); }}
          className="p-3 bg-white text-slate-400 rounded-2xl border border-slate-100 shadow-sm hover:text-primary transition-colors"
        >
          <RefreshCcw size={20} className={statsLoading || balanceLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Penjualan" 
          value={formatRupiah(stats?.allTime?.sales || 0)} 
          titleToday="Hari Ini"
          todayValue={formatRupiah(stats?.today?.sales || 0)}
          icon={ShoppingBag} 
          color="bg-blue-500" 
        />
         <StatCard 
          title="Perputaran Modal" 
          value={formatRupiah(stats?.allTime?.modal || 0)} 
          titleToday="Hari Ini"
          todayValue={formatRupiah(stats?.today?.modal || 0)}
          icon={Activity} 
          color="bg-slate-500" 
        />
        <StatCard 
          title="Laba Bersih" 
          value={formatRupiah(stats?.allTime?.profit || 0)} 
          titleToday="Hari Ini"
          todayValue={formatRupiah(stats?.today?.profit || 0)}
          icon={TrendingUp} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Total User PPOB" 
          value={stats?.totalUsers || 0} 
          titleToday="Saldo Mengendap"
          todayValue={formatRupiah(stats?.totalUserBalance || 0)}
          icon={Users} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Products & Digiflazz Column */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Top Products Performance */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Top Produk Rekomendasi</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Produk dengan laba tertinggi</p>
                    </div>
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <TrendingUp size={20} />
                    </div>
                </div>

                <div className="space-y-6">
                    {stats?.topProducts?.length === 0 ? (
                        <div className="py-10 text-center border-2 border-dashed border-slate-50 rounded-3xl">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Belum ada data laba tercatat</p>
                        </div>
                    ) : (
                        stats?.topProducts?.map((item: any, i: number) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-end px-1">
                                    <span className="text-[11px] font-black text-slate-700 uppercase truncate max-w-[200px]">{item.name}</span>
                                    <div className="text-right flex items-center gap-2">
                                        <span className="text-[10px] font-black text-emerald-600">{formatRupiah(item.profit)}</span>
                                        <span className="text-[8px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md">{item.count} Trx</span>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-emerald-500 rounded-full" 
                                        style={{ width: `${Math.min(100, (item.profit / (stats?.allTime?.profit || 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Digiflazz Service Information */}
            <div className="flex items-center gap-3 px-1 mt-8">
                <ShieldCheck className="text-primary" size={20} />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Status Koneksi Provider</h3>
            </div>
            
            <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Provider Utama</p>
                            <h2 className="text-3xl font-black">Digiflazz <span className="text-blue-500">Official</span></h2>
                        </div>
                        <div className="flex gap-4">
                            <div className="px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Status API</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs font-black uppercase">Connected</span>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Antrian Webhook</p>
                                <span className="text-xs font-black uppercase">Normal</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 min-w-[240px] flex flex-col justify-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sisa Saldo Deposit</p>
                        <div className="flex items-end gap-2">
                            <h4 className="text-3xl font-black text-blue-400">
                                {balanceLoading ? "..." : formatRupiah(dfBalance?.data?.deposit || 0)}
                            </h4>
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold mt-2 uppercase tracking-tighter">
                            Akan terpotong otomatis saat transaksi
                        </p>
                    </div>
                </div>

                {/* Decorative BG */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600 rounded-full blur-[80px] opacity-20 -ml-20 -mb-20"></div>
            </div>
        </div>

        {/* Quick Actions / Alerts */}
        <div className="space-y-6">

            <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col justify-center text-white relative overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Total Transaksi (Sukses)</p>
                <div className="flex items-end gap-2 relative z-10">
                    <h4 className="text-5xl font-black">{stats?.allTime?.count || 0}</h4>
                    <span className="text-xs font-bold text-emerald-500 mb-2">+ Hari ini: {stats?.today?.count || 0}</span>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-30" />
            </div>

            <div className="flex items-center gap-3 px-1 pt-4">
                <AlertCircle className="text-amber-500" size={20} />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Pusat Notifikasi</h3>
            </div>
            
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
                {stats?.pendingDepositsCount > 0 && (
                    <Link href="/admin/deposits" className="block">
                        <div className="p-4 bg-amber-50 rounded-2xl flex items-center gap-4 group cursor-pointer hover:bg-amber-100 transition-colors">
                            <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                                <Wallet size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black text-slate-900 uppercase">{stats.pendingDepositsCount} Deposit PENDING</p>
                                <p className="text-[10px] text-amber-600 font-bold">Menunggu konfirmasi admin</p>
                            </div>
                        </div>
                    </Link>
                )}
                
                <Link href="/admin/transactions" className="block">
                    <div className="p-4 bg-emerald-50 rounded-2xl flex items-center gap-4 group cursor-pointer hover:bg-emerald-100 transition-colors">
                        <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                            <Package size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-black text-slate-900 uppercase">Pantau Transaksi</p>
                            <p className="text-[10px] text-emerald-600 font-bold">Verifikasi riwayat pembelian</p>
                        </div>
                    </div>
                </Link>

                <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Info size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-black text-slate-900 uppercase">Sistem Berjalan Normal</p>
                        <p className="text-[10px] text-blue-600 font-bold">Semua layanan fungsional</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
