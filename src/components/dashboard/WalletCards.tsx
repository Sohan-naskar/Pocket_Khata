"use client";

import React, { useState } from "react";
import { Wallet, CreditCard, Banknote, Sliders, ArrowUpRight, ArrowDownRight } from "lucide-react";
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

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Total Balance */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-[#0B101E] border border-indigo-500/30 p-5 sm:p-6 shadow-xl shadow-indigo-950/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                  Total Net Balance
                </p>
                <p className="text-[11px] text-slate-400">Online + Cash Unified</p>
              </div>
            </div>

            <button
              onClick={() => setIsAdjustOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Calibrate Balances"
              aria-label="Calibrate Balances"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2">
            {isLoading ? (
              <div className="h-9 w-36 bg-slate-800 rounded animate-pulse" />
            ) : (
              <h3 className="text-2xl sm:text-3xl font-financial font-extrabold text-white tracking-tight">
                {formatCurrency(total)}
              </h3>
            )}
            <div className="flex items-center gap-1.5 mt-2 text-xs text-indigo-300">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-400" />
              <span>Real-time Net Worth</span>
            </div>
          </div>
        </div>

        {/* Card 2: Online Balance (UPI / Bank) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950/80 via-slate-900 to-[#0B101E] border border-blue-500/30 p-5 sm:p-6 shadow-xl shadow-blue-950/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Online Balance
                </p>
                <p className="text-[11px] text-slate-400">UPI, GPay, Bank A/C</p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              UPI LIVE
            </span>
          </div>

          <div className="mt-2">
            {isLoading ? (
              <div className="h-9 w-36 bg-slate-800 rounded animate-pulse" />
            ) : (
              <h3 className="text-2xl sm:text-3xl font-financial font-extrabold text-blue-300 tracking-tight">
                {formatCurrency(online)}
              </h3>
            )}
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>Primary for shopping & dining</span>
              <span className="font-mono text-blue-400 font-semibold">
                {total > 0 ? `${Math.round((online / total) * 100)}%` : "0%"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Cash Balance (Physical) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-[#0B101E] border border-emerald-500/30 p-5 sm:p-6 shadow-xl shadow-emerald-950/40 sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                  Cash Balance
                </p>
                <p className="text-[11px] text-slate-400">Pocket & Wallet Notes</p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              PHYSICAL
            </span>
          </div>

          <div className="mt-2">
            {isLoading ? (
              <div className="h-9 w-36 bg-slate-800 rounded animate-pulse" />
            ) : (
              <h3 className="text-2xl sm:text-3xl font-financial font-extrabold text-emerald-300 tracking-tight">
                {formatCurrency(cash)}
              </h3>
            )}
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>Groceries, chai & transport</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {total > 0 ? `${Math.round((cash / total) * 100)}%` : "0%"}
              </span>
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

