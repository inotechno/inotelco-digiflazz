"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, User, Mail, CreditCard, Shield, Loader2, Search, Edit3, Filter, X } from "lucide-react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ balance: 0, role: "MEMBER" });

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users", search, filterRole],
    queryFn: async () => {
      const res = await axios.get("/api/admin/users", {
        params: { search, role: filterRole }
      });
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => axios.post("/api/admin/users", data),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditForm({ balance: Number(user.balance), role: user.role });
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <Link href="/profile" className="p-2 bg-white rounded-full shadow-sm text-slate-400">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-slate-900">Manajemen <span className="text-primary">User</span></h1>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
                type="text"
                placeholder="Cari Nama atau Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary transition-all text-sm font-bold"
            />
        </div>
        <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary text-sm font-bold appearance-none cursor-pointer"
            >
                <option value="">Semua Role</option>
                <option value="MEMBER">Member</option>
                <option value="RESELLER">Reseller</option>
                <option value="ADMIN">Admin</option>
            </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="space-y-4">
          {users?.map((user: any) => (
            <div key={user.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <User size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">{user.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                        <div className="flex gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black rounded-full tracking-widest uppercase">
                                {user.role}
                            </span>
                            <span className="text-[10px] font-black text-primary">
                                {formatRupiah(user.balance)}
                            </span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => handleEditClick(user)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all"
                >
                    <Edit3 size={18} />
                </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Edit / Dashboard Pengaturan User */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 space-y-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-slate-900">Atur Anggota</h3>
                    <p className="text-xs text-slate-400 font-medium">{editingUser.name}</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 px-1">Saldo User (Rp)</label>
                        <input 
                            type="number" 
                            className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-black text-slate-900"
                            value={editForm.balance}
                            onChange={(e) => setEditForm({ ...editForm, balance: Number(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 px-1">Role Akun</label>
                        <select 
                            className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-900"
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        >
                            <option value="MEMBER">Member (Standard)</option>
                            <option value="RESELLER">Reseller (VIP)</option>
                            <option value="ADMIN">Admin (Superuser)</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setEditingUser(null)}
                        className="flex-1 py-4 text-sm font-black text-slate-400 hover:text-slate-600"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={() => updateMutation.mutate({ userId: editingUser.id, ...editForm })}
                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-lg shadow-slate-200"
                    >
                        Simpan
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
