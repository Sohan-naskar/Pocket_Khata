"use client";

import React, { useState } from "react";
import { X, CreditCard, Banknote, Loader2, ArrowUpCircle } from "lucide-react";
import { HOSTEL_INCOME_CATEGORIES, WalletType } from "@/types";
import { toInputDateValue, inputToDDMMYYYY } from "@/lib/date-utils";
import { useToast } from "@/components/ui/Toast";

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (data: any) => void;
}

export function AddIncomeModal({ isOpen, onClose, onSuccess }: AddIncomeModalProps) {
  const { success, error: toastError } = useToast();

  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState<WalletType>("ONLINE");
  const [category, setCategory] = useState<string>(HOSTEL_INCOME_CATEGORIES[0]);
  const [dateInput, setDateInput] = useState(toInputDateValue());
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toastError("Invalid Amount", "Please enter a valid income amount greater than 0.");
      return;
    }

    setIsLoading(true);
    try {
      const dateStr = inputToDDMMYYYY(dateInput);

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "INCOME",
          wallet,
          amount: numAmount,
          category,
          description: description.trim() || `${category} received`,
          dateStr,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toastError("Income Error", data.error || "Failed to add money.");
        setIsLoading(false);
        return;
      }

      success(
        "Income Recorded!",
        `₹${numAmount} credited to ${wallet === "ONLINE" ? "Online (UPI)" : "Cash"} balance.`
      );

      // Reset form
      setAmount("");
      setDescription("");
      onSuccess(data);
      onClose();
    } catch {
      toastError("Network Error", "Unable to save income. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add Money (Income)</h2>
              <p className="text-xs text-slate-400">Credit to Online UPI or Physical Pocket</p>
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
            <label htmlFor="income-amount" className="block text-xs font-medium text-slate-300 mb-1">
              Amount Received (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-base font-bold">
                ₹
              </span>
              <input
                id="income-amount"
                type="number"
                step="any"
                min="1"
                required
                autoFocus
                placeholder="2000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-lg font-mono font-bold text-white placeholder-slate-600 outline-none transition min-h-[44px]"
              />
            </div>
          </div>

          {/* Wallet Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Deposit Into Wallet *
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
            <label htmlFor="income-category" className="block text-xs font-medium text-slate-300 mb-1">
              Source / Category *
            </label>
            <select
              id="income-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-sm text-white outline-none min-h-[44px]"
            >
              {HOSTEL_INCOME_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker (DD-MM-YYYY preview) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="income-date" className="block text-xs font-medium text-slate-300 mb-1">
                Date (DD-MM-YYYY)
              </label>
              <input
                id="income-date"
                type="date"
                required
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-sm font-mono text-white outline-none min-h-[44px]"
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

          {/* Note / Description */}
          <div>
            <label htmlFor="income-desc" className="block text-xs font-medium text-slate-300 mb-1">
              Note (Optional)
            </label>
            <input
              id="income-desc"
              type="text"
              placeholder="e.g. Monthly salary deposit, freelance project payment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-sm text-white placeholder-slate-600 outline-none min-h-[44px]"
            />
          </div>

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
              className="w-1/2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Crediting...
                </>
              ) : (
                "Add to Balance"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

