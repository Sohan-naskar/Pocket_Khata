"use client";

import React from "react";
import { X, TrendingDown, TrendingUp, HandCoins } from "lucide-react";

interface MobileQuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExpense: () => void;
  onSelectIncome: () => void;
  onSelectLend: () => void;
}

export function MobileQuickActionsModal({
  isOpen,
  onClose,
  onSelectExpense,
  onSelectIncome,
  onSelectLend,
}: MobileQuickActionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-sm bg-[#111827] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 z-10 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">Quick Khata Action</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close action menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <button
            onClick={() => {
              onClose();
              onSelectExpense();
            }}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-900 border border-rose-900/40 hover:bg-rose-950/30 text-left transition min-h-[44px]"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Log Expense</p>
              <p className="text-xs text-slate-400">Deduct from Online UPI or Cash</p>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectIncome();
            }}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-900 border border-emerald-900/40 hover:bg-emerald-950/30 text-left transition min-h-[44px]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Add Money (Income)</p>
              <p className="text-xs text-slate-400">Allowance, salary, or refund deposit</p>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectLend();
            }}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-900 border border-amber-900/40 hover:bg-amber-950/30 text-left transition min-h-[44px]"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Lend Money (Udhaar)</p>
              <p className="text-xs text-slate-400">Track borrower, return date & alerts</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

