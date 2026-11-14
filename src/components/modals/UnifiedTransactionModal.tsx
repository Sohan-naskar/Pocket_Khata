"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { formatDateDDMMYYYY } from "@/lib/date-utils";
import {
  X,
  CreditCard,
  Banknote,
  Calendar,
  Tag,
  FileText,
  User,
  Phone,
  Mail,
  Loader2,
  TrendingDown,
  TrendingUp,
  HandCoins,
  Sparkles,
} from "lucide-react";

export type EntryTab = "EXPENSE" | "INCOME" | "LEND";

interface UnifiedTransactionModalProps {
  isOpen: boolean;
  initialTab?: EntryTab;
  onClose: () => void;
  onSuccess: () => void;
}

const EXPENSE_CATEGORIES = [
  "Food & Mess",
  "Chai & Snacks",
  "Hostel Rent & Dues",
  "Stationery & Xerox",
  "Travel & Auto",
  "Groceries",
  "Shopping & Clothes",
  "Recharge & Wifi",
  "Medicine & Health",
  "Entertainment",
  "Other",
];

const INCOME_CATEGORIES = [
  "Allowance / Pocket Money",
  "Salary / Part-time",
  "Freelance Work",
  "Cashback & Refund",
  "Gift / Prize",
  "Stipend",
  "Other",
];

export function UnifiedTransactionModal({
  isOpen,
  initialTab = "EXPENSE",
  onClose,
  onSuccess,
}: UnifiedTransactionModalProps) {
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<EntryTab>(initialTab);
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState<"ONLINE" | "CASH">("ONLINE");
  const [category, setCategory] = useState("Food & Mess");
  const [description, setDescription] = useState("");
  const [dateStr, setDateStr] = useState("");

  // Udhaar-specific fields
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerPhone, setBorrowerPhone] = useState("");
  const [borrowerEmail, setBorrowerEmail] = useState("");
  const [dueDateStr, setDueDateStr] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      const today = new Date();
      setDateStr(formatDateDDMMYYYY(today));
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      setDueDateStr(formatDateDDMMYYYY(nextWeek));
    }
  }, [isOpen, initialTab]);

  // Adjust default category when switching tabs
  useEffect(() => {
    if (activeTab === "EXPENSE") {
      setCategory("Food & Mess");
    } else if (activeTab === "INCOME") {
      setCategory("Allowance / Pocket Money");
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toastError("Invalid Amount", "Please enter a valid amount greater than 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === "EXPENSE" || activeTab === "INCOME") {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: activeTab,
            wallet,
            amount: numAmount,
            category,
            description: description.trim() || null,
            dateStr,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to record transaction.");
        }

        success(
          activeTab === "EXPENSE" ? "Expense Logged" : "Money Added",
          `₹${numAmount.toLocaleString("en-IN")} recorded via ${wallet === "ONLINE" ? "Online (UPI)" : "Cash"}.`
        );
      } else {
        // LEND UDHAAR
        if (!borrowerName.trim()) {
          toastError("Missing Name", "Please enter the friend/roommate's name.");
          setIsSubmitting(false);
          return;
        }

        if (!borrowerPhone.trim() || borrowerPhone.trim().length < 8) {
          toastError("Valid Phone Required", "Please enter a valid mobile number for reminders.");
          setIsSubmitting(false);
          return;
        }

        const res = await fetch("/api/loans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            borrowerName: borrowerName.trim(),
            borrowerPhone: borrowerPhone.trim(),
            borrowerEmail: borrowerEmail.trim() || null,
            amount: numAmount,
            wallet,
            lentDateStr: dateStr,
            dueDateStr,
            notes: description.trim() || null,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to record peer loan.");
        }

        success(
          "Udhaar Recorded",
          `₹${numAmount.toLocaleString("en-IN")} lent to ${borrowerName.trim()}.`
        );
      }

      // Reset fields & close
      setAmount("");
      setDescription("");
      setBorrowerName("");
      setBorrowerPhone("");
      setBorrowerEmail("");
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError("Operation Failed", err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-[#111318] border border-white/[0.08] rounded-2xl shadow-2xl p-5 sm:p-6 relative overflow-hidden text-zinc-100 max-h-[92vh] flex flex-col custom-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 transition-colors duration-300 ${
            activeTab === "EXPENSE"
              ? "bg-rose-500"
              : activeTab === "INCOME"
              ? "bg-emerald-500"
              : "bg-amber-500"
          }`}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                activeTab === "EXPENSE"
                  ? "bg-rose-500/15 text-rose-400"
                  : activeTab === "INCOME"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-amber-500/15 text-amber-400"
              }`}
            >
              {activeTab === "EXPENSE" && <TrendingDown className="w-4 h-4" />}
              {activeTab === "INCOME" && <TrendingUp className="w-4 h-4" />}
              {activeTab === "LEND" && <HandCoins className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {activeTab === "EXPENSE" && "Record Expense"}
                {activeTab === "INCOME" && "Add Income / Cash In"}
                {activeTab === "LEND" && "Lend Peer Udhaar"}
              </h3>
              <p className="text-[11px] text-zinc-400">PocketKhata Fast Cashflow Logger</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Skiper Animated Tab Switcher */}
        <div className="mt-4 grid grid-cols-3 gap-1 p-1 bg-black/40 border border-white/[0.08] rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("EXPENSE")}
            className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === "EXPENSE"
                ? "bg-rose-600 text-white shadow-sm font-bold"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Expense</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("INCOME")}
            className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === "INCOME"
                ? "bg-emerald-600 text-white shadow-sm font-bold"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Income</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("LEND")}
            className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === "LEND"
                ? "bg-amber-600 text-white shadow-sm font-bold"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <HandCoins className="w-3.5 h-3.5" />
            <span>Udhaar</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1 custom-scroll">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Amount (₹) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 font-mono text-base font-bold pointer-events-none">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 bg-black/30 border border-white/[0.1] rounded-xl text-lg font-mono font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
              />
            </div>
          </div>

          {/* Wallet Selector Pill (Online vs Cash) */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              {activeTab === "INCOME" ? "Deposit Money Into" : "Pay / Deduct From"}{" "}
              <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setWallet("ONLINE")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  wallet === "ONLINE"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm"
                    : "bg-black/30 border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>Online (UPI / Bank)</span>
              </button>

              <button
                type="button"
                onClick={() => setWallet("CASH")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  wallet === "CASH"
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm"
                    : "bg-black/30 border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>Cash in Pocket</span>
              </button>
            </div>
          </div>

          {/* Fields for Expense & Income */}
          {(activeTab === "EXPENSE" || activeTab === "INCOME") && (
            <>
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-white transition"
                >
                  {(activeTab === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat} className="bg-zinc-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Fast Category Quick Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(activeTab === "EXPENSE"
                    ? ["Food & Mess", "Chai & Snacks", "Travel & Auto", "Stationery & Xerox"]
                    : ["Allowance / Pocket Money", "Salary / Part-time", "Cashback & Refund"]
                  ).map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setCategory(quick)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                        category === quick
                          ? "bg-white text-black border-white font-semibold"
                          : "bg-white/[0.04] text-zinc-400 border-white/[0.06] hover:text-white"
                      }`}
                    >
                      {quick}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note / Description */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Description / Note (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Canteen lunch with Rahul, Xerox notes"
                  className="w-full px-3 py-2 bg-black/30 border border-white/[0.1] rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Date (DD-MM-YYYY)
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    placeholder="DD-MM-YYYY"
                    className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/[0.1] rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* Fields for LEND UDHAAR */}
          {activeTab === "LEND" && (
            <>
              {/* Borrower Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Borrower's Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    placeholder="e.g. Rohit Sen, Roommate Aman"
                    className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/[0.1] rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>

              {/* Borrower Phone */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Mobile Number (for WhatsApp / Call Reminders) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={borrowerPhone}
                    onChange={(e) => setBorrowerPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/[0.1] rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>

              {/* Borrower Email (Optional) */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={borrowerEmail}
                    onChange={(e) => setBorrowerEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/[0.1] rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>

              {/* Expected Return Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Lent Date
                  </label>
                  <input
                    type="text"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    placeholder="DD-MM-YYYY"
                    className="w-full px-3 py-2 bg-black/30 border border-white/[0.1] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Due Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={dueDateStr}
                    onChange={(e) => setDueDateStr(e.target.value)}
                    placeholder="DD-MM-YYYY"
                    className="w-full px-3 py-2 bg-black/30 border border-white/[0.1] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>

              {/* Loan Notes */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Reason / Split Notes (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Mess advance bill split, movie ticket"
                  className="w-full px-3 py-2 bg-black/30 border border-white/[0.1] rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                />
              </div>
            </>
          )}

          {/* Form Actions Footer */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition active:scale-[0.98] shadow-lg ${
                activeTab === "EXPENSE"
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
                  : activeTab === "INCOME"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                  : "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>
                  {activeTab === "EXPENSE" && "Record Expense"}
                  {activeTab === "INCOME" && "Save Income"}
                  {activeTab === "LEND" && "Save Udhaar"}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
