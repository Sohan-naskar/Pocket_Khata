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
    <div className="rounded-2xl bg-[#111827] border border-slate-800 p-5 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">Monthly Summary</h3>
            <p className="text-xs text-slate-400">Period: {monthStr}</p>
          </div>
        </div>

        <Link
          href="/analytics"
          className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition min-h-[44px] px-2"
        >
          <span>Full Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          <div className="h-6 bg-slate-800 rounded animate-pulse" />
          <div className="h-10 bg-slate-800 rounded animate-pulse" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Spent vs Saved Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-900/40">
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium mb-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Total Spent</span>
              </div>
              <p className="text-lg sm:text-xl font-financial font-extrabold text-rose-400">
                {formatCurrency(spent)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-900/40">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-1">
                <PiggyBank className="w-3.5 h-3.5" />
                <span>Total Saved</span>
              </div>
              <p className="text-lg sm:text-xl font-financial font-extrabold text-emerald-400">
                {formatCurrency(saved)}
              </p>
            </div>
          </div>

          {/* Visual Ratio Bar */}
          <div>
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
              <span>Savings Rate: <strong className="text-white">{savingsRate}%</strong></span>
              <span>Total Inflow: <strong className="text-white">{formatCurrency(income)}</strong></span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
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
  );
}

