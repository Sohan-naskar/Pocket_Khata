"use client";

import React, { useState } from "react";
import { X, CheckCircle2, CreditCard, Banknote, Loader2 } from "lucide-react";
import { LoanItem, WalletType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { formatDateDDMMYYYY } from "@/lib/date-utils";
import { useToast } from "@/components/ui/Toast";

interface CollectLoanModalProps {
  loan: LoanItem | null;
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (data: any) => void;
}

export function CollectLoanModal({ loan, isOpen, onClose, onSuccess }: CollectLoanModalProps) {
  const { success, error: toastError } = useToast();
  const [repaymentWallet, setRepaymentWallet] = useState<WalletType>("ONLINE");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !loan) return null;

  const handleCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/loans/${loan.id}/collect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repaymentWallet }),
      });

      const data = await res.json();

      if (!res.ok) {
        toastError("Collection Error", data.error || "Failed to mark loan as collected.");
        setIsLoading(false);
        return;
      }

      success(
        "Udhaar Collected! 🎉",
        `${formatCurrency(loan.amount)} received from ${loan.borrowerName} into your ${
          repaymentWallet === "ONLINE" ? "Online (UPI)" : "Cash"
        } wallet.`
      );

      onSuccess(data);
      onClose();
    } catch {
      toastError("Error", "Network error occurred while collecting loan.");
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
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Mark Udhaar as Collected</h2>
              <p className="text-xs text-slate-400">Add funds back to your wallet</p>
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

        {/* Loan summary box */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs text-slate-400">Borrower</p>
              <p className="text-sm font-bold text-white">{loan.borrowerName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Amount Due</p>
              <p className="text-lg font-mono font-bold text-emerald-400">
                {formatCurrency(loan.amount)}
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>Lent on: {formatDateDDMMYYYY(loan.lentDate)}</span>
            <span>Due on: {formatDateDDMMYYYY(loan.dueDate)}</span>
          </div>
        </div>

        <form onSubmit={handleCollect} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Where did you receive the payment? *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRepaymentWallet("ONLINE")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition min-h-[44px] ${
                  repaymentWallet === "ONLINE"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-400" />
                Online (UPI/Bank)
              </button>

              <button
                type="button"
                onClick={() => setRepaymentWallet("CASH")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition min-h-[44px] ${
                  repaymentWallet === "CASH"
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-400" />
                Cash (Physical)
              </button>
            </div>
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
                  Collecting...
                </>
              ) : (
                "Confirm Repayment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

