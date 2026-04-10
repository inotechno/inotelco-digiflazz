import { 
  Smartphone, Zap, Wifi, CreditCard, 
  Gamepad2, Globe, Tv, ShieldCheck, 
  Headset, Ticket, Receipt, LayoutGrid 
} from "lucide-react";
import Link from "next/link";

const services = [
  { id: "pulsa", label: "Pulsa", icon: Smartphone, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "data", label: "Paket Data", icon: Wifi, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "pln", label: "Token PLN", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
  { id: "emoney", label: "E-Wallet", icon: CreditCard, color: "text-purple-500", bg: "bg-purple-50" },
  { id: "games", label: "Voucher Game", icon: Gamepad2, color: "text-rose-500", bg: "bg-rose-50" },
  { id: "pdam", label: "PDAM", icon: Globe, color: "text-cyan-500", bg: "bg-cyan-50" },
  { id: "voucher", label: "Voucher", icon: Ticket, color: "text-pink-500", bg: "bg-pink-50" },
  { id: "bpjs", label: "BPJS", icon: ShieldCheck, color: "text-green-500", bg: "bg-green-50" },
  { id: "internet", label: "Internet", icon: Headset, color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: "tv", label: "TV Kabel", icon: Tv, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "pbb", label: "Pajak PBB", icon: Receipt, color: "text-slate-500", bg: "bg-slate-50" },
  { id: "more", label: "Lainnya", icon: LayoutGrid, color: "text-slate-400", bg: "bg-slate-50" },
];

export default function ServiceGrid() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-slate-900">Layanan Digital</h3>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">E-Ecosystem</span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-y-6 gap-x-2">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.id}
              href={`/product/${service.id}`}
              className="group flex flex-col items-center justify-start space-y-2 transition-transform active:scale-95"
            >
              <div className={`w-12 h-12 ${service.bg} rounded-2xl flex items-center justify-center transition-all group-hover:shadow-md border border-transparent`}>
                <Icon className={service.color} size={22} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 text-center leading-tight group-hover:text-primary transition-colors">
                {service.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
