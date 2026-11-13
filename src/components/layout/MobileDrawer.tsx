"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  X,
  Wallet,
  LayoutDashboard,
  ReceiptText,
  HandCoins,
  BarChart3,
  SlidersHorizontal,
  Shield,
  LogOut,
  Plus,
} from "lucide-react";
import { EntryTabType } from "@/components/modals/UnifiedTransactionModal";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewEntry?: (tab?: EntryTabType) => void;
  onOpenAddExpense?: () => void;
  onOpenAddIncome?: () => void;
  onOpenLendModal?: () => void;
}

export function MobileDrawer({
  isOpen,
  onClose,
  onOpenNewEntry,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenLendModal,
}: MobileDrawerProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session?.user as any)?.role || "USER";
  const isAdmin = userRole === "ADMIN";

  if (!isOpen) return null;

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Day Ledger", href: "/transactions", icon: ReceiptText },
    { name: "Udhaar Tracker", href: "/udhaar", icon: HandCoins },
    { name: "Monthly Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Wallet & Profile", href: "/wallet-settings", icon: SlidersHorizontal },
    ...(isAdmin || pathname.startsWith("/admin")
      ? [{ name: "Admin Portal", href: "/admin", icon: Shield, adminOnly: true }]
      : []),
  ];

  const handleOpenTab = (tab: EntryTabType) => {
    onClose();
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
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs bg-[#09090b] border-r border-zinc-800 p-6 flex flex-col justify-between h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-bold text-white text-base">PocketKhata</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="py-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-zinc-200">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {session?.user?.name || "PocketKhata User"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-zinc-400 truncate">
                    {session?.user?.email}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isAdmin
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                    }`}
                  >
                    {userRole}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="py-4 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition min-h-[44px] ${
                    isActive
                      ? "bg-zinc-850 text-white font-semibold border border-zinc-700/80"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-zinc-400"}`} />
                  <span>{link.name}</span>
                  {link.adminOnly && (
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                      ADMIN
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Action */}
          <div className="pt-2 pb-4 space-y-2 border-t border-zinc-800/80">
            <button
              onClick={() => handleOpenTab("EXPENSE")}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs transition active:scale-[0.98] min-h-[44px]"
            >
              <Plus className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
              <span>+ New Entry</span>
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div className="pt-4 border-t border-zinc-800">
          <button
            onClick={() =>
              session?.user
                ? signOut({ callbackUrl: "/login" })
                : (window.location.href = "/login")
            }
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
