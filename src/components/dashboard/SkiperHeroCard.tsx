"use client";

import React, { useState } from "react";
import { Wallet, CreditCard, Banknote, Sliders, ArrowRightLeft, Sparkles } from "lucide-react";
import { WalletBalances } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { AdjustWalletModal } from "@/components/modals/AdjustWalletModal";

interface SkiperHeroCardProps {
  balances: WalletBalances | null;
  isLoading: boolean;
  onBalanceUpdated: () => void;
  onOpenNewEntry: (tab?: "EXPENSE" | "INCOME" | "LEND") => void;
}

export function SkiperHeroCard({
  balances,
  isLoading,
  onBalanceUpdated,
  onOpenNewEntry,
}: SkiperHeroCardProps) {
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  const total = balances?.totalBalance ?? 0;
  const online = balances?.onlineBalance ?? 0;
  const cash = balances?.cashBalance ?? 0;

  return (
    <>
      <div className="rounded-3xl border border-zinc-800 bg-[#121215] p-5 sm:p-7 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-zinc-700/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Financial Liquidity
            </div>

            <div className="flex items-baseline gap-2">
              {isLoading ? (
                <div className="h-10 w-44 bg-zinc-800 rounded-xl animate-pulse" />
              ) : (
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-financial tracking-tight text-white">
                  {formatCurrency(total)}
                </h2>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Combined real-time liquidity across your UPI Bank & Cash in Pocket.
            </p>
          </div>

          {/* Quick Action Buttons on Hero */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsAdjustOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 transition active:scale-[0.98]"
              title="Calibrate or set initial balances"
            >
              <Sliders className="w-3.5 h-3.5 text-zinc-400" />
              <span>Calibrate</span>
            </button>

            <button
              onClick={() => onOpenNewEntry("EXPENSE")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-lg shadow-white/10 active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ New Entry</span>
            </button>
          </div>
        </div>

        {/* Dual Wallet Split Bar (Online vs Cash in Pocket) */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Online Wallet Pill */}
          <div className="p-4 rounded-2xl border border-zinc-800/90 bg-zinc-950/60 flex items-center justify-between hover:border-zinc-700/70 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-zinc-400 block">Online Wallet</span>
                {isLoading ? (
                  <div className="h-6 w-24 bg-zinc-800 rounded animate-pulse mt-0.5" />
                ) : (
                  <span className="text-lg font-bold font-financial text-white block">
                    {formatCurrency(online)}
                  </span>
                )}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
              UPI LIVE
            </span>
          </div>

          {/* Cash in Pocket Pill */}
          <div className="p-4 rounded-2xl border border-zinc-800/90 bg-zinc-950/60 flex items-center justify-between hover:border-zinc-700/70 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-zinc-400 block">Cash in Hand</span>
                {isLoading ? (
                  <div className="h-6 w-24 bg-zinc-800 rounded animate-pulse mt-0.5" />
                ) : (
                  <span className="text-lg font-bold font-financial text-white block">
                    {formatCurrency(cash)}
                  </span>
                )}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              CASH
            </span>
          </div>
        </div>
      </div>

      <AdjustWalletModal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        currentOnline={online}
        currentCash={cash}
        onSuccess={() => onBalanceUpdated()}
      />
    </>
  );
}
