"use client";

import React, { useState } from "react";
import { Wallet, CreditCard, Banknote, Sliders, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
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
      {/* Skiper UI Hero Liquidity Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#111318] border border-white/[0.08] p-5 sm:p-7 shadow-2xl transition-all duration-300 hover:border-white/[0.12]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                Total Net Liquidity
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 mt-1.5">
              {isLoading ? (
                <div className="h-10 w-44 bg-zinc-800/80 rounded-lg animate-pulse" />
              ) : (
                <h2 className="text-3xl sm:text-4xl font-extrabold font-financial text-white tracking-tight">
                  {formatCurrency(total)}
                </h2>
              )}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Unified real-time balance across bank accounts, UPI & physical cash.
            </p>
          </div>

          {/* Quick Transfer / Calibrate Action */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsAdjustOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.09] text-zinc-200 border border-white/[0.08] transition active:scale-[0.98]"
              title="Calibrate or Adjust Balances"
            >
              <Sliders className="w-3.5 h-3.5 text-zinc-400" />
              <span>Calibrate Balances</span>
            </button>
          </div>
        </div>

        {/* Dual Wallet Breakdown Sub-Cards */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. Online (UPI / Bank) Cardlet */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06] hover:border-blue-500/30 transition-all duration-200 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-zinc-400">Online Wallet</p>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    UPI
                  </span>
                </div>
                {isLoading ? (
                  <div className="h-6 w-24 bg-zinc-800 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-lg font-bold font-financial text-blue-300 mt-0.5">
                    {formatCurrency(online)}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-semibold text-zinc-400">
                {onlinePct}%
              </span>
              <p className="text-[10px] text-zinc-500">GPay • Paytm</p>
            </div>
          </div>

          {/* 2. Cash in Pocket Cardlet */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-200 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-zinc-400">Cash in Pocket</p>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    CASH
                  </span>
                </div>
                {isLoading ? (
                  <div className="h-6 w-24 bg-zinc-800 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-lg font-bold font-financial text-emerald-300 mt-0.5">
                    {formatCurrency(cash)}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-semibold text-zinc-400">
                {cashPct}%
              </span>
              <p className="text-[10px] text-zinc-500">Pocket Notes</p>
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
