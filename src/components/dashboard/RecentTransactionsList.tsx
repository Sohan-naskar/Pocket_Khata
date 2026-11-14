"use client";

import React from "react";
import Link from "next/link";
import {
  ReceiptText,
  CreditCard,
  Banknote,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
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
    <div className="rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.1] p-5 sm:p-6 shadow-2xl transition-all duration-300 hover:border-cyan-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
            <ReceiptText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Recent Day Ledger</h3>
            <p className="text-xs text-slate-400 font-mono">Strict DD-MM-YYYY daily log</p>
          </div>
        </div>

        <Link
          href="/transactions"
          className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition min-h-[44px] px-2"
        >
          <span>View All Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-white/5 border border-white/[0.05] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-10 px-4">
          <p className="text-sm text-slate-300 font-medium">No transactions recorded yet.</p>
          <p className="text-xs text-slate-400 mt-1">
            Tap &ldquo;+ New Entry&rdquo; above to log your first hostel khata expense or income!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => {
            const isIncome = tx.type === "INCOME";
            const isOnline = tx.wallet === "ONLINE";

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-400/30 hover:bg-white/[0.06] transition-all duration-200"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">
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
                        className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                          isOnline
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {isOnline ? (
                          <>
                            <CreditCard className="w-2.5 h-2.5" />
                            <span>ONLINE</span>
                          </>
                        ) : (
                          <>
                            <Banknote className="w-2.5 h-2.5" />
                            <span>CASH</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="text-right shrink-0 pl-3">
                  <span
                    className={`text-sm sm:text-base font-bold font-financial tracking-tight ${
                      isIncome ? "text-emerald-400" : "text-white"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
