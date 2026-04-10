import { formatRupiah } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";

interface ProductCardProps {
  sku: string;
  name: string;
  price: number;
  isSelected?: boolean;
  isAvailable?: boolean;
  onClick: () => void;
}

export default function ProductCard({ name, price, isSelected, isAvailable, onClick }: ProductCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${
        isSelected 
          ? "bg-white border-primary shadow-lg shadow-primary/5 ring-1 ring-primary" 
          : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
      }`}
    >
      <div className="flex flex-col h-full space-y-2">
        <div className="flex justify-between items-start">
            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
                isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
            }`}>
                {name.split(' ')[0]}
            </span>
            <div className={`flex items-center gap-1 ${isAvailable ? "text-emerald-500" : "text-rose-500"}`}>
                <div className={`w-1 h-1 rounded-full animate-pulse ${isAvailable ? "bg-emerald-500" : "bg-rose-500"}`} />
                <span className="text-[8px] font-black uppercase tracking-tighter">
                   {isAvailable ? "Tersedia" : "Gangguan"}
                </span>
            </div>
        </div>

        <div className="space-y-0.5">
          <p className={`text-[11px] font-semibold leading-tight transition-colors line-clamp-2 ${
            isSelected ? "text-slate-900" : "text-slate-600"
          }`}>
            {name}
          </p>
          <p className={`text-base font-black tracking-tight transition-colors ${
            isSelected ? "text-primary" : "text-slate-900"
          }`}>
            {formatRupiah(price)}
          </p>
        </div>
      </div>

      {isSelected && (
        <div className="absolute -top-1.5 -right-1.5 bg-primary text-white p-1 rounded-lg">
          <Check size={12} strokeWidth={3} />
        </div>
      )}
    </button>
  );
}
