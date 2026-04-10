"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { 
  User, 
  Settings, 
  ShieldCheck, 
  HelpCircle, 
  LogOut, 
  RefreshCw, 
  ChevronRight, 
  Users, 
  CreditCard,
  MessageCircle,
  Info,
  Wallet,
  Activity,
  Terminal,
  Package,
  LayoutDashboard
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import axios from "axios";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await axios.post("/api/admin/sync-products");
      toast.success(`${res.data.count} Produk berhasil diperbarui!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal sinkronisasi");
    } finally {
      setSyncing(false);
    }
  };

  const userRole = (session?.user as any)?.role || "MEMBER";

  const MenuLink = ({ icon: Icon, label, sub, onClick, href, color = "text-slate-600" }: any) => {
    const content = (
      <div className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${color}`}>
            <Icon size={20} strokeWidth={1.5} />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-900">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 font-medium">{sub}</p>}
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-300" />
      </div>
    );

    if (href) {
      return <Link href={href} className="block">{content}</Link>;
    }

    return <button onClick={onClick} className="w-full block">{content}</button>;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* User Info Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 border-4 border-white shadow-md">
          <User size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-black text-slate-900">{session?.user?.name}</h2>
        <p className="text-sm text-slate-400 font-medium mb-4">{session?.user?.email}</p>
        <div className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
          Tier: {userRole}
        </div>

        <Link 
          href="/profile/edit" 
          className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
        >
          <Settings size={12} />
          Ubah Profil
        </Link>
      </div>

      {/* Account Settings */}
      <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 px-2">Keamanan & Akun</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <MenuLink icon={ShieldCheck} label="Ubah PIN Transaksi" sub="Keamanan transaksi Anda" href="/profile/security/pin" />
          <MenuLink icon={Lock} label="Ubah Password" sub="Ganti kata sandi berkala" href="/profile/security/password" />
        </div>
      </section>

      {/* Admin Panel Tools */}
      {userRole === "ADMIN" && (
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3 px-2">Admin Tools</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <MenuLink icon={LayoutDashboard} label="Dashboard Utama" sub="Analisis Laba, Modal & Penjualan" href="/admin/stats" color="text-primary" />
             <MenuLink 
              icon={RefreshCw} 
              label={syncing ? "Menyinkronkan..." : "Sinkronisasi Digiflazz"} 
              sub="Tarik harga produk terbaru"
              onClick={handleSync}
              color="text-primary"
            />
            <MenuLink icon={Package} label="Manajemen Produk" sub="Atur status & harga jual produk" href="/admin/products" color="text-rose-500" />
            <MenuLink icon={Users} label="Manajemen User" sub="Atur member & markup harga" href="/admin/users" />
            <MenuLink icon={Wallet} label="Konfirmasi Deposit" sub="Verifikasi saldo masuk manual" href="/admin/deposits" color="text-amber-500" />
            <MenuLink icon={Activity} label="Audit Keuangan" sub="Log aktivitas saldo seluruh user" href="/admin/logs" color="text-indigo-500" />
            <MenuLink icon={Terminal} label="Log Aktivitas" sub="Monitor aktivitas sistem & user" href="/admin/system-logs" color="text-sky-500" />
            <MenuLink icon={Settings} label="Konfigurasi Ekslusif" sub="Setat API Key & Webhook" href="/admin/settings" />
          </div>
        </section>
      )}

      {/* Support & Others */}
      <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 px-2">Dukungan</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <MenuLink 
            icon={MessageCircle} 
            label="WhatsApp CS" 
            sub="Hubungi bantuan 24/7" 
            color="text-emerald-500"
          />
          <MenuLink icon={Info} label="Tentang InoTelco" sub="Syarat, Ketentuan & Kebijakan" />
          <MenuLink 
            icon={LogOut} 
            label="Keluar Aplikasi" 
            onClick={() => signOut()} 
            color="text-rose-500" 
          />
        </div>
      </section>

      {/* Version Info */}
      <div className="text-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">InoTelco v1.0.0-alpha</p>
      </div>
    </div>
  );
}

// Minimal placeholder for missing component
function Lock({ size, strokeWidth }: any) {
  return <ShieldCheck size={size} strokeWidth={strokeWidth} />;
}
