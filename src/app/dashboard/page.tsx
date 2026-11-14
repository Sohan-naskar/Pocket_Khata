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
import { Sparkles, Plus, HandCoins } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();

  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [overdueLoans, setOverdueLoans] = useState<LoanItem[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      {({ onOpenNewEntry, refreshKey }) => {
        // Trigger fetch whenever refreshKey updates from any modal action
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (refreshKey > 0) {
            fetchDashboardData();
          }
        }, [refreshKey]);

        return (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Top Greeting & Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Hey, {session?.user?.name || "Hosteller"}!
                  </h1>
                  <span className="p-1 rounded-full bg-cyan-400/15 text-cyan-400 border border-cyan-400/30">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300/80 mt-0.5">
                  Real-time liquidity, daily day ledger, and peer Udhaar khata.
                </p>
              </div>

              {/* Neo-Fintech Header Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onOpenNewEntry("EXPENSE")}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98] min-h-[40px]"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ New Entry</span>
                </button>
                <button
                  onClick={() => onOpenNewEntry("LEND")}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-amber-300 border border-amber-400/30 hover:border-amber-400/50 text-xs font-semibold backdrop-blur-md transition-all active:scale-[0.98] min-h-[40px]"
                >
                  <HandCoins className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ Lend Udhaar</span>
                </button>
              </div>
            </div>

            {/* Overdue Udhaar Reminder Alert Banner (High visibility when due date reached) */}
            <OverdueAlertBanner
              overdueLoans={overdueLoans}
              onLoanCollected={() => fetchDashboardData()}
            />

            {/* Neo-Fintech Glass Hero Liquidity Cards */}
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
