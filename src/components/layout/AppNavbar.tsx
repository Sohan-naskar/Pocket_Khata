"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Wallet, Menu, Shield, User, LogOut, Calendar, Plus } from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/date-utils";
import { EntryTab } from "@/components/modals/UnifiedTransactionModal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface AppNavbarProps {
  onOpenMobileMenu: () => void;
  onOpenNewEntry?: (tab?: EntryTab) => void;
  onOpenAddExpense?: () => void;
  onOpenAddIncome?: () => void;
  onOpenLendModal?: () => void;
}

export function AppNavbar({
  onOpenMobileMenu,
  onOpenNewEntry,
  onOpenAddExpense,
}: AppNavbarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isOnAdmin = pathname.startsWith("/admin");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session?.user as any)?.role || "USER";
  const todayStr = formatDateDDMMYYYY(new Date());

  const handleAction = () => {
    if (onOpenNewEntry) {
      onOpenNewEntry("EXPENSE");
    } else if (onOpenAddExpense) {
      onOpenAddExpense();
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0B0F19]/75 dark:bg-[#0B0F19]/75 backdrop-blur-xl border-b border-white/[0.08] dark:border-white/[0.08] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/10 border border-transparent hover:border-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center transition"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group transition"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1">
                Pocket<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Khata</span>
                {(userRole === "ADMIN" || isOnAdmin) && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    ADMIN
                  </span>
                )}
              </span>
            </div>
          </Link>
        </div>

        {/* Date Indicator in strict DD-MM-YYYY (Glass badge) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 backdrop-blur-md">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>{todayStr}</span>
        </div>

        {/* Right Actions: Theme Toggle, + New Entry, and User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle (Light / Dark) */}
          <ThemeToggle />

          {/* Neo-Fintech Glass Action Button */}
          <button
            onClick={handleAction}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-[0.98] min-h-[40px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Entry</span>
            <span className="sm:hidden">Entry</span>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/[0.08]">
            <Link
              href={isOnAdmin ? "/admin" : "/wallet-settings"}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/[0.06] transition min-h-[44px]"
              title={isOnAdmin ? (session?.user?.name || "Admin Portal") : "Wallet & Profile Settings"}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                  isOnAdmin
                    ? "bg-purple-500/20 border border-purple-500/40 text-purple-300"
                    : "bg-white/[0.08] border border-white/[0.12] text-white shadow-sm"
                }`}
              >
                {session?.user?.name ? (
                  session.user.name.charAt(0).toUpperCase()
                ) : isOnAdmin ? (
                  "A"
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="hidden xl:inline text-xs font-medium text-slate-200 max-w-[120px] truncate">
                {isOnAdmin ? session?.user?.name || "Admin" : session?.user?.name || "User"}
              </span>
            </Link>

            <button
              onClick={() =>
                session?.user
                  ? signOut({ callbackUrl: "/login" })
                  : (window.location.href = "/login")
              }
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              title={session?.user ? "Sign Out" : "Exit to Login"}
              aria-label={session?.user ? "Sign Out" : "Exit to Login"}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
