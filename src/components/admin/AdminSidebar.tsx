"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Wallet, 
  Activity, 
  Terminal, 
  Settings,
  LogOut,
  ChevronLeft,
  ShoppingCart
} from "lucide-react";
import Image from "next/image";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/stats" },
  { icon: ShoppingCart, label: "Transaksi", href: "/admin/transactions" },
  { icon: Package, label: "Produk", href: "/admin/products" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Wallet, label: "Deposit", href: "/admin/deposits" },
  { icon: Activity, label: "Audit Saldo", href: "/admin/logs" },
  { icon: Terminal, label: "Sistem Log", href: "/admin/system-logs" },
  { icon: Settings, label: "Pengaturan", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen z-50">
      <div className="p-8">
        <div className="flex items-center gap-3">
            <Image src="/brands/logo.png" alt="Logo" width={32} height={32} className="rounded-xl" />
            <h1 className="text-xl font-black tracking-tighter text-slate-900">
                Ino<span className="text-primary">Telco</span>
            </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                isActive 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={20} className={isActive ? "text-white" : "group-hover:text-primary transition-colors"} strokeWidth={2} />
              <span className="text-sm font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-50">
        <Link 
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-500 transition-colors"
        >
            <LogOut size={20} />
            <span className="text-sm font-bold">Keluar Admin</span>
        </Link>
      </div>
    </aside>
  );
}
