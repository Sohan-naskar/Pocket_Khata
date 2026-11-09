"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { WalletCards } from "@/components/dashboard/WalletCards";
import { OverdueAlertBanner } from "@/components/dashboard/OverdueAlertBanner";
import { MonthlySummaryWidget } from "@/components/dashboard/MonthlySummaryWidget";
import { RecentTransactionsList } from "@/components/dashboard/RecentTransactionsList";
import { WalletBalances, TransactionItem, LoanItem } from "@/types";
import { isOverdue } from "@/lib/date-utils";
import { TrendingDown, TrendingUp, HandCoins, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();

  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [overdueLoans, setOverdueLoans] = useState<LoanItem[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [walletRes, loansRes, analyticsRes, txRes] = await Promise.all([
        fetch("/api/wallet"),
        fetch("/api/loans"),
        fetch("/api/analytics"),
        fetch("/api/transactions?limit=6"),
      ]);

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setBalances(walletData);
      }

      if (loansRes.ok) {
        const loansData: LoanItem[] = await loansRes.json();
        const overdue = loansData.filter(
          (loan) => loan.status === "PENDING" && isOverdue(loan.dueDate)
        );
        setOverdueLoans(overdue);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      if (txRes.ok) {
        const txData = await txRes.json();
        setRecentTransactions(txData);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <DashboardShell>
      {({ onOpenAddExpense, onOpenAddIncome, onOpenLendModal, refreshKey }) => {
        // Trigger fetch whenever refreshKey updates from any modal action
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (refreshKey > 0) {
            fetchDashboardData();
          }
        }, [refreshKey]);

        return (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Top Greeting & Action Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Hey, {session?.user?.name || "Hosteller"}!
                  </h1>
                  <span className="p-1 rounded-full bg-indigo-500/10 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Here is your live Online vs Cash balance and daily Khata summary.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={onOpenAddExpense}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition min-h-[44px]"
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>- Log Expense</span>
                </button>
                <button
                  onClick={onOpenAddIncome}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition min-h-[44px]"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>+ Add Money</span>
                </button>
                <button
                  onClick={onOpenLendModal}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20 transition min-h-[44px]"
                >
                  <HandCoins className="w-4 h-4" />
                  <span>+ Lend Udhaar</span>
                </button>
              </div>
            </div>

            {/* Overdue Udhaar Reminder Alert Banner (High visibility when due date reached) */}
            <OverdueAlertBanner
              overdueLoans={overdueLoans}
              onLoanCollected={() => fetchDashboardData()}
            />

            {/* Dual Wallet Live Summary Cards (Total, Online, Cash) */}
            <WalletCards
              balances={balances}
              isLoading={isLoading}
              onBalanceUpdated={() => fetchDashboardData()}
            />

            {/* Split Grid: Monthly Analytics Widget & Recent Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <MonthlySummaryWidget
                  analytics={analytics}
                  isLoading={isLoading}
                />
              </div>

              <div className="lg:col-span-2">
                <RecentTransactionsList
                  transactions={recentTransactions}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        );
      }}
    </DashboardShell>
  );
}

