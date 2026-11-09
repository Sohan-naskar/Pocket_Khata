"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { formatCurrency } from "@/lib/utils";
import { formatMonthYear } from "@/lib/date-utils";
import {
  BarChart3,
  Calendar,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Banknote,
  PieChart,
} from "lucide-react";

export default function AnalyticsPage() {
  const currentMonthYear = formatMonthYear(new Date());
  const [selectedMonthYear, setSelectedMonthYear] = useState(currentMonthYear);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate list of previous 12 months for selector
  const generateMonthOptions = () => {
    const options: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push(formatMonthYear(d));
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/analytics?monthYear=${selectedMonthYear}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonthYear]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const income = analytics?.totalIncome ?? 0;
  const spent = analytics?.totalSpent ?? 0;
  const saved = analytics?.totalSaved ?? 0;
  const savingsRate = analytics?.savingsRate ?? 0;
  const onlineSpent = analytics?.walletBreakdown?.onlineSpent ?? 0;
  const cashSpent = analytics?.walletBreakdown?.cashSpent ?? 0;
  const categoryBreakdown = analytics?.categoryBreakdown ?? [];

  return (
    <DashboardShell>
      {({ refreshKey }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (refreshKey > 0) {
            fetchAnalytics();
          }
        }, [refreshKey]);

        return (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header with Month-Year Picker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Monthly Financial Intelligence
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Compare Total Spent vs Total Saved for any month (MM-YYYY).
                </p>
              </div>

              {/* Month-Year Selector */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <label htmlFor="monthPicker" className="text-xs text-slate-400 font-medium">
                  Month (MM-YYYY):
                </label>
                <select
                  id="monthPicker"
                  value={selectedMonthYear}
                  onChange={(e) => setSelectedMonthYear(e.target.value)}
                  className="bg-transparent text-sm font-mono font-bold text-white outline-none cursor-pointer min-h-[44px]"
                >
                  {monthOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-slate-900 text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Spent vs Saved Core Hero Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Total Inflow */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span>Total Inflow (Income & Allowance)</span>
                </div>
                <p className="text-2xl sm:text-3xl font-financial font-extrabold text-white">
                  {formatCurrency(income)}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Total incoming money for {selectedMonthYear}
                </p>
              </div>

              {/* Total Spent */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-rose-950/40 to-[#111827] border border-rose-500/30 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 uppercase tracking-wider mb-2">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  <span>Total Spent (Expenses)</span>
                </div>
                <p className="text-2xl sm:text-3xl font-financial font-extrabold text-rose-400">
                  {formatCurrency(spent)}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  {income > 0 ? `${Math.round((spent / income) * 100)}% of total allowance` : "No income recorded"}
                </p>
              </div>

              {/* Total Saved */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-[#111827] border border-emerald-500/30 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                  <PiggyBank className="w-4 h-4 text-emerald-400" />
                  <span>Total Saved (Net Surplus)</span>
                </div>
                <p className="text-2xl sm:text-3xl font-financial font-extrabold text-emerald-400">
                  {formatCurrency(saved)}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Savings Rate: <strong className="text-emerald-300">{savingsRate}%</strong>
                </p>
              </div>
            </div>

            {/* Spent vs Saved Ratio Bar */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-base font-bold text-white">
                  Spending vs Savings Ratio
                </h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    Saved: {savingsRate}%
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    Spent: {Math.max(0, 100 - savingsRate)}%
                  </span>
                </div>
              </div>

              <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, 100 - savingsRate))}%` }}
                />
              </div>
            </div>

            {/* Wallet Usage Split & Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Wallet Usage Split */}
              <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-5">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Wallet Spending Split</h3>
                </div>

                <div className="space-y-4">
                  {/* Online UPI */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-blue-900/40">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-300">
                        <CreditCard className="w-3.5 h-3.5" />
                        Online UPI / Bank
                      </span>
                      <span className="font-financial text-sm font-bold text-blue-300">
                        {formatCurrency(onlineSpent)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full"
                        style={{
                          width: `${spent > 0 ? (onlineSpent / spent) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Cash */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-900/40">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                        <Banknote className="w-3.5 h-3.5" />
                        Physical Pocket Cash
                      </span>
                      <span className="font-financial text-sm font-bold text-emerald-300">
                        {formatCurrency(cashSpent)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{
                          width: `${spent > 0 ? (cashSpent / spent) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white">
                  Where Your Money Went (Categories)
                </h3>

                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 bg-slate-900 rounded animate-pulse" />
                    ))}
                  </div>
                ) : categoryBreakdown.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No expense categories recorded for {selectedMonthYear}.
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {categoryBreakdown.map((cat: any) => (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-300">
                            {cat.category}
                          </span>
                          <span className="font-financial font-semibold text-white">
                            {formatCurrency(cat.amount)} ({cat.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }}
    </DashboardShell>
  );
}

