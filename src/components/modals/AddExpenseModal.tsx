"use client";

import React, { useState } from "react";
import { X, CreditCard, Banknote, Loader2, ArrowDownCircle } from "lucide-react";
import { HOSTEL_EXPENSE_CATEGORIES, WalletType } from "@/types";
import { formatDateDDMMYYYY, toInputDateValue, inputToDDMMYYYY } from "@/lib/date-utils";
import { useToast } from "@/components/ui/Toast";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (data: any) => void;
}

export function AddExpenseModal({ isOpen, onClose, onSuccess }: AddExpenseModalProps) {
  const { success, error: toastError } = useToast();

  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState<WalletType>("ONLINE");
  const [category, setCategory] = useState<string>(HOSTEL_EXPENSE_CATEGORIES[0]);
  const [dateInput, setDateInput] = useState(toInputDateValue());
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toastError("Invalid Amount", "Please enter a valid expense amount greater than 0.");
      return;
    }

    setIsLoading(true);
    try {
      const dateStr = inputToDDMMYYYY(dateInput);

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "EXPENSE",
          wallet,
          amount: numAmount,
          category,
          description: description.trim() || `${category} expense`,
          dateStr,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toastError("Expense Error", data.error || "Failed to log expense.");
        setIsLoading(false);
        return;
      }

      success(
        "Expense Logged!",
        `₹${numAmount} deducted from ${wallet === "ONLINE" ? "Online (UPI)" : "Cash"} balance.`
      );

      // Reset form
      setAmount("");
      setDescription("");
      onSuccess(data);
      onClose();
    } catch {
      toastError("Network Error", "Unable to save expense. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Log Daily Expense</h2>
              <p className="text-xs text-slate-400">Deduct from Online UPI or Physical Cash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount */}
          <div>
            <label htmlFor="expense-amount" className="block text-xs font-medium text-slate-300 mb-1">
              Amount Spent (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-base font-bold">
                ₹
              </span>
              <input
                id="expense-amount"
                type="number"
                step="any"
                min="1"
                required
                autoFocus
                placeholder="120"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-lg font-mono font-bold text-white placeholder-slate-600 outline-none transition min-h-[44px]"
              />
            </div>
          </div>

          {/* Wallet Selector: Online vs Cash */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Paid From Wallet *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setWallet("ONLINE")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition min-h-[44px] ${
                  wallet === "ONLINE"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-400" />
                Online (UPI/Bank)
              </button>

              <button
                type="button"
                onClick={() => setWallet("CASH")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition min-h-[44px] ${
                  wallet === "CASH"
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-400" />
                Cash (Physical)
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="expense-category" className="block text-xs font-medium text-slate-300 mb-1">
              Category *
            </label>
            <select
              id="expense-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-rose-500 text-sm text-white outline-none min-h-[44px]"
            >
              {HOSTEL_EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker (DD-MM-YYYY format preview) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="expense-date" className="block text-xs font-medium text-slate-300 mb-1">
                Date (DD-MM-YYYY)
              </label>
              <input
                id="expense-date"
                type="date"
                required
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-rose-500 text-sm font-mono text-white outline-none min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Recorded Date Display
              </label>
              <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-300 flex items-center min-h-[44px]">
                {inputToDDMMYYYY(dateInput)}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="expense-desc" className="block text-xs font-medium text-slate-300 mb-1">
              Note / Description (Optional)
            </label>
            <input
              id="expense-desc"
              type="text"
              placeholder="e.g. Dinner with friends, supermarket groceries"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-rose-500 text-sm text-white placeholder-slate-600 outline-none min-h-[44px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-1/2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white text-sm font-semibold shadow-lg shadow-rose-600/30 transition min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Expense"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

