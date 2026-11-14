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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/90 backdrop-blur-xl border-t border-zinc-800/80 px-3 py-1 safe-area-pb">
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
                isActive ? "text-white font-semibold" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}

        {/* Center Floating Quick Action Button (Skiper high contrast) */}
        <div className="relative -top-4">
          <button
            onClick={onOpenQuickMenu}
            className="w-12 h-12 rounded-2xl bg-white text-zinc-950 shadow-xl shadow-white/10 hover:bg-zinc-200 active:scale-90 transition-all flex items-center justify-center border-2 border-zinc-900"
            aria-label="Add Transaction or Loan"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
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
                isActive ? "text-white font-semibold" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
