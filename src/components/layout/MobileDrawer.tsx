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
import { EntryTab } from "@/components/modals/UnifiedTransactionModal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewEntry?: (tab?: EntryTab) => void;
  onOpenAddExpense?: () => void;
  onOpenAddIncome?: () => void;
  onOpenLendModal?: () => void;
}

export function MobileDrawer({
  isOpen,
  onClose,
  onOpenNewEntry,
  onOpenAddExpense,
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
    { name: "Wallet Settings", href: "/wallet-settings", icon: SlidersHorizontal },
    ...(isAdmin || pathname.startsWith("/admin")
      ? [{ name: "Admin Portal", href: "/admin", icon: Shield, adminOnly: true }]
      : []),
  ];

  const handleAction = () => {
    onClose();
    if (onOpenNewEntry) {
      onOpenNewEntry("EXPENSE");
    } else if (onOpenAddExpense) {
      onOpenAddExpense();
    }
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs bg-[#0B0F19]/95 backdrop-blur-2xl border-r border-white/10 p-6 flex flex-col justify-between h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-white text-base">
                Pocket<span className="text-cyan-400">Khata</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User info */}
          <div className="py-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center font-bold text-white shadow-inner">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {session?.user?.name || "PocketKhata User"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-slate-400 truncate">
                    {session?.user?.email}
                  </span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      ADMIN
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4">
            <button
              onClick={handleAction}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/25"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ New Transaction Entry</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-1">
            <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Navigation
            </p>
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition min-h-[44px] ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600/30 to-cyan-500/20 text-white font-semibold border border-indigo-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? "text-cyan-400"
                        : link.adminOnly
                        ? "text-purple-400"
                        : "text-slate-400"
                    }`}
                  />
                  <span className="flex-1">{link.name}</span>
                  {link.adminOnly && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      ADMIN
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Sign Out */}
        <div className="pt-4 border-t border-white/[0.08]">
          <button
            onClick={() =>
              session?.user
                ? signOut({ callbackUrl: "/login" })
                : (window.location.href = "/login")
            }
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
