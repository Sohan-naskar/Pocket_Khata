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
  Phone,
  Mail,
  TrendingDown,
  TrendingUp,
  PlusCircle,
} from "lucide-react";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenLendModal: () => void;
}

export function MobileDrawer({
  isOpen,
  onClose,
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
    { name: "Day-to-Day Ledger", href: "/transactions", icon: ReceiptText },
    { name: "Udhaar Tracker", href: "/udhaar", icon: HandCoins },
    { name: "Monthly Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Wallet & Profile", href: "/wallet-settings", icon: SlidersHorizontal },
    ...(isAdmin
      ? [{ name: "Admin Portal", href: "/admin", icon: Shield, adminOnly: true }]
      : []),
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs bg-[#0B101E] border-r border-slate-800 p-6 flex flex-col justify-between h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">HostelKhata</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="py-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-400">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {session?.user?.name || "Hostel Student"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-slate-400 truncate">
                    {session?.user?.email}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isAdmin
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
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
                      ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
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

          {/* Mobile Quick Action Buttons */}
          <div className="pt-2 pb-4 space-y-2 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Fast Logging
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenAddExpense();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-900 border border-rose-900/40 text-rose-300 text-xs font-semibold min-h-[44px]"
            >
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>- Log Expense</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAddIncome();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-900 border border-emerald-900/40 text-emerald-300 text-xs font-semibold min-h-[44px]"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>+ Add Income</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenLendModal();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-900 border border-amber-900/40 text-amber-300 text-xs font-semibold min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>+ Lend Udhaar</span>
            </button>
          </div>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <a
              href="tel:+918000000000"
              className="flex items-center gap-1.5 hover:text-indigo-400 transition min-h-[44px]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Hostel Support</span>
            </a>
            <a
              href="mailto:support@hostelkhata.app"
              className="flex items-center gap-1.5 hover:text-indigo-400 transition min-h-[44px]"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-600/15 border border-rose-600/30 text-rose-300 text-xs font-semibold hover:bg-rose-600/25 transition min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

