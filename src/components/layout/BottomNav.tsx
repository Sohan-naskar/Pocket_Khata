"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, Plus, HandCoins, BarChart3 } from "lucide-react";

interface BottomNavProps {
  onOpenQuickMenu: () => void;
}

export function BottomNav({ onOpenQuickMenu }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Ledger",
      href: "/transactions",
      icon: ReceiptText,
    },
    {
      name: "Udhaar",
      href: "/udhaar",
      icon: HandCoins,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-xl border-t border-zinc-800/80 px-3 py-1 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto relative">
        {/* Left two items */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition ${
                isActive ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-emerald-400" : "text-zinc-400"}`} />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}

        {/* Center Floating Skiper Quick Action Button */}
        <div className="relative -top-5">
          <button
            onClick={onOpenQuickMenu}
            className="w-12 h-12 rounded-full bg-white text-zinc-950 shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition flex items-center justify-center border-4 border-[#09090b] min-h-[44px] min-w-[44px]"
            aria-label="Add Transaction or Loan"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Right two items */}
        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition ${
                isActive ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-emerald-400" : "text-zinc-400"}`} />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
