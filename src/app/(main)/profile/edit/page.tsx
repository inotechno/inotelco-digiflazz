"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Loader2, Save } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 3) return toast.error("Nama terlalu pendek");

    setLoading(true);
    try {
      const res = await axios.put("/api/user/profile", { name });
      toast.success(res.data.message);
      
      // Update next-auth session
      await update({ ...session, user: { ...session?.user, name } });
      
      router.push("/profile");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/profile" className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-slate-900">Ubah <span className="text-primary">Profil</span></h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center space-y-8">
          <div className="relative group">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary border-4 border-white shadow-md">
              <User size={48} strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-primary border border-slate-50">
               <Save size={14} />
            </div>
          </div>

          <div className="w-full space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nama Lengkap</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Alamat Email (Tidak dapat diubah)</label>
              <input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || name === session?.user?.name}
          className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black shadow-2xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
