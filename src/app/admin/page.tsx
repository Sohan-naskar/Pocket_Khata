"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { formatDateDDMMYYYY } from "@/lib/date-utils";
import { useToast } from "@/components/ui/Toast";
import {
  Shield,
  Users,
  UserCheck,
  UserPlus,
  UserMinus,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
  X,
  Loader2,
  Lock,
  Mail,
  User,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";

interface AdminMetrics {
  totalUsers: number;
  activeUsersThisMonth: number;
  newSignupsThisMonth: number;
  totalAdmins: number;
}

interface AdminUserRow {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  transactionsCount: number;
  loansCount: number;
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function AdminPage() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentUserId = session?.user?.id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session?.user as any)?.role || "USER";
  const { success, error: toastError } = useToast();

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for "Add New Admin"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminType, setAdminType] = useState<"GOOGLE" | "CREDENTIALS">("GOOGLE");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  // Role action loader tracking
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchAdminData = () => {
    setIsLoading(true);
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
  };

  useEffect(() => {
    if (userRole === "ADMIN") {
      fetchAdminData();
    } else {
      setIsLoading(false);
    }
  }, [userRole]);

  // Create New Admin Handler
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) {
      toastError("Missing Email", "Please enter the admin's email address.");
      return;
    }

    if (adminType === "CREDENTIALS") {
      if (!newAdminName) {
        toastError("Missing Name", "Please enter the admin's full name.");
        return;
      }
      if (!newAdminPassword || newAdminPassword.length < 6) {
        toastError("Weak Password", "Password must be at least 6 characters.");
        return;
      }
    }

    setIsSubmittingAdmin(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAdminName.trim() || newAdminEmail.split("@")[0],
          email: newAdminEmail.trim().toLowerCase(),
          password: adminType === "CREDENTIALS" ? newAdminPassword : undefined,
          isGoogleAccount: adminType === "GOOGLE",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError("Admin Setup Failed", data.error || "Unable to configure admin account.");
        return;
      }

      success(
        "Admin Configured!",
        adminType === "GOOGLE"
          ? `Google account (${newAdminEmail.trim().toLowerCase()}) now has System Admin privileges.`
          : `${data.user.name} has been provisioned as a System Admin.`
      );
      setIsModalOpen(false);
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      fetchAdminData();
    } catch {
      toastError("Network Error", "Failed to connect to the server. Please try again.");
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  // Toggle Role (Promote / Demote)
  const handleToggleRole = async (targetUser: AdminUserRow, newRole: "USER" | "ADMIN") => {
    if (targetUser.id === currentUserId && newRole !== "ADMIN") {
      toastError("Action Prohibited", "You cannot demote your own admin account.");
      return;
    }

    setUpdatingUserId(targetUser.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUser.id,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError("Role Update Failed", data.error || "Unable to update user role.");
        return;
      }

      success(
        "Role Updated!",
        `${targetUser.name || targetUser.email} is now a ${newRole === "ADMIN" ? "System Admin" : "Standard User"}.`
      );

      // Optimistically update local users list and metrics
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
      setMetrics((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          totalAdmins: newRole === "ADMIN" ? prev.totalAdmins + 1 : Math.max(1, prev.totalAdmins - 1),
        };
      });
    } catch {
      toastError("Network Error", "Failed to update role. Please try again.");
    } finally {
      setUpdatingUserId(null);
    }
  };

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
              Only system administrators with the <strong className="text-purple-400">ADMIN</strong> role can access platform telemetry.
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
          {/* Header with Title and '+ Add New Admin' Action Button */}
          <div className="pb-3 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Shield className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Admin Platform Telemetry
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ADMIN PORTAL
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Real-time platform adoption analytics, user registration activity, and admin team management.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition active:scale-[0.99] self-start sm:self-auto shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              + Add New Admin
            </button>
          </div>

          {/* Privacy Invariant Banner */}
          <div className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
            <LockKeyhole className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-200">Strict Financial Privacy Enforced:</strong> User wallet balances, money totals, and transaction amounts are private and completely excluded from admin telemetry.
            </span>
          </div>

          {/* Top 4 Metric Adoption Hero Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Registered Users */}
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
              <p className="text-xs text-slate-400 mt-1">Total student & staff accounts</p>
            </div>

            {/* 2. Active Users This Month */}
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
              <p className="text-xs text-slate-400 mt-1">Users active in current month</p>
            </div>

            {/* 3. New Signups This Month */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-blue-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  New Signups This Month
                </span>
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-financial font-extrabold text-blue-400">
                {isLoading ? "..." : metrics?.newSignupsThisMonth ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Accounts created this month</p>
            </div>

            {/* 4. Total Platform Admins */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-amber-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  Total Platform Admins
                </span>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-financial font-extrabold text-amber-400">
                {isLoading ? "..." : metrics?.totalAdmins ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Accounts with ADMIN role</p>
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
                Total Accounts: {users.length}
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
                        <th className="py-3 px-4">User / Account</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Registered Date (DD-MM-YYYY)</th>
                        <th className="py-3 px-4 text-center">Transactions</th>
                        <th className="py-3 px-4 text-center">Loans</th>
                        <th className="py-3 px-4 text-right">Role Management</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-sm">
                      {users.map((u) => {
                        const isSelf = u.id === currentUserId;
                        const isUpdating = updatingUserId === u.id;

                        return (
                          <tr key={u.id} className="hover:bg-slate-800/30 transition">
                            <td className="py-3.5 px-4 font-semibold text-white">
                              {u.name || "Nameless"}
                              {isSelf && (
                                <span className="ml-2 text-[10px] text-slate-400 font-normal italic">
                                  (You)
                                </span>
                              )}
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
                            <td className="py-3.5 px-4 text-right">
                              {isSelf ? (
                                <span className="text-xs text-slate-500 italic">Current Session</span>
                              ) : isUpdating ? (
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Updating...
                                </span>
                              ) : u.role === "USER" ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleRole(u, "ADMIN")}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-600/15 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition active:scale-[0.98]"
                                >
                                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                                  Promote to Admin
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleRole(u, "USER")}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-rose-300 hover:border-rose-500/30 hover:bg-rose-500/10 transition active:scale-[0.98]"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                  Demote to User
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-slate-800 p-2">
                  {users.map((u) => {
                    const isSelf = u.id === currentUserId;
                    const isUpdating = updatingUserId === u.id;

                    return (
                      <div key={u.id} className="p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">
                            {u.name || "Nameless"}
                            {isSelf && (
                              <span className="ml-1.5 text-[10px] text-slate-400 italic">
                                (You)
                              </span>
                            )}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === "ADMIN"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono truncate">{u.email}</p>
                        <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                          <span>Joined: {formatDateDDMMYYYY(u.createdAt)}</span>
                          <span>
                            {u.transactionsCount} txs &bull; {u.loansCount} loans
                          </span>
                        </div>

                        {/* Action on Mobile */}
                        <div className="pt-1 flex justify-end">
                          {isSelf ? (
                            <span className="text-[11px] text-slate-500 italic">Current Session</span>
                          ) : isUpdating ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Updating...
                            </span>
                          ) : u.role === "USER" ? (
                            <button
                              type="button"
                              onClick={() => handleToggleRole(u, "ADMIN")}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600/15 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition"
                            >
                              <Shield className="w-3.5 h-3.5 text-purple-400" />
                              Promote to Admin
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleRole(u, "USER")}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-rose-300 hover:border-rose-500/30 transition"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              Demote to User
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Add New Admin Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 relative">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Add New System Admin</h3>
                      <p className="text-[11px] text-slate-400">
                        Authorize a Google account or create standard credentials
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Account Type Selector (Google Account vs Credentials) */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAdminType("GOOGLE")}
                    className={`flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition ${
                      adminType === "GOOGLE"
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <GoogleIcon />
                    Google Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminType("CREDENTIALS")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition ${
                      adminType === "CREDENTIALS"
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Email & Password
                  </button>
                </div>

                {/* Form Section */}
                <form onSubmit={handleCreateAdmin} className="space-y-3">
                  {/* Google Account Info Tip */}
                  {adminType === "GOOGLE" && (
                    <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>
                        Enter a Google account email. When this user logs in via <strong>Continue with Google</strong>, they will instantly have full System Admin access without needing a password.
                      </span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="admin-name"
                      className="block text-[11px] font-medium text-slate-300 mb-1"
                    >
                      Full Name {adminType === "GOOGLE" && "(Optional)"}
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="admin-name"
                        type="text"
                        required={adminType === "CREDENTIALS"}
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder={
                          adminType === "GOOGLE" ? "e.g. Aryan Sharma (Optional)" : "Admin Full Name"
                        }
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition h-9"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label
                      htmlFor="admin-email"
                      className="block text-[11px] font-medium text-slate-300 mb-1"
                    >
                      {adminType === "GOOGLE" ? "Google Account Email" : "Email Address"}
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="admin-email"
                        type="email"
                        required
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder={
                          adminType === "GOOGLE" ? "name@gmail.com" : "admin@example.com"
                        }
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition h-9"
                      />
                    </div>
                  </div>

                  {/* Password (Only for Standard Credentials) */}
                  {adminType === "CREDENTIALS" && (
                    <div>
                      <label
                        htmlFor="admin-password"
                        className="block text-[11px] font-medium text-slate-300 mb-1"
                      >
                        Password (min 6 characters)
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="admin-password"
                          type="password"
                          required
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition h-9"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSubmittingAdmin}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/30 transition h-10 active:scale-[0.99]"
                    >
                      {isSubmittingAdmin ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Configuring Admin...
                        </>
                      ) : adminType === "GOOGLE" ? (
                        <>
                          <GoogleIcon />
                          Authorize Google Account as Admin
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Create Admin Account
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Divider & Direct Google One-Click Auth */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-[#111827] px-2.5 text-slate-500 tracking-wider">
                      Or sign in directly with Google
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/admin" })}
                  className="w-full flex items-center justify-center gap-2.5 py-2 px-3 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-200 text-xs sm:text-sm font-medium transition h-10 shadow-sm"
                >
                  <GoogleIcon />
                  Sign In with Google as Admin
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
