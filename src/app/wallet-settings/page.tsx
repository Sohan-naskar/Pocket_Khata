"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { WalletBalances } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import {
  SlidersHorizontal,
  CreditCard,
  Banknote,
  User,
  Mail,
  Shield,
  LogOut,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function WalletSettingsPage() {
  const { data: session } = useSession();
  const { success, error: toastError } = useToast();

  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [onlineVal, setOnlineVal] = useState("0");
  const [cashVal, setCashVal] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/wallet")
      .then((res) => res.json())
      .then((data) => {
        setBalances(data);
        setOnlineVal(String(data.onlineBalance));
        setCashVal(String(data.cashBalance));
      })
      .catch((err) => console.error("Error fetching wallet:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const onlineNum = Math.max(0, parseFloat(onlineVal) || 0);
  const cashNum = Math.max(0, parseFloat(cashVal) || 0);
  const totalNum = onlineNum + cashNum;

  const handleSaveBalances = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

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
        toastError("Error", data.error || "Failed to update balances.");
        setIsSaving(false);
        return;
      }

      setBalances(data);
      success("Balances Updated!", "Your wallet profile has been recalibrated.");
    } catch {
      toastError("Error", "Network error updating balances.");
    } finally {
      setIsSaving(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session?.user as any)?.role || "USER";

  return (
    <DashboardShell>
      {() => (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Wallet Calibration & Profile
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Recalibrate your Online vs Cash balances to match physical cash or bank SMS.
            </p>
          </div>

          {/* Profile Card */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              Student Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400">Student Name</p>
                <p className="font-semibold text-white mt-1">
                  {session?.user?.name || "Hosteller"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400">Email Address</p>
                <p className="font-semibold text-white mt-1 truncate">
                  {session?.user?.email || "student@hostelkhata.app"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400">System Role</p>
                <span
                  className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded text-xs font-bold ${
                    userRole === "ADMIN"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  {userRole}
                </span>
              </div>
            </div>
          </div>

          {/* Reconcile Starting Balances Form */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-5">
            <div>
              <h2 className="text-base font-bold text-white">
                Reconcile & Set Wallet Starting Balance
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                If your physical pocket cash was miscounted or bank interests/charges were debited, adjust them directly here.
              </p>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-slate-500 animate-pulse">
                Loading wallet settings...
              </div>
            ) : (
              <form onSubmit={handleSaveBalances} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Online Balance */}
                  <div>
                    <label htmlFor="settings-online" className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 mb-1">
                      <CreditCard className="w-4 h-4" />
                      Online Balance (UPI / Bank A/C) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-500 font-bold">
                        ₹
                      </span>
                      <input
                        id="settings-online"
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

                  {/* Cash Balance */}
                  <div>
                    <label htmlFor="settings-cash" className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
                      <Banknote className="w-4 h-4" />
                      Cash Balance (Physical Pocket) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-500 font-bold">
                        ₹
                      </span>
                      <input
                        id="settings-cash"
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
                </div>

                {/* Total Calculated Preview */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">
                    Calculated Live Total Balance:
                  </span>
                  <span className="text-xl font-financial font-extrabold text-indigo-400">
                    {formatCurrency(totalNum)}
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition min-h-[44px]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Save New Calibration
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sign Out Card */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Sign Out from Session</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ensure you log out on shared campus or hostel computers.
              </p>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/40 text-rose-300 text-xs font-semibold transition min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

