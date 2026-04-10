"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Lock, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const PinInput = ({ value, onChange, label, sub, show }: any) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    onChange(newDigits.join("").slice(0, 6));
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    const firstEmpty = digits.findIndex(d => d === "");
    const targetIndex = firstEmpty === -1 ? 0 : firstEmpty;
    inputRefs.current[targetIndex]?.focus();
  }, []);

  return (
    <div className="space-y-6 flex flex-col items-center">
      <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-slate-900">{label}</h3>
          <p className="text-xs text-slate-400 font-medium">{sub}</p>
      </div>
        <div className="flex gap-2">
        {digits.map((d: string, i: number) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type={show ? "text" : "password"}
            inputMode="numeric"
            maxLength={1}
            value={d}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onChange={(e) => handleChange(i, e.target.value)}
            className="w-11 h-14 text-center text-xl font-black bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
          />
        ))}
      </div>
    </div>
  );
};

export default function ChangePinPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Old PIN, 2: New PIN
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Removed PinInput from here

  const handleNext = () => {
    if (oldPin.length === 6) setStep(2);
    else toast.error("Masukkan 6 digit PIN lama");
  };

  const handleSubmit = async () => {
    if (newPin.length !== 6) return;
    setLoading(true);
    try {
      await axios.post("/api/user/update-pin", { oldPin, newPin });
      toast.success("PIN berhasil diperbarui!");
      router.push("/profile");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memperbarui PIN");
      setOldPin("");
      setNewPin("");
      setStep(1);
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
        <h1 className="text-xl font-black text-slate-900">Keamanan <span className="text-primary">PIN</span></h1>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center space-y-10">
        <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary rotate-3">
            <Lock size={32} strokeWidth={1.5} />
        </div>

            {step === 1 ? (
              <PinInput 
                value={oldPin} 
                onChange={setOldPin} 
                label="PIN Saat Ini" 
                sub="Masukkan 6 digit PIN keamanan Anda" 
                show={showPin}
              />
            ) : (
              <PinInput 
                value={newPin} 
                onChange={setNewPin} 
                label="PIN Baru" 
                sub="Gunakan kombinasi angka yang sulit ditebak" 
                show={showPin}
              />
            )}

            <button 
                type="button" 
                onClick={() => setShowPin(!showPin)}
                className="mt-6 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-2"
            >
                {showPin ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPin ? "Sembunyikan" : "Lihat PIN"}
            </button>

        <button
          onClick={step === 1 ? handleNext : handleSubmit}
          disabled={loading || (step === 1 ? oldPin.length < 6 : newPin.length < 6)}
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : step === 1 ? "Lanjut" : "Simpan PIN Baru"}
        </button>
      </div>
    </div>
  );
}
