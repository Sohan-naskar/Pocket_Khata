"use client";

import React, { useState } from "react";
import { CreditCard, Banknote, Sliders, Wifi, Sparkles } from "lucide-react";
import { WalletBalances } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { AdjustWalletModal } from "@/components/modals/AdjustWalletModal";

interface WalletCardsProps {
  balances: WalletBalances | null;
  isLoading: boolean;
  onBalanceUpdated: () => void;
}

export function WalletCards({
  balances,
  isLoading,
  onBalanceUpdated,
}: WalletCardsProps) {
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  const total = balances?.totalBalance ?? 0;
  const online = balances?.onlineBalance ?? 0;
  const cash = balances?.cashBalance ?? 0;

  const onlinePct = total > 0 ? Math.round((online / total) * 100) : 0;
  const cashPct = total > 0 ? Math.round((cash / total) * 100) : 0;

  return (
    <>
      {/* Neo-Fintech Glass Hero Liquidity Section */}
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.04] dark:bg-white/[0.04] backdrop-blur-2xl border border-white/[0.1] dark:border-white/[0.1] p-5 sm:p-7 shadow-2xl transition-all duration-300 hover:border-cyan-500/30 group">
        {/* Subtle Ambient Radial Highlight on Card */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400/50" />
              <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider font-mono">
                Total Net Liquidity
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 mt-1.5">
              {isLoading ? (
                <div className="h-10 w-48 bg-white/10 rounded-xl animate-pulse" />
              ) : (
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-financial text-white tracking-tight">
                  {formatCurrency(total)}
                </h2>
              )}
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Live Cloud Sync
              </span>
            </div>
            <p className="text-xs text-slate-300/80 mt-1">
              Real-time combined balance across UPI banks & in-hand pocket cash.
            </p>
          </div>

          {/* Quick Balance Calibration Glass Pill */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsAdjustOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/[0.15] backdrop-blur-md transition-all active:scale-[0.98] shadow-sm hover:border-cyan-400/40"
              title="Calibrate or set initial balances"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Calibrate Balances</span>
            </button>
          </div>
        </div>

        {/* Neo-Fintech Dual Wallet Cards (Digital UPI Card vs Cash Passbook) */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          
          {/* Card 1: Online Digital Debit / UPI Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/40 via-slate-900/50 to-cyan-900/30 border border-cyan-500/20 backdrop-blur-xl hover:border-cyan-400/50 transition-all duration-300 shadow-lg relative overflow-hidden group/card">
            {/* Contactless & Chip Visual */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 rounded-md bg-gradient-to-tr from-amber-300/80 to-amber-200/90 border border-amber-300/40 shadow-inner" />
                <Wifi className="w-4 h-4 text-cyan-300/80 rotate-90" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 shadow-sm">
                ONLINE UPI
              </span>
            </div>

            {/* Online Balance */}
            <div className="mt-4">
              <span className="text-[11px] font-medium text-slate-300 block">UPI Bank Accounts</span>
              {isLoading ? (
                <div className="h-7 w-28 bg-white/10 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold font-financial text-white tracking-tight mt-0.5">
                  {formatCurrency(online)}
                </p>
              )}
            </div>

            {/* Bottom Details & Progress */}
            <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-300/80">GPay • PhonePe • Paytm</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${onlinePct}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-cyan-300 text-xs">{onlinePct}%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Cash in Pocket (Physical Cash Passbook) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/50 to-teal-900/30 border border-emerald-500/20 backdrop-blur-xl hover:border-emerald-400/50 transition-all duration-300 shadow-lg relative overflow-hidden group/card">
            {/* Cash Icon & Badge */}
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Banknote className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 shadow-sm">
                PHYSICAL CASH
              </span>
            </div>

            {/* Cash Balance */}
            <div className="mt-4">
              <span className="text-[11px] font-medium text-slate-300 block">Cash in Wallet / Pocket</span>
              {isLoading ? (
                <div className="h-7 w-28 bg-white/10 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold font-financial text-white tracking-tight mt-0.5">
                  {formatCurrency(cash)}
                </p>
              )}
            </div>

            {/* Bottom Details & Progress */}
            <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-300/80">Chai, Xerox, Canteen & Autos</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${cashPct}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-emerald-300 text-xs">{cashPct}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Adjust Modal */}
      <AdjustWalletModal
        currentBalances={balances}
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        onSuccess={() => onBalanceUpdated()}
      />
    </>
  );
}
