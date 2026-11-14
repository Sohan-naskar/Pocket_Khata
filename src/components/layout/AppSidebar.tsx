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
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { EntryTab } from "@/components/modals/UnifiedTransactionModal";

interface AppSidebarProps {
  onOpenNewEntry?: (tab?: EntryTab) => void;
  onOpenAddExpense?: () => void;
  onOpenAddIncome?: () => void;
  onOpenLendModal?: () => void;
}

export function AppSidebar({
  onOpenNewEntry,
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
    ...(isAdmin || pathname.startsWith("/admin")
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

  const handleAction = (tab: EntryTab = "EXPENSE") => {
    if (onOpenNewEntry) {
      onOpenNewEntry(tab);
    } else if (tab === "EXPENSE" && onOpenAddExpense) {
      onOpenAddExpense();
    } else if (tab === "INCOME" && onOpenAddIncome) {
      onOpenAddIncome();
    } else if (tab === "LEND" && onOpenLendModal) {
      onOpenLendModal();
    }
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-[#0c0d12] border-r border-zinc-800/80 p-4 shrink-0 h-[calc(100vh-4rem)] sticky top-16 justify-between">
      <div className="space-y-6">
        {/* Navigation Links */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 font-mono">
            Navigation
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition min-h-[44px] ${
                  isActive
                    ? "bg-white/[0.08] text-white font-semibold border border-white/[0.08] shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-emerald-400"
                      : item.adminOnly
                      ? "text-purple-400"
                      : "text-zinc-400"
                  }`}
                />
                <span className="flex-1">{item.name}</span>
                {item.adminOnly && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    ADMIN
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Action Side Trigger */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-2">
          <p className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 font-mono">
            Fast Entry
          </p>
          
          <button
            onClick={() => handleAction("EXPENSE")}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold transition shadow-md shadow-white/5 active:scale-[0.98] min-h-[42px]"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
              <span>+ New Entry</span>
            </div>
            <span className="text-[10px] bg-zinc-200/90 text-zinc-800 px-1.5 py-0.5 rounded font-mono">
              Modal
            </span>
          </button>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => handleAction("INCOME")}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-emerald-400 text-[11px] font-medium transition"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+ Money</span>
            </button>
            <button
              onClick={() => handleAction("LEND")}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-amber-400 text-[11px] font-medium transition"
            >
              <HandCoins className="w-3.5 h-3.5" />
              <span>+ Udhaar</span>
            </button>
          </div>
        </div>
      </div>

        {/* Footer info within sidebar */}
      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-400">
        <p className="font-semibold text-zinc-300">PocketKhata v1.0</p>
        <p className="text-[11px] mt-0.5 text-zinc-500 font-mono">
          Skiper Minimalist FinTech
        </p>
      </div>
    </aside>
  );
}
