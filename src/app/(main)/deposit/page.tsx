"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, CreditCard, ChevronRight, CheckCircle2, Copy, Loader2, Wallet, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import dayjs from "dayjs";
import "dayjs/locale/id";

export default function DepositPage() {
  const [step, setStep] = useState(1); // 1: Input, 2: Payment Details
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [loading, setLoading] = useState(false);
  const [depositData, setDepositData] = useState<any>(null);

  const { data: history, refetch } = useQuery({
    queryKey: ["deposit-history"],
    queryFn: async () => {
      const res = await axios.get("/api/deposit/history");
      return res.data;
    },
  });

  const presets = ["50000", "100000", "200000", "500000", "1000000"];

  const handleCreateTicket = async () => {
    if (Number(amount) < 10000) {
      toast.error("Minimal deposit Rp 10.000");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/deposit/create", { 
        amount: Number(amount),
        method: method
      });
      setDepositData(res.data);
      setStep(2);
      refetch();
      toast.success("Tiket deposit dibuat!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal membuat tiket");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Berhasil disalin!");
  };

  if (step === 2 && depositData) {
    return (
      <div className="max-w-md mx-auto space-y-6 pb-20">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setStep(1)} className="p-2 bg-white rounded-full shadow-sm text-slate-400">
                <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-slate-900">Instruksi <span className="text-primary">Bayar</span></h1>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8 text-center">
            {depositData.tripay ? (
              // TAMPILAN QRIS TRIPAY
              <div className="space-y-6">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scan QRIS Berikut</p>
                <div className="bg-white p-4 rounded-3xl border-2 border-slate-50 inline-block shadow-inner">
                  <img src={depositData.tripay.qr_url} alt="QRIS" className="w-64 h-64 object-contain" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black text-slate-900">{formatRupiah(depositData.deposit.amount)}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Berlaku selama 30 menit</p>
                </div>
              </div>
            ) : (
              // TAMPILAN TRANSFER MANUAL
              <div className="space-y-8">
                <div className="space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Bayar (Termasuk Kode Unik)</p>
                    <div 
                        onClick={() => copyToClipboard(depositData.deposit.amount.toString())}
                        className="text-3xl font-black text-primary flex items-center justify-center gap-2 cursor-pointer bg-primary/5 py-4 rounded-2xl border border-primary/20"
                    >
                        {formatRupiah(depositData.deposit.amount)}
                        <Copy size={18} className="opacity-50" />
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl space-y-4 text-left border border-slate-100">
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black uppercase text-slate-400">Transfer Ke (Bank BCA)</p>
                        <div className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">BCA</div>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-black text-slate-900">0123-4567-89</p>
                        <button onClick={() => copyToClipboard("0123456789")} className="text-primary hover:text-primary/70">
                            <Copy size={16} />
                        </button>
                    </div>
                    <p className="text-xs font-bold text-slate-500">A/N INOTELCO PPOB</p>
                </div>
              </div>
            )}

            <div className="bg-amber-50 p-6 rounded-3xl flex gap-4 text-left border border-amber-100">
                <CheckCircle2 className="text-amber-500 shrink-0" size={20} />
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                    Saldo akan bertambah otomatis setelah dikonfirmasi Admin. Transaksi biasanya diproses dalam <span className="font-black">5-15 menit</span>.
                </p>
            </div>

            <Link href="/" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2">
                Kembali ke Beranda
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 bg-white rounded-full shadow-sm text-slate-400">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-slate-900">Isi <span className="text-primary">Saldo</span></h1>
      </div>

      {/* Amount Input */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nominal Top Up</label>
          <div className="relative group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300 group-focus-within:text-primary transition-colors">Rp</span>
            <input
              type="number"
              placeholder="Min. 10.000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-xl font-black outline-none"
            />
          </div>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => (
                <button
                    key={p}
                    onClick={() => setAmount(p)}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                        amount === p 
                        ? "bg-primary border-primary text-white" 
                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                    }`}
                >
                    {Number(p) / 1000}K
                </button>
            ))}
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="bg-white p-2 rounded-[3rem] shadow-sm border border-slate-100 space-y-1">
        <button 
          onClick={() => setMethod("QRIS")}
          className={`w-full p-4 flex items-center justify-between rounded-[2.5rem] transition-all ${method === "QRIS" ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${method === "QRIS" ? "bg-primary text-white" : "bg-emerald-50 text-emerald-600"}`}>
                    <CheckCircle2 size={24} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                    <p className="text-sm font-black text-slate-900">QRIS (Otomatis)</p>
                    <p className="text-[10px] text-slate-400 font-medium">BCA, ShopeePay, Dana, Ovo, Dll</p>
                </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${method === "QRIS" ? "border-primary" : "border-slate-200"}`}>
                {method === "QRIS" && <div className="w-3 h-3 bg-primary rounded-full" />}
            </div>
        </button>

        <button 
          onClick={() => setMethod("BANK_TRANSFER")}
          className={`w-full p-4 flex items-center justify-between rounded-[2.5rem] transition-all ${method === "BANK_TRANSFER" ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${method === "BANK_TRANSFER" ? "bg-primary text-white" : "bg-blue-50 text-blue-600"}`}>
                    <Wallet size={24} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                    <p className="text-sm font-black text-slate-900">Transfer Bank Manual</p>
                    <p className="text-[10px] text-slate-400 font-medium">Konfirmasi Admin (BCA)</p>
                </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${method === "BANK_TRANSFER" ? "border-primary" : "border-slate-200"}`}>
                {method === "BANK_TRANSFER" && <div className="w-3 h-3 bg-primary rounded-full" />}
            </div>
        </button>
      </div>

      <button
        onClick={handleCreateTicket}
        disabled={loading || !amount}
        className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : "Buat Tiket Deposit"}
        <ChevronRight size={20} />
      </button>

      {/* History Section */}
      <section className="space-y-4 pt-6">
        <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Riwayat Terakhir</h3>
            <Link href="/history" className="text-[10px] font-bold text-primary">Lihat Semua</Link>
        </div>

        <div className="space-y-3">
          {history?.map((dep: any) => (
            <div key={dep.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    dep.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" :
                    dep.status === "FAILED" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                }`}>
                    {dep.status === "SUCCESS" ? <CheckCircle2 size={18} /> : 
                     dep.status === "FAILED" ? <XCircle size={18} /> : <Clock size={18} />}
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-900 leading-none mb-1">
                    {formatRupiah(dep.amount)}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">
                    {dayjs(dep.createdAt).format("DD MMM, HH:mm")} • {dep.method}
                  </p>
                </div>
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                dep.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : 
                dep.status === "FAILED" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
              }`}>
                {dep.status}
              </span>
            </div>
          ))}

          {(!history || history.length === 0) && (
            <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Belum ada riwayat</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
