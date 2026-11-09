"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { formatCurrency } from "@/lib/utils";
import { formatDateDDMMYYYY } from "@/lib/date-utils";
import {
  Shield,
  Users,
  UserCheck,
  ReceiptText,
  HandCoins,
  ShieldAlert,
  ArrowLeft,
  Calendar,
} from "lucide-react";

export default function AdminPage() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session?.user as any)?.role || "USER";

  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userRole === "ADMIN") {
      fetch("/api/admin/metrics")
        .then((res) => {
          if (!res.ok) throw new Error("Unauthorized or server error");
          return res.json();
        })
        .then((data) => {
          setMetrics(data.metrics);
          setUsers(data.users);
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [userRole]);

  // Non-admin guard view
  if (userRole !== "ADMIN") {
    return (
      <DashboardShell>
        {() => (
          <div className="max-w-md mx-auto py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access Restricted</h1>
            <p className="text-sm text-slate-400">
              Only hostel wardens and system administrators with the <strong className="text-purple-400">ADMIN</strong> role can access platform telemetry.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Personal Dashboard
              </Link>
            </div>
          </div>
        )}
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      {() => (
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Shield className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Admin Platform Telemetry
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                HOSTEL WARDEN PORTAL
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time user registration analytics, active student counts, and system activity logs.
            </p>
          </div>

          {/* Metric Hero Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Registered Users */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-purple-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Total Registered Users
                </span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-financial font-extrabold text-white">
                {isLoading ? "..." : metrics?.totalUsers ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Students & staff accounts</p>
            </div>

            {/* Active Users This Month */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-emerald-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                  Active Users This Month
                </span>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-financial font-extrabold text-emerald-400">
                {isLoading ? "..." : metrics?.activeUsersThisMonth ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Logged expenses/income</p>
            </div>

            {/* Total Platform Transactions */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-blue-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Total Transactions
                </span>
                <ReceiptText className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-financial font-extrabold text-blue-400">
                {isLoading ? "..." : metrics?.totalTransactions ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Across all student wallets</p>
            </div>

            {/* Total Udhaar Loans */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-amber-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  Total Peer Udhaars
                </span>
                <HandCoins className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-financial font-extrabold text-amber-400">
                {isLoading ? "..." : metrics?.totalLoans ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Peer-to-peer hostel loans</p>
            </div>
          </div>

          {/* User Registry Table */}
          <div className="rounded-2xl bg-[#111827] border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Registered Users Registry</h3>
                <p className="text-xs text-slate-400">
                  User accounts and registration timestamps formatted in DD-MM-YYYY
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Total: {users.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-900 rounded animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center text-rose-400 text-sm">{error}</div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Student / User</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Registered Date (DD-MM-YYYY)</th>
                        <th className="py-3 px-4 text-center">Transactions</th>
                        <th className="py-3 px-4 text-center">Loans</th>
                        <th className="py-3 px-4 text-right">Online Bal</th>
                        <th className="py-3 px-4 text-right">Cash Bal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-sm">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {u.name || "Nameless"}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono text-slate-300">
                            {u.email}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                u.role === "ADMIN"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono text-slate-300">
                            {formatDateDDMMYYYY(u.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-xs">
                            {u.transactionsCount}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-xs">
                            {u.loansCount}
                          </td>
                          <td className="py-3.5 px-4 text-right font-financial text-xs text-blue-400">
                            {formatCurrency(u.onlineBalance)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-financial text-xs text-emerald-400">
                            {formatCurrency(u.cashBalance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-slate-800 p-2">
                  {users.map((u) => (
                    <div key={u.id} className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{u.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === "ADMIN"
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono truncate">{u.email}</p>
                      <div className="flex justify-between items-center text-xs text-slate-400 font-mono pt-1">
                        <span>Joined: {formatDateDDMMYYYY(u.createdAt)}</span>
                        <span>
                          {u.transactionsCount} txs &bull; {u.loansCount} loans
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

