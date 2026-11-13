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
    <div className="rounded-3xl bg-[#121215] border border-zinc-800 p-5 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <ReceiptText className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Recent Day Ledger</h3>
            <p className="text-xs text-zinc-400">Strict DD-MM-YYYY daily log</p>
          </div>
        </div>

        <Link
          href="/transactions"
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition min-h-[40px] px-2.5 py-1.5 rounded-xl hover:bg-zinc-850"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-zinc-900/60 border border-zinc-850 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-10 px-4">
          <p className="text-sm text-zinc-400 font-medium">No transactions recorded yet.</p>
          <p className="text-xs text-zinc-500 mt-1">
            Tap &ldquo;+ New Entry&rdquo; to log your first daily khata expense or income!
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
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/70 hover:border-zinc-700/80 hover:bg-zinc-900/80 transition"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {tx.description || tx.category}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-zinc-400">
                        {tx.category}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        &bull; {formatDateDDMMYYYY(tx.date)}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                          isOnline
                            ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
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
