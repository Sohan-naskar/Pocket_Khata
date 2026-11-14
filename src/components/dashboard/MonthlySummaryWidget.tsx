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
    <div className="rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.1] p-5 sm:p-6 shadow-2xl transition-all duration-300 hover:border-cyan-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-cyan-300">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Monthly Summary</h3>
            <p className="text-xs text-slate-400 font-mono">Period: {monthStr}</p>
          </div>
        </div>

        <Link
          href="/analytics"
          className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition min-h-[44px] px-2"
        >
          <span>Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          <div className="h-6 bg-white/10 rounded-xl animate-pulse" />
          <div className="h-10 bg-white/10 rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Spent vs Saved Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-rose-500/20">
              <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="font-medium text-[11px]">Spent</span>
              </div>
              <p className="text-base sm:text-lg font-bold font-financial text-white">
                {formatCurrency(spent)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-1">
                <PiggyBank className="w-3.5 h-3.5" />
                <span className="font-medium text-[11px]">Saved</span>
              </div>
              <p className="text-base sm:text-lg font-bold font-financial text-white">
                {formatCurrency(saved)}
              </p>
            </div>
          </div>

          {/* Savings Rate Progress Indicator */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300">Monthly Savings Target</span>
              <span className="font-mono font-bold text-cyan-300">
                {savingsRate}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
              <span>Income: {formatCurrency(income)}</span>
              <span>Target: &ge;20%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
