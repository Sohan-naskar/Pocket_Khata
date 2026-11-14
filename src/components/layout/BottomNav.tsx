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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/80 backdrop-blur-2xl border-t border-white/[0.1] px-3 py-1 safe-area-pb transition-colors duration-200">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto relative">
        {/* Left two items */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
                isActive ? "text-cyan-400 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}

        {/* Center Floating Quick Action Button (Neo-Fintech Glow) */}
        <div className="relative -top-4">
          <button
            onClick={onOpenQuickMenu}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 text-white shadow-xl shadow-indigo-500/35 hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-white/20"
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
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
                isActive ? "text-cyan-400 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
