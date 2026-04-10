"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Shield, Key, Tag, Layout, CreditCard, Wallet } from "lucide-react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});

  const { data: config, isLoading } = useQuery({
    queryKey: ["admin-config"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/config");
      return res.data;
    },
  });

  useEffect(() => {
    if (config) setFormData(config);
  }, [config]);

  const mutation = useMutation({
    mutationFn: (data: any) => axios.post("/api/admin/config", data),
    onSuccess: () => {
      toast.success("Pengaturan berhasil disimpan!");
      queryClient.invalidateQueries({ queryKey: ["admin-config"] });
    },
  });

  const InputGroup = ({ icon: Icon, label, name, placeholder, type = "text" }: any) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
          <Icon size={18} strokeWidth={1.5} />
        </div>
        <input
          type={type}
          value={formData[name] || ""}
          placeholder={placeholder}
          onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <Link href="/profile" className="p-2 bg-white rounded-full shadow-sm text-slate-400">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-slate-900">Konfigurasi <span className="text-primary">Eksklusif</span></h1>
      </div>

      {/* Digiflazz Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Key size={16} className="text-primary" />
          <h3 className="text-sm font-black text-slate-900">Digiflazz API</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <InputGroup icon={Shield} label="Digiflazz Username" name="DIGIFLAZZ_USERNAME" placeholder="Username Digiflazz" />
          <InputGroup icon={Shield} label="Digiflazz API Key" name="DIGIFLAZZ_API_KEY" placeholder="Key Production/Development" type="password" />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Tag size={16} className="text-primary" />
          <h3 className="text-sm font-black text-slate-900">Markup & Harga</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Mode Markup Global</label>
            <select 
              value={formData.MARKUP_MODE || "NOMINAL"}
              onChange={(e) => setFormData({ ...formData, MARKUP_MODE: e.target.value })}
              className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold outline-none"
            >
              <option value="NOMINAL">Nominal (Rp)</option>
              <option value="PERCENTAGE">Persentase (%)</option>
            </select>
          </div>
          <InputGroup 
            icon={Tag} 
            label={`Markup Member (${formData.MARKUP_MODE === 'PERCENTAGE' ? '%' : 'Rp'})`} 
            name="MARKUP_MEMBER" 
            placeholder="1500" 
            type="number" 
          />
          <InputGroup 
            icon={Tag} 
            label={`Markup Reseller (${formData.MARKUP_MODE === 'PERCENTAGE' ? '%' : 'Rp'})`} 
            name="MARKUP_RESELLER" 
            placeholder="1000" 
            type="number" 
          />
        </div>
      </section>

      {/* TriPay Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1 text-emerald-600">
          <CreditCard size={16} />
          <h3 className="text-sm font-black text-slate-900">TriPay QRIS (Otomatis)</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <InputGroup icon={CreditCard} label="Merchant Code" name="TRIPAY_MERCHANT_CODE" placeholder="Contoh: T12345" />
          <InputGroup icon={Key} label="TriPay API Key" name="TRIPAY_API_KEY" placeholder="ApiKey..." type="password" />
          <InputGroup icon={Shield} label="TriPay Private Key" name="TRIPAY_PRIVATE_KEY" placeholder="PrivateKey..." type="password" />
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">TriPay Mode</label>
            <select 
              value={formData.TRIPAY_MODE || "sandbox"}
              onChange={(e) => setFormData({ ...formData, TRIPAY_MODE: e.target.value })}
              className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold outline-none"
            >
              <option value="sandbox">Sandbox (Testing)</option>
              <option value="production">Production (Real)</option>
            </select>
          </div>
        </div>
      </section>

      {/* App Info Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Layout size={16} className="text-primary" />
          <h3 className="text-sm font-black text-slate-900">Informasi Aplikasi</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <InputGroup icon={Layout} label="Nama Website" name="SITE_NAME" placeholder="InoTelco PPOB" />
          <InputGroup icon={Layout} label="WhatsApp CS" name="WHATSAPP_CS" placeholder="628123456789" />
        </div>
      </section>

      {/* Deposit Digiflazz Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1 text-primary">
          <Wallet size={16} />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Top Up Saldo Digiflazz</h3>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Bank Tujuan</label>
                <select 
                  id="df-bank"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold outline-none appearance-none"
                >
                  <option value="BCA">BCA (Otomatis)</option>
                  <option value="BNI">BNI (Otomatis)</option>
                  <option value="BRI">BRI (Otomatis)</option>
                  <option value="MANDIRI">MANDIRI (Otomatis)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Jumlah (Min 50rb)</label>
                <input 
                  id="df-amount"
                  type="number"
                  placeholder="50000"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold outline-none"
                />
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nama Pengirim (Sesuai Rekening)</label>
              <input 
                id="df-owner"
                type="text"
                placeholder="CONTOH: ACHMAD FATONI"
                className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold outline-none"
              />
           </div>
           <button
             onClick={async () => {
                const bank = (document.getElementById('df-bank') as HTMLSelectElement).value;
                const amount = (document.getElementById('df-amount') as HTMLInputElement).value;
                const owner = (document.getElementById('df-owner') as HTMLInputElement).value;
                
                if(!amount || !owner) return toast.error("Mohon lengkapi data deposit");
                
                try {
                  const res = await axios.post("/api/admin/digiflazz/deposit", {
                    bank, amount, owner_name: owner
                  });
                  if(res.data.data) {
                    toast.success("Tiket berhasil dibuat! Silakan transfer sesuai instruksi.");
                    alert(`SILAKAN TRANSFER:\n\nBank: ${res.data.data.bank}\nRekening: ${res.data.data.no_rekening}\nAtas Nama: ${res.data.data.name}\nJUMLAH: ${formatRupiah(res.data.data.amount)}\n\nKeterangan: ${res.data.data.notes}`);
                  } else {
                    toast.error(res.data.message || "Gagal membuat tiket");
                  }
                } catch (e: any) {
                  toast.error(e.response?.data?.message || "Gagal menghubungi Digiflazz");
                }
             }}
             className="w-full py-4 bg-primary/10 text-primary rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
           >
             Buat Tiket Deposit
           </button>
        </div>
      </section>

      {/* Floating Save Button */}
      <div className="fixed bottom-24 left-0 right-0 px-6 z-50 max-w-lg mx-auto">
        <button
          onClick={() => mutation.mutate(formData)}
          disabled={mutation.isPending}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {mutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          <Save size={18} />
        </button>
      </div>
    </div>
  );
}
