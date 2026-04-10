"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Beranda", icon: Home, href: "/" },
  { label: "Riwayat", icon: History, href: "/history" },
  { label: "Deposit", icon: Wallet, href: "/deposit" },
  { label: "Profil", icon: User, href: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[70] bg-white/80 backdrop-blur-xl pb-safe shadow-[0_-15px_40px_-20px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-18 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 w-full h-full transition-colors",
                isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
