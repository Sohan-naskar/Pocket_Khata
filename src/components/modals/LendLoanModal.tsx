"use client";

import React, { useState } from "react";
import { X, CreditCard, Banknote, Loader2, HandCoins, User, Phone, Mail, Calendar } from "lucide-react";
import { WalletType } from "@/types";
import { toInputDateValue, inputToDDMMYYYY } from "@/lib/date-utils";
import { useToast } from "@/components/ui/Toast";

interface LendLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (data: any) => void;
}

export function LendLoanModal({ isOpen, onClose, onSuccess }: LendLoanModalProps) {
  const { success, error: toastError } = useToast();

  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerPhone, setBorrowerPhone] = useState("");
  const [borrowerEmail, setBorrowerEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState<WalletType>("ONLINE");

  // Default lent date today; default return date in 3 days
  const today = new Date();
  const returnDefault = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

  const [lentDateInput, setLentDateInput] = useState(toInputDateValue(today));
  const [dueDateInput, setDueDateInput] = useState(toInputDateValue(returnDefault));
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!borrowerName.trim()) {
      toastError("Missing Name", "Please enter the borrower's name.");
      return;
    }

    if (!borrowerPhone.trim() || borrowerPhone.replace(/[^0-9]/g, "").length < 10) {
      toastError("Invalid Phone", "Please enter a valid 10-digit mobile number.");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toastError("Invalid Amount", "Please enter a valid loan amount greater than 0.");
      return;
    }

    setIsLoading(true);
    try {
      const lentDateStr = inputToDDMMYYYY(lentDateInput);
      const dueDateStr = inputToDDMMYYYY(dueDateInput);

      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrowerName: borrowerName.trim(),
          borrowerPhone: borrowerPhone.trim(),
          borrowerEmail: borrowerEmail.trim() || undefined,
          amount: numAmount,
          wallet,
          lentDateStr,
          dueDateStr,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toastError("Loan Error", data.error || "Failed to record loan.");
        setIsLoading(false);
        return;
      }

      success(
        "Udhaar Recorded!",
        `₹${numAmount} lent to ${borrowerName.trim()} (deducted from ${wallet === "ONLINE" ? "Online UPI" : "Cash"}).`
      );

      // Reset form
      setBorrowerName("");
      setBorrowerPhone("");
      setBorrowerEmail("");
      setAmount("");
      setNotes("");
      onSuccess(data);
      onClose();
    } catch {
      toastError("Network Error", "Unable to save Udhaar record.");
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

      <div className="relative w-full max-w-lg bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Lend Money (Udhaar)</h2>
              <p className="text-xs text-slate-400">Track borrower, due date & automated alerts</p>
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
          {/* Borrower Name */}
          <div>
            <label htmlFor="borrower-name" className="block text-xs font-medium text-slate-300 mb-1">
              Borrower Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="borrower-name"
                type="text"
                required
                autoFocus
                placeholder="Vikram Malhotra"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-sm text-white placeholder-slate-600 outline-none transition min-h-[44px]"
              />
            </div>
          </div>

          {/* Contact Details (Phone & Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="borrower-phone" className="block text-xs font-medium text-slate-300 mb-1">
                Phone Number (For 1-tap call) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="borrower-phone"
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={borrowerPhone}
                  onChange={(e) => setBorrowerPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-sm font-mono text-white placeholder-slate-600 outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="borrower-email" className="block text-xs font-medium text-slate-300 mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="borrower-email"
                  type="email"
                  placeholder="vikram@example.com"
                  value={borrowerEmail}
                  onChange={(e) => setBorrowerEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-sm text-white placeholder-slate-600 outline-none min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Amount & Source Wallet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="loan-amount" className="block text-xs font-medium text-slate-300 mb-1">
                Amount Lent (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-base font-bold">
                  ₹
                </span>
                <input
                  id="loan-amount"
                  type="number"
                  step="any"
                  min="1"
                  required
                  placeholder="300"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-base font-mono font-bold text-white placeholder-slate-600 outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Lent From Wallet *
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setWallet("ONLINE")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-semibold transition min-h-[44px] ${
                    wallet === "ONLINE"
                      ? "bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setWallet("CASH")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-semibold transition min-h-[44px] ${
                    wallet === "CASH"
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                  Cash
                </button>
              </div>
            </div>
          </div>

          {/* Dates: Lent Date & Expected Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="lent-date" className="block text-xs font-medium text-slate-300 mb-1">
                Date Lent (DD-MM-YYYY)
              </label>
              <input
                id="lent-date"
                type="date"
                required
                value={lentDateInput}
                onChange={(e) => setLentDateInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono text-white outline-none min-h-[44px]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Logged: {inputToDDMMYYYY(lentDateInput)}
              </span>
            </div>

            <div>
              <label htmlFor="due-date" className="block text-xs font-medium text-amber-300 mb-1">
                Expected Return Date (DD-MM-YYYY) *
              </label>
              <input
                id="due-date"
                type="date"
                required
                value={dueDateInput}
                onChange={(e) => setDueDateInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/60 text-sm font-mono text-white outline-none min-h-[44px]"
              />
              <span className="text-[11px] text-amber-400 mt-1 block">
                Reminder due: {inputToDDMMYYYY(dueDateInput)}
              </span>
            </div>
          </div>

          {/* Purpose / Note */}
          <div>
            <label htmlFor="loan-notes" className="block text-xs font-medium text-slate-300 mb-1">
              Purpose / Notes (Optional)
            </label>
            <input
              id="loan-notes"
              type="text"
              placeholder="e.g. Dinner bill split, promised to pay Friday"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-sm text-white placeholder-slate-600 outline-none min-h-[44px]"
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
              className="w-1/2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white text-sm font-semibold shadow-lg shadow-amber-600/30 transition min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recording...
                </>
              ) : (
                "Lend Money"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

