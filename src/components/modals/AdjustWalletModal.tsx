"use client";

import React, { useState, useEffect } from "react";
import { X, CreditCard, Banknote, Loader2, Sliders, CheckCircle2 } from "lucide-react";
import { WalletBalances } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface AdjustWalletModalProps {
  currentBalances: WalletBalances | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: WalletBalances) => void;
}

export function AdjustWalletModal({
  currentBalances,
  isOpen,
  onClose,
  onSuccess,
}: AdjustWalletModalProps) {
  const { success, error: toastError } = useToast();

  const [onlineVal, setOnlineVal] = useState("0");
  const [cashVal, setCashVal] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentBalances) {
      setOnlineVal(String(currentBalances.onlineBalance));
      setCashVal(String(currentBalances.cashBalance));
    }
  }, [currentBalances]);

  if (!isOpen) return null;

  const onlineNum = Math.max(0, parseFloat(onlineVal) || 0);
  const cashNum = Math.max(0, parseFloat(cashVal) || 0);
  const calculatedTotal = onlineNum + cashNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onlineBalance: onlineNum,
          cashBalance: cashNum,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toastError("Update Error", data.error || "Failed to update balances.");
        setIsLoading(false);
        return;
      }

      success("Balances Reconciled!", "Your wallet profile has been calibrated.");
      onSuccess(data);
      onClose();
    } catch {
      toastError("Error", "Network error updating wallet balances.");
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
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Calibrate Starting Balances</h2>
              <p className="text-xs text-slate-400">Adjust when bank SMS or physical cash differs</p>
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
          <div>
            <label htmlFor="edit-online" className="flex items-center gap-1.5 text-xs font-medium text-blue-400 mb-1">
              <CreditCard className="w-3.5 h-3.5" />
              Online Balance (Bank / UPI) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-base font-bold">
                ₹
              </span>
              <input
                id="edit-online"
                type="number"
                step="any"
                min="0"
                required
                value={onlineVal}
                onChange={(e) => setOnlineVal(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-blue-900/60 focus:border-blue-500 text-base font-mono font-bold text-white outline-none min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-cash" className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 mb-1">
              <Banknote className="w-3.5 h-3.5" />
              Cash Balance (Physical Pocket) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-base font-bold">
                ₹
              </span>
              <input
                id="edit-cash"
                type="number"
                step="any"
                min="0"
                required
                value={cashVal}
                onChange={(e) => setCashVal(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-900/60 focus:border-emerald-500 text-base font-mono font-bold text-white outline-none min-h-[44px]"
              />
            </div>
          </div>

          {/* Live New Total Preview */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
            <span className="text-xs font-medium text-slate-400">Resulting Total Balance:</span>
            <span className="text-lg font-mono font-bold text-indigo-400">
              {formatCurrency(calculatedTotal)}
            </span>
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
              className="w-1/2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Calibration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

