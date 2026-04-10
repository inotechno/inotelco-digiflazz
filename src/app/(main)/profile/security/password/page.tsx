"use client";

import { useState } from "react";
import { ArrowLeft, Key, Loader2, ShieldAlert, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/user/update-password", { 
        oldPassword: formData.oldPassword, 
        newPassword: formData.newPassword 
      });
      toast.success("Password berhasil diperbarui!");
      router.push("/profile");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memperbarui password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/profile" className="p-2 bg-white rounded-full shadow-sm text-slate-400">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-slate-900">Ubah <span className="text-primary">Password</span></h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
        <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400">
                <ShieldAlert size={32} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Ganti password secara berkala untuk menjaga keamanan akun Anda</p>
        </div>

        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 px-1">Password Lama</label>
                <div className="relative group">
                    <input 
                        type={showOld ? "text" : "password"} 
                        required
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-900 pr-14"
                        value={formData.oldPassword}
                        onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                        placeholder="Contoh: password123"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowOld(!showOld)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-50">
                <label className="text-[10px] font-black uppercase text-slate-400 px-1">Password Baru (Min. 8 Karakter)</label>
                <div className="relative group">
                    <input 
                        type={showNew ? "text" : "password"} 
                        required
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-900 pr-14"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        placeholder="Minimal 8 karakter"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 px-1">Konfirmasi Password Baru</label>
                <div className="relative group">
                    <input 
                        type={showConfirm ? "text" : "password"} 
                        required
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-900 pr-14"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Ulangi password baru"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Simpan Kata Sandi"}
        </button>
      </form>
    </div>
  );
}
