"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ReceiptText,
  HandCoins,
  BarChart3,
  SlidersHorizontal,
  Shield,
  PlusCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface AppSidebarProps {
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenLendModal: () => void;
}

export function AppSidebar({
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenLendModal,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session?.user as any)?.role || "USER";
  const isAdmin = userRole === "ADMIN";

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Day Ledger",
      href: "/transactions",
      icon: ReceiptText,
    },
    {
      name: "Udhaar Tracker",
      href: "/udhaar",
      icon: HandCoins,
    },
    {
      name: "Monthly Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      name: "Wallet Settings",
      href: "/wallet-settings",
      icon: SlidersHorizontal,
    },
    ...(isAdmin
      ? [
          {
            name: "Admin Portal",
            href: "/admin",
            icon: Shield,
            adminOnly: true,
          },
        ]
      : []),
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-[#0B101E] border-r border-slate-800/80 p-4 shrink-0 h-[calc(100vh-4rem)] sticky top-16 justify-between">
      <div className="space-y-6">
        {/* Navigation Links */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Finance Menu
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition min-h-[44px] ${
                  isActive
                    ? "bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-white"
                      : item.adminOnly
                      ? "text-purple-400"
                      : "text-slate-400"
                  }`}
                />
                <span className="flex-1">{item.name}</span>
                {item.adminOnly && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ADMIN
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Action Side Buttons */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Quick Khata Entry
          </p>
          <button
            onClick={onOpenAddExpense}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-rose-900/40 hover:bg-rose-950/40 text-rose-300 text-xs font-semibold transition min-h-[44px]"
          >
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span>- Log Expense</span>
          </button>
          <button
            onClick={onOpenAddIncome}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-emerald-900/40 hover:bg-emerald-950/40 text-emerald-300 text-xs font-semibold transition min-h-[44px]"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>+ Add Income</span>
          </button>
          <button
            onClick={onOpenLendModal}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-900/40 hover:bg-amber-950/40 text-amber-300 text-xs font-semibold transition min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>+ Lend Udhaar</span>
          </button>
        </div>
      </div>

      {/* Footer info within sidebar */}
      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs text-slate-400">
        <p className="font-semibold text-slate-300">PocketKhata v1.0</p>
        <p className="text-[11px] mt-0.5 text-slate-400">
          Strict DD-MM-YYYY Ledger & Dual Wallet Engine
        </p>
      </div>
    </aside>
  );
}

