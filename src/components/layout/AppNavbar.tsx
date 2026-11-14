"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Wallet, Menu, Shield, User, LogOut, Calendar, Plus } from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/date-utils";
import { EntryTab } from "@/components/modals/UnifiedTransactionModal";

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
    <header className="sticky top-0 z-30 w-full bg-[#09090b]/85 backdrop-blur-xl border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-transparent hover:border-zinc-750 min-h-[44px] min-w-[44px] flex items-center justify-center transition"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group transition"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shadow-md group-hover:border-zinc-700 transition">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Pocket<span className="text-zinc-400">Khata</span>
                {(userRole === "ADMIN" || isOnAdmin) && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    ADMIN
                  </span>
                )}
              </span>
            </div>
          </Link>
        </div>

        {/* Date Indicator in strict DD-MM-YYYY (Skiper minimal badge) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-300">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span>{todayStr}</span>
        </div>

        {/* Header Action & User Profile Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Single High-Contrast Skiper Action Button (Replacing duplicated 3 buttons) */}
          <button
            onClick={handleAction}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold shadow-sm shadow-white/5 transition active:scale-[0.98] min-h-[40px]"
          >
            <Plus className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
            <span className="hidden sm:inline">New Entry</span>
            <span className="sm:hidden">Entry</span>
          </button>

          {/* User profile dropdown button */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
            <Link
              href={isOnAdmin ? "/admin" : "/wallet-settings"}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-850 transition min-h-[44px]"
              title={isOnAdmin ? (session?.user?.name || "Admin Portal") : "Wallet & Profile Settings"}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isOnAdmin
                    ? "bg-purple-500/20 border border-purple-500/40 text-purple-300"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200"
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
              <span className="hidden xl:inline text-xs font-medium text-zinc-300 max-w-[120px] truncate">
                {isOnAdmin ? session?.user?.name || "Admin" : session?.user?.name || "User"}
              </span>
            </Link>

            <button
              onClick={() =>
                session?.user
                  ? signOut({ callbackUrl: "/login" })
                  : (window.location.href = "/login")
              }
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-850 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
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
