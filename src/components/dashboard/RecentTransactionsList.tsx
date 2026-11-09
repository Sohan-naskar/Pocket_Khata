"use client";

import React from "react";
import Link from "next/link";
import { ReceiptText, CreditCard, Banknote, ArrowRight, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { TransactionItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { formatDateDDMMYYYY } from "@/lib/date-utils";

interface RecentTransactionsListProps {
  transactions: TransactionItem[];
  isLoading: boolean;
}

export function RecentTransactionsList({
  transactions,
  isLoading,
}: RecentTransactionsListProps) {
  return (
    <div className="rounded-2xl bg-[#111827] border border-slate-800 p-5 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ReceiptText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">Recent Day Ledger</h3>
            <p className="text-xs text-slate-400">Strict DD-MM-YYYY daily log</p>
          </div>
        </div>

        <Link
          href="/transactions"
          className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition min-h-[44px] px-2"
        >
          <span>View All Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-10 px-4">
          <p className="text-sm text-slate-400">No transactions recorded yet.</p>
          <p className="text-xs text-slate-400 mt-1">
            Tap &ldquo;+ Add Expense&rdquo; or &ldquo;+ Add Income&rdquo; above to log your first hostel khata entry!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {transactions.map((tx) => {
            const isIncome = tx.type === "INCOME" || tx.type === "LOAN_REPAYMENT";
            const isOnline = tx.wallet === "ONLINE";

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {tx.description || tx.category}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-slate-400">
                        {tx.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        &bull; {formatDateDDMMYYYY(tx.date)}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold flex items-center gap-1 ${
                          isOnline
                            ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                            : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {isOnline ? (
                          <>
                            <CreditCard className="w-2.5 h-2.5" />
                            UPI
                          </>
                        ) : (
                          <>
                            <Banknote className="w-2.5 h-2.5" />
                            Cash
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="text-right shrink-0 ml-3">
                  <p
                    className={`text-sm sm:text-base font-financial font-extrabold ${
                      isIncome ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

