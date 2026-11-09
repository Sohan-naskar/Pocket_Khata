"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Wallet, Menu, Shield, User, LogOut, Calendar } from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/date-utils";

interface AppNavbarProps {
  onOpenMobileMenu: () => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenLendModal: () => void;
}

export function AppNavbar({
  onOpenMobileMenu,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenLendModal,
}: AppNavbarProps) {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session?.user as any)?.role || "USER";
  const todayStr = formatDateDDMMYYYY(new Date());

  return (
    <header className="sticky top-0 z-30 w-full bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group transition"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Hostel<span className="text-indigo-400">Khata</span>
                {userRole === "ADMIN" && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-0.5">
                    <Shield className="w-2.5 h-2.5" />
                    ADMIN
                  </span>
                )}
              </span>
            </div>
          </Link>
        </div>

        {/* Date Indicator in strict DD-MM-YYYY */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>Today: {todayStr}</span>
        </div>

        {/* Quick Actions & User Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition min-h-[44px]"
            >
              <span>- Spend</span>
            </button>
            <button
              onClick={onOpenAddIncome}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition min-h-[44px]"
            >
              <span>+ Income</span>
            </button>
            <button
              onClick={onOpenLendModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20 transition min-h-[44px]"
            >
              <span>+ Lend</span>
            </button>
          </div>

          {/* User profile dropdown button */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <Link
              href="/wallet-settings"
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition min-h-[44px]"
              title="Wallet & Profile Settings"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
                {session?.user?.name ? (
                  session.user.name.charAt(0).toUpperCase()
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <span className="hidden xl:inline text-xs font-medium text-slate-200 max-w-[120px] truncate">
                {session?.user?.name || "Hosteller"}
              </span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

