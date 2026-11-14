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
            {/* Top Minimal Greeting Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Hey, {session?.user?.name || "Hosteller"}!
                  </h1>
                  <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                  Real-time liquidity, daily ledger, and peer Udhaar khata.
                </p>
              </div>

              {/* Header Action Buttons (Skiper Style) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenNewEntry("EXPENSE")}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold transition shadow-sm shadow-white/5 active:scale-[0.98] min-h-[40px]"
                >
                  <Plus className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
                  <span>+ New Entry</span>
                </button>
                <button
                  onClick={() => onOpenNewEntry("LEND")}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-800 hover:border-amber-500/40 text-xs font-semibold transition active:scale-[0.98] min-h-[40px]"
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

            {/* Skiper Hero Liquidity Card (Total Liquidity, Online UPI, Cash in Pocket & Calibration) */}
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
