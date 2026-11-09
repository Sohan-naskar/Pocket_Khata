"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { TransactionItem, WalletType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { formatDateDDMMYYYY } from "@/lib/date-utils";
import {
  ReceiptText,
  Search,
  Filter,
  CreditCard,
  Banknote,
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedWallet !== "ALL") params.append("wallet", selectedWallet);
      if (selectedType !== "ALL") params.append("type", selectedType);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Transactions fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedWallet, selectedType, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  return (
    <DashboardShell>
      {({ onOpenAddExpense, onOpenAddIncome, refreshKey }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (refreshKey > 0) {
            fetchTransactions();
          }
        }, [refreshKey]);

        return (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <ReceiptText className="w-4 h-4" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Day-to-Day Ledger
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Chronological financial record with strict DD-MM-YYYY date stamps.
                </p>
              </div>

              <div className="flex items-center gap-2">
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
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search chai, xerox, mess..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 text-sm text-white placeholder-slate-500 outline-none transition min-h-[44px]"
                  />
                </div>

                {/* Filter Wallet */}
                <div className="relative">
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 text-sm text-white outline-none min-h-[44px]"
                  >
                    <option value="ALL">All Wallets (UPI + Cash)</option>
                    <option value="ONLINE">Online Wallet (UPI / Bank)</option>
                    <option value="CASH">Cash Wallet (Physical)</option>
                  </select>
                </div>

                {/* Filter Type */}
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 text-sm text-white outline-none min-h-[44px]"
                  >
                    <option value="ALL">All Transaction Types</option>
                    <option value="EXPENSE">Expenses Only (-)</option>
                    <option value="INCOME">Income Only (+)</option>
                    <option value="LOAN_DISBURSEMENT">Udhaar Given</option>
                    <option value="LOAN_REPAYMENT">Udhaar Repaid</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transactions Feed / Responsive Table-to-Card */}
            <div className="rounded-2xl bg-[#111827] border border-slate-800 shadow-xl overflow-hidden">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-14 bg-slate-900 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <ReceiptText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-base font-semibold text-white">No ledger entries found</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Try adjusting your search terms or filters, or log an expense above.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View (>= 768px) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-4">Date (DD-MM-YYYY)</th>
                          <th className="py-3 px-4">Description</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Wallet</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-sm">
                        {transactions.map((tx) => {
                          const isIncome =
                            tx.type === "INCOME" || tx.type === "LOAN_REPAYMENT";
                          const isOnline = tx.wallet === "ONLINE";

                          return (
                            <tr
                              key={tx.id}
                              className="hover:bg-slate-800/40 transition"
                            >
                              <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                                {formatDateDDMMYYYY(tx.date)}
                              </td>
                              <td className="py-3.5 px-4 font-medium text-white max-w-xs truncate">
                                {tx.description || tx.category}
                              </td>
                              <td className="py-3.5 px-4 text-xs text-slate-400">
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                                  {tx.category}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                                    isOnline
                                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  }`}
                                >
                                  {isOnline ? (
                                    <>
                                      <CreditCard className="w-3 h-3" />
                                      Online UPI
                                    </>
                                  ) : (
                                    <>
                                      <Banknote className="w-3 h-3" />
                                      Cash
                                    </>
                                  )}
                                </span>
                              </td>
                              <td
                                className={`py-3.5 px-4 text-right font-financial font-extrabold ${
                                  isIncome ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {isIncome ? "+" : "-"}
                                {formatCurrency(tx.amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Stacked Card View (< 768px) with zero horizontal overflow */}
                  <div className="md:hidden divide-y divide-slate-800/80 p-2">
                    {transactions.map((tx) => {
                      const isIncome =
                        tx.type === "INCOME" || tx.type === "LOAN_REPAYMENT";
                      const isOnline = tx.wallet === "ONLINE";

                      return (
                        <div key={tx.id} className="p-3.5 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white truncate">
                                {tx.description || tx.category}
                              </p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">
                                {formatDateDDMMYYYY(tx.date)}
                              </p>
                            </div>
                            <span
                              className={`text-base font-financial font-extrabold shrink-0 ${
                                isIncome ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {isIncome ? "+" : "-"}
                              {formatCurrency(tx.amount)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                              {tx.category}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                                isOnline
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
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
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      }}
    </DashboardShell>
  );
}

