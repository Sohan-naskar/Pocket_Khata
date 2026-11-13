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
  Sparkles,
} from "lucide-react";
import { EntryTabType } from "@/components/modals/UnifiedTransactionModal";

interface AppSidebarProps {
  onOpenNewEntry?: (tab?: EntryTabType) => void;
  onOpenAddExpense?: () => void;
  onOpenAddIncome?: () => void;
  onOpenLendModal?: () => void;
}

export function AppSidebar({
  onOpenNewEntry,
  onOpenAddExpense,
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
      name: "Analytics",
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

  const handleCreate = () => {
    if (onOpenNewEntry) {
      onOpenNewEntry("EXPENSE");
    } else if (onOpenAddExpense) {
      onOpenAddExpense();
    }
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-[#0c0c0e] border-r border-zinc-800/80 p-4 shrink-0 h-[calc(100vh-4rem)] sticky top-16 justify-between">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Navigation
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition min-h-[42px] ${
                  isActive
                    ? "bg-zinc-800/90 text-white font-semibold border border-zinc-700/80 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50"
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
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25">
                    ADMIN
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Skiper Quick Action Button */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-2">
          <p className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Quick Action
          </p>
          <button
            onClick={handleCreate}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/60 text-zinc-100 text-xs font-semibold transition active:scale-[0.98] min-h-[42px]"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ New Transaction</span>
          </button>
        </div>
      </div>

      {/* Footer Info within Sidebar */}
      <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-zinc-300">PocketKhata Live</span>
        </div>
        <p className="text-[11px] mt-1 text-zinc-500">
          Strict DD-MM-YYYY Ledger &amp; Dual-Wallet
        </p>
      </div>
    </aside>
  );
}
