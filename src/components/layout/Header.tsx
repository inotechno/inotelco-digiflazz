import { Bell, Search } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center h-14 max-w-md mx-auto px-4">
        <div className="flex items-center gap-2">
          <Image src="/brands/logo.png" alt="InoTelco Logo" width={28} height={28} className="rounded-lg shadow-sm" />
          <h1 className="text-lg font-black tracking-tighter text-slate-900 leading-none">
            Ino<span className="text-primary">Telco</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
            <Search size={18} strokeWidth={2.5} />
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative">
            <Bell size={18} strokeWidth={2.5} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
