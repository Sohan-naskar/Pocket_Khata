"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  Banknote,
  Loader2,
  TrendingDown,
  TrendingUp,
  HandCoins,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { HOSTEL_EXPENSE_CATEGORIES, HOSTEL_INCOME_CATEGORIES, WalletType } from "@/types";
import { toInputDateValue, inputToDDMMYYYY } from "@/lib/date-utils";
import { useToast } from "@/components/ui/Toast";

export type EntryTabType = "EXPENSE" | "INCOME" | "LEND";

interface UnifiedTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: EntryTabType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (data?: any) => void;
}

export function UnifiedTransactionModal({
  isOpen,
  onClose,
  defaultTab = "EXPENSE",
  onSuccess,
}: UnifiedTransactionModalProps) {
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<EntryTabType>(defaultTab);
  const [wallet, setWallet] = useState<WalletType>("ONLINE");
  const [amount, setAmount] = useState("");
  const [dateInput, setDateInput] = useState(toInputDateValue());
  const [category, setCategory] = useState<string>(HOSTEL_EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Lend-specific fields
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerPhone, setBorrowerPhone] = useState("");
  const [borrowerEmail, setBorrowerEmail] = useState("");
  const [dueDateInput, setDueDateInput] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return toInputDateValue(d);
  });
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setAmount("");
      setDescription("");
      setNotes("");
      setBorrowerName("");
      setBorrowerPhone("");
      setBorrowerEmail("");
      setDateInput(toInputDateValue());
      setCategory(
        defaultTab === "INCOME"
          ? HOSTEL_INCOME_CATEGORIES[0]
          : HOSTEL_EXPENSE_CATEGORIES[0]
      );
    }
  }, [isOpen, defaultTab]);

  const handleTabChange = (tab: EntryTabType) => {
    setActiveTab(tab);
    if (tab === "EXPENSE") {
      setCategory(HOSTEL_EXPENSE_CATEGORIES[0]);
    } else if (tab === "INCOME") {
      setCategory(HOSTEL_INCOME_CATEGORIES[0]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toastError("Invalid Amount", "Please enter a valid amount greater than ₹0.");
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === "LEND") {
        if (!borrowerName.trim()) {
          toastError("Missing Name", "Please enter the borrower's name.");
          setIsLoading(false);
          return;
        }

        const cleanPhone = borrowerPhone.replace(/[^0-9]/g, "");
        if (cleanPhone.length < 10) {
          toastError("Invalid Phone", "Please enter a valid 10-digit mobile number.");
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/loans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            borrowerName: borrowerName.trim(),
            borrowerPhone: cleanPhone,
            borrowerEmail: borrowerEmail.trim() || undefined,
            amount: numAmount,
            wallet,
            lentDateStr: inputToDDMMYYYY(dateInput),
            dueDateStr: inputToDDMMYYYY(dueDateInput),
            notes: notes.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          toastError("Lending Error", data.error || "Failed to log loan.");
          setIsLoading(false);
          return;
        }

        success(
          "Udhaar Recorded",
          `₹${numAmount.toLocaleString("en-IN")} lent to ${borrowerName} from ${
            wallet === "ONLINE" ? "Online" : "Cash"
          } wallet.`
        );
        onSuccess(data);
        onClose();
      } else {
        // EXPENSE or INCOME
        const dateStr = inputToDDMMYYYY(dateInput);
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: activeTab,
            wallet,
            amount: numAmount,
            category,
            description:
              description.trim() ||
              (activeTab === "EXPENSE" ? `${category} expense` : `${category} credit`),
            dateStr,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          toastError(
            activeTab === "EXPENSE" ? "Expense Failed" : "Income Failed",
            data.error || "Failed to log transaction."
          );
          setIsLoading(false);
          return;
        }

        success(
          activeTab === "EXPENSE" ? "Expense Logged" : "Money Added",
          `₹${numAmount.toLocaleString("en-IN")} ${
            activeTab === "EXPENSE" ? "debited from" : "credited to"
          } ${wallet === "ONLINE" ? "Online" : "Cash"} wallet.`
        );
        onSuccess(data);
        onClose();
      }
    } catch {
      toastError("Network Error", "Unable to reach server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-[#121215] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden relative"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                New Transaction Entry
              </h3>
              <p className="text-[11px] text-zinc-400">
                Log spends, credits, or peer udhaar into your ledger
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Skiper Segmented Tab Switcher */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 border border-zinc-800/80 rounded-2xl text-xs font-semibold relative">
            <button
              type="button"
              onClick={() => handleTabChange("EXPENSE")}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 relative ${
                activeTab === "EXPENSE"
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              <span>Expense</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("INCOME")}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 relative ${
                activeTab === "INCOME"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Income</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("LEND")}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 relative ${
                activeTab === "LEND"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <HandCoins className="w-3.5 h-3.5 text-amber-400" />
              <span>Lend Udhaar</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {/* Amount Input Hero */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              {activeTab === "EXPENSE"
                ? "Expense Amount"
                : activeTab === "INCOME"
                ? "Credit Amount"
                : "Money Lent (Udhaar)"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xl font-bold font-mono text-zinc-500 pointer-events-none">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-xl sm:text-2xl font-bold font-financial text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
              />
            </div>
          </div>

          {/* Wallet Selector (Online vs Cash) */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              {activeTab === "INCOME" ? "Deposit To Wallet" : "Deduct From Wallet"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWallet("ONLINE")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-semibold transition ${
                  wallet === "ONLINE"
                    ? "bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-sm"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>Online (UPI / Bank)</span>
              </button>

              <button
                type="button"
                onClick={() => setWallet("CASH")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-semibold transition ${
                  wallet === "CASH"
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>Cash in Pocket</span>
              </button>
            </div>
          </div>

          {/* Dynamic Section for EXPENSE & INCOME vs LEND */}
          {activeTab !== "LEND" ? (
            <>
              {/* Category Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-500 transition"
                >
                  {(activeTab === "EXPENSE"
                    ? HOSTEL_EXPENSE_CATEGORIES
                    : HOSTEL_INCOME_CATEGORIES
                  ).map((cat) => (
                    <option key={cat} value={cat} className="bg-zinc-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note / Description */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Description / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder={
                    activeTab === "EXPENSE"
                      ? "e.g. Canteen lunch, Chai split, Xerox photocopy"
                      : "e.g. Monthly allowance from parents, freelance project"
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Transaction Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* LEND UDHAAR SPECIFIC FIELDS */}
              <div className="space-y-3">
                {/* Borrower Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Borrower Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rohit Sen, Aman Sharma"
                      value={borrowerName}
                      onChange={(e) => setBorrowerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
                    />
                  </div>
                </div>

                {/* Borrower Phone */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Phone (for 1-tap WhatsApp reminder)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={borrowerPhone}
                      onChange={(e) => setBorrowerPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
                    />
                  </div>
                </div>

                {/* Return Due Date */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Lent Date
                    </label>
                    <input
                      type="date"
                      required
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-white focus:outline-none focus:border-zinc-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Expected Return Date
                    </label>
                    <input
                      type="date"
                      required
                      value={dueDateInput}
                      onChange={(e) => setDueDateInput(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-white focus:outline-none focus:border-zinc-500 transition"
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Reason / Item Lent (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mess fees advance, Weekend dinner split"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === "EXPENSE"
                  ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
                  : activeTab === "INCOME"
                  ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20"
                  : "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>
                  {activeTab === "EXPENSE"
                    ? "Log Expense"
                    : activeTab === "INCOME"
                    ? "Save Income"
                    : "Confirm Udhaar"}
                </span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

