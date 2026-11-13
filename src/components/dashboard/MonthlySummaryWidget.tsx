"use client";

import React from "react";
import Link from "next/link";
import { BarChart3, TrendingDown, PiggyBank, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MonthlySummaryWidgetProps {
  analytics: {
    monthYear: string;
    totalIncome: number;
    totalSpent: number;
    totalSaved: number;
    savingsRate: number;
  } | null;
  isLoading: boolean;
}

export function MonthlySummaryWidget({
  analytics,
  isLoading,
}: MonthlySummaryWidgetProps) {
  const income = analytics?.totalIncome ?? 0;
  const spent = analytics?.totalSpent ?? 0;
  const saved = analytics?.totalSaved ?? 0;
  const savingsRate = analytics?.savingsRate ?? 0;
  const monthStr = analytics?.monthYear || "This Month";

  return (
    <div className="rounded-3xl bg-[#121215] border border-zinc-800 p-5 sm:p-6 shadow-xl h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Monthly Summary</h3>
              <p className="text-xs text-zinc-400">Period: {monthStr}</p>
            </div>
          </div>

          <Link
            href="/analytics"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition min-h-[40px] px-2.5 py-1.5 rounded-xl hover:bg-zinc-850"
          >
            <span>Analytics</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <div className="h-16 bg-zinc-900/60 border border-zinc-850 rounded-2xl animate-pulse" />
            <div className="h-10 bg-zinc-900/60 border border-zinc-850 rounded-2xl animate-pulse" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Spent vs Saved Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium mb-1">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  <span>Total Spent</span>
                </div>
                <p className="text-base sm:text-lg font-financial font-extrabold text-rose-400">
                  {formatCurrency(spent)}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium mb-1">
                  <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Total Saved</span>
                </div>
                <p className="text-base sm:text-lg font-financial font-extrabold text-emerald-400">
                  {formatCurrency(saved)}
                </p>
              </div>
            </div>

            {/* Visual Ratio Bar */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
              <div className="flex justify-between items-center text-xs text-zinc-400 mb-2">
                <span>Savings Rate: <strong className="text-white font-mono">{savingsRate}%</strong></span>
                <span>Inflow: <strong className="text-white font-financial">{formatCurrency(income)}</strong></span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
                  title={`Saved: ${savingsRate}%`}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, 100 - savingsRate))}%` }}
                  title={`Spent: ${100 - savingsRate}%`}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
        <span>Auto-categorized ledger</span>
        <span className="font-mono text-zinc-400">Updated Real-Time</span>
      </div>
    </div>
  );
}
