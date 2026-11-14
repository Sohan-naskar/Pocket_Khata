"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { formatDateDDMMYYYY } from "@/lib/date-utils";
import { useToast } from "@/components/ui/Toast";
import { checkIsAdminEmail } from "@/auth.config";
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
  LogOut,
  Trash2,
  AlertTriangle,
  FileText,
  HandCoins,
  FolderEdit,
  ReceiptText,
  Eye,
  EyeOff,
  KeyRound,
  Copy,
  Check,
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

interface UserDetailedTransaction {
  id: string;
  type: string;
  wallet: string;
  category: string;
  description: string | null;
  date: string;
  createdAt: string;
}

interface UserDetailedLoan {
  id: string;
  borrowerName: string;
  borrowerPhone: string;
  borrowerEmail: string | null;
  wallet: string;
  lentDate: string;
  dueDate: string;
  status: string;
  notes: string | null;
  collectedAt: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentUserId = session?.user?.id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = (session?.user as any)?.role === "ADMIN" || checkIsAdminEmail(session?.user?.email);
  const userRole = isAdmin ? "ADMIN" : ((session?.user as any)?.role || "USER");
  const { success, error: toastError } = useToast();

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for "Add New Admin"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminConfirmPassword, setNewAdminConfirmPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAdminConfirmPassword, setShowAdminConfirmPassword] = useState(false);
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  const handleCloseAdminModal = () => {
    setIsModalOpen(false);
    setNewAdminName("");
    setNewAdminEmail("");
    setNewAdminPassword("");
    setNewAdminConfirmPassword("");
    setShowAdminPassword(false);
    setShowAdminConfirmPassword(false);
  };

  // Role action loader tracking
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // User removal modal state
  const [deleteUserModalTarget, setDeleteUserModalTarget] = useState<AdminUserRow | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Clear transactions modal state
  const [clearTransactionsModalTarget, setClearTransactionsModalTarget] = useState<AdminUserRow | null>(null);
  const [isClearingTransactions, setIsClearingTransactions] = useState(false);

  // Clear loans modal state
  const [clearLoansModalTarget, setClearLoansModalTarget] = useState<AdminUserRow | null>(null);
  const [isClearingLoans, setIsClearingLoans] = useState(false);

  // Detailed User Data Inspector Modal state
  const [userDataModalTarget, setUserDataModalTarget] = useState<AdminUserRow | null>(null);
  const [userDetailedData, setUserDetailedData] = useState<{
    transactions: UserDetailedTransaction[];
    loans: UserDetailedLoan[];
  } | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [userDataActiveTab, setUserDataActiveTab] = useState<"TRANSACTIONS" | "LOANS">("TRANSACTIONS");
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Reset Password Modal State
  const [resetPasswordModalTarget, setResetPasswordModalTarget] = useState<AdminUserRow | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [copiedResetPassword, setCopiedResetPassword] = useState(false);

  const handleCloseResetPasswordModal = () => {
    setResetPasswordModalTarget(null);
    setResetNewPassword("");
    setResetConfirmPassword("");
    setShowResetPassword(false);
    setShowResetConfirmPassword(false);
    setIsResettingPassword(false);
    setCopiedResetPassword(false);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setResetNewPassword(pass);
    setResetConfirmPassword(pass);
  };

  const handleCopyGeneratedPassword = () => {
    if (!resetNewPassword) return;
    navigator.clipboard.writeText(resetNewPassword);
    setCopiedResetPassword(true);
    setTimeout(() => setCopiedResetPassword(false), 2000);
    success("Copied to Clipboard", "Generated password copied to clipboard.");
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordModalTarget) return;

    const trimmedPassword = resetNewPassword.trim();
    if (trimmedPassword.length < 6) {
      toastError("Password Too Short", "Password must be at least 6 characters long.");
      return;
    }

    if (trimmedPassword !== resetConfirmPassword.trim()) {
      toastError("Passwords Mismatch", "Passwords do not match. Please verify.");
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: resetPasswordModalTarget.id,
          newPassword: trimmedPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError("Password Reset Failed", data.error || "Unable to reset password.");
        return;
      }

      success(
        "Password Updated",
        data.message || `Password for ${resetPasswordModalTarget.name || resetPasswordModalTarget.email} was successfully reset.`
      );
      handleCloseResetPasswordModal();
    } catch {
      toastError("Network Error", "Failed to connect to the server.");
    } finally {
      setIsResettingPassword(false);
    }
  };

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
    fetchAdminData();
  }, []);

  // Create New Admin Handler (Email + Password only)
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminName || !newAdminPassword || !newAdminConfirmPassword) {
      toastError("Missing Information", "Please enter the admin's name, email, password, and confirm password.");
      return;
    }

    if (newAdminPassword.length < 6) {
      toastError("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    if (newAdminPassword !== newAdminConfirmPassword) {
      toastError("Password Mismatch", "Passwords do not match. Please verify both fields.");
      return;
    }

    setIsSubmittingAdmin(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAdminName.trim(),
          email: newAdminEmail.trim().toLowerCase(),
          password: newAdminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError("Admin Setup Failed", data.error || "Unable to configure admin account.");
        return;
      }

      success(
        "Admin Configured!",
        `${data.user.name} has been provisioned as a System Admin.`
      );
      handleCloseAdminModal();
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

  // Delete Entire User Account Handler
  const handleDeleteUser = async () => {
    if (!deleteUserModalTarget) return;
    setIsDeletingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deleteUserModalTarget.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError("Delete Failed", data.error || "Unable to remove user account.");
        return;
      }
      success(
        "Account Removed",
        `${deleteUserModalTarget.name || deleteUserModalTarget.email} was permanently deleted.`
      );
      setDeleteUserModalTarget(null);
      if (userDataModalTarget?.id === deleteUserModalTarget.id) {
        setUserDataModalTarget(null);
      }
      fetchAdminData();
    } catch {
      toastError("Network Error", "Failed to connect to the server.");
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Clear All Transactions for a User
  const handleClearTransactions = async (targetUser: AdminUserRow) => {
    setIsClearingTransactions(true);
    try {
      const res = await fetch("/api/admin/user-data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUser.id, action: "CLEAR_TRANSACTIONS" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError("Clear Failed", data.error || "Unable to clear transactions.");
        return;
      }
      success("Transactions Cleared", data.message || "All transactions removed.");
      setClearTransactionsModalTarget(null);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, transactionsCount: 0 } : u))
      );
      if (userDataModalTarget?.id === targetUser.id) {
        setUserDetailedData((prev) => (prev ? { ...prev, transactions: [] } : null));
      }
      fetchAdminData();
    } catch {
      toastError("Network Error", "Failed to clear transactions.");
    } finally {
      setIsClearingTransactions(false);
    }
  };

  // Clear All Loans for a User
  const handleClearLoans = async (targetUser: AdminUserRow) => {
    setIsClearingLoans(true);
    try {
      const res = await fetch("/api/admin/user-data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUser.id, action: "CLEAR_LOANS" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError("Clear Failed", data.error || "Unable to clear loans.");
        return;
      }
      success("Loans Cleared", data.message || "All peer loans removed.");
      setClearLoansModalTarget(null);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, loansCount: 0 } : u))
      );
      if (userDataModalTarget?.id === targetUser.id) {
        setUserDetailedData((prev) => (prev ? { ...prev, loans: [] } : null));
      }
      fetchAdminData();
    } catch {
      toastError("Network Error", "Failed to clear loans.");
    } finally {
      setIsClearingLoans(false);
    }
  };

  // Delete Individual Transaction or Loan
  const handleDeleteSingleItem = async (
    userId: string,
    action: "DELETE_TRANSACTION" | "DELETE_LOAN",
    itemId: string
  ) => {
    setDeletingItemId(itemId);
    try {
      const res = await fetch("/api/admin/user-data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, itemId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError("Delete Failed", data.error || "Unable to remove item.");
        return;
      }
      success(
        "Removed",
        action === "DELETE_TRANSACTION" ? "Transaction deleted." : "Peer loan deleted."
      );
      if (action === "DELETE_TRANSACTION") {
        setUserDetailedData((prev) =>
          prev ? { ...prev, transactions: prev.transactions.filter((t) => t.id !== itemId) } : null
        );
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, transactionsCount: Math.max(0, u.transactionsCount - 1) } : u
          )
        );
      } else {
        setUserDetailedData((prev) =>
          prev ? { ...prev, loans: prev.loans.filter((l) => l.id !== itemId) } : null
        );
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, loansCount: Math.max(0, u.loansCount - 1) } : u
          )
        );
      }
      fetchAdminData();
    } catch {
      toastError("Network Error", "Failed to delete item.");
    } finally {
      setDeletingItemId(null);
    }
  };

  // Open User Data Inspector Modal
  const handleOpenUserDataModal = (targetUser: AdminUserRow) => {
    setUserDataModalTarget(targetUser);
    setIsLoadingUserData(true);
    fetch(`/api/admin/user-data?userId=${targetUser.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load user data");
        return res.json();
      })
      .then((data) => {
        setUserDetailedData({
          transactions: data.transactions || [],
          loans: data.loans || [],
        });
      })
      .catch((err) => {
        toastError("Error", err.message);
      })
      .finally(() => setIsLoadingUserData(false));
  };

  // Unauthorized Account Guard: Renders Access Denied matching requested design
  if (userRole !== "ADMIN") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#090D16] relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.12),rgba(255,255,255,0))]" />
        <div className="w-full max-w-md bg-[#111827]/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-xl shadow-rose-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              403 &bull; Unauthorized Account
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Access Denied
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
              Only registered <strong className="text-purple-400">System Administrators</strong> can log into and access the Admin Platform Telemetry page.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Signed In As:</span>
              <span className="font-mono text-white font-medium truncate max-w-[200px]">
                {session?.user?.email || "Guest"}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Account Role:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {userRole} (Student Account)
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800/80">
              <span>Admin Status:</span>
              <span className="text-rose-400 font-semibold">Not Authorized</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            If you believe this is an error, please sign out and log in with your authorized admin account, or ask an existing System Admin to grant you admin privileges.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition h-11 shadow-md shadow-indigo-600/30 active:scale-[0.99]"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Login Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell>
      {() => (
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header with Title and '+ Add New Admin' Action Button */}
          <div className="pb-4 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Admin Platform Telemetry
                </h1>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                  ADMIN PORTAL
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Real-time platform adoption analytics, user registration activity, and admin team management.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-600/25 transition active:scale-[0.99] self-start sm:self-auto shrink-0 min-h-[44px]"
            >
              <UserPlus className="w-4 h-4" />
              + Add New Admin
            </button>
          </div>

          {/* Privacy Invariant Banner */}
          <div className="px-4 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 shadow-sm">
            <LockKeyhole className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-900 dark:text-slate-200">Strict Financial Privacy Enforced:</strong> User wallet balances, money totals, and transaction amounts are private and completely excluded from admin telemetry.
            </span>
          </div>

          {/* Top 4 Metric Adoption Hero Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Registered Users */}
            <div className="p-5 rounded-3xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                  Total Registered Users
                </span>
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-financial font-extrabold text-slate-900 dark:text-white">
                {isLoading ? "..." : metrics?.totalUsers ?? 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total student & staff accounts</p>
            </div>

            {/* 2. Active Users This Month */}
            <div className="p-5 rounded-3xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  Active Users This Month
                </span>
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-financial font-extrabold text-emerald-600 dark:text-emerald-400">
                {isLoading ? "..." : metrics?.activeUsersThisMonth ?? 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Users active in current month</p>
            </div>

            {/* 3. New Signups This Month */}
            <div className="p-5 rounded-3xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  New Signups This Month
                </span>
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-financial font-extrabold text-blue-600 dark:text-blue-400">
                {isLoading ? "..." : metrics?.newSignupsThisMonth ?? 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Accounts created this month</p>
            </div>

            {/* 4. Total Platform Admins */}
            <div className="p-5 rounded-3xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl hover:border-amber-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  Total Platform Admins
                </span>
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-financial font-extrabold text-amber-600 dark:text-amber-400">
                {isLoading ? "..." : metrics?.totalAdmins ?? 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Accounts with ADMIN role</p>
            </div>
          </div>

          {/* User Registry Table */}
          <div className="rounded-3xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Registered Users Registry</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  User accounts and registration timestamps formatted in DD-MM-YYYY
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-3 py-1 rounded-full border border-slate-200/80 dark:border-white/[0.08]">
                Total Accounts: {users.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center text-rose-500 dark:text-rose-400 text-sm">{error}</div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-slate-900/60 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">User / Account</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Registered Date (DD-MM-YYYY)</th>
                        <th className="py-3 px-4 text-center">Transactions</th>
                        <th className="py-3 px-4 text-center">Loans</th>
                        <th className="py-3 px-4 text-right">Actions & Management</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 dark:divide-white/[0.05] text-sm">
                      {users.map((u) => {
                        const isSelf = !!currentUserId && u.id === currentUserId;
                        const isUpdating = updatingUserId === u.id;

                        return (
                          <tr key={u.id} className="hover:bg-indigo-50/40 dark:hover:bg-white/[0.03] transition">
                            <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                              {u.name || "Nameless"}
                              {isSelf && (
                                <span className="ml-2 text-[10px] text-slate-500 dark:text-slate-400 font-normal italic">
                                  (You)
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                              {u.email}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                  u.role === "ADMIN"
                                    ? "bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30"
                                    : "bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                              {formatDateDDMMYYYY(u.createdAt)}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-xs">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {u.transactionsCount}
                                </span>
                                {u.transactionsCount > 0 && !isSelf && (
                                  <button
                                    type="button"
                                    onClick={() => setClearTransactionsModalTarget(u)}
                                    className="p-1 rounded-lg hover:bg-rose-500/15 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                                    title={`Clear ${u.transactionsCount} transactions for ${u.name || u.email}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-xs">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {u.loansCount}
                                </span>
                                {u.loansCount > 0 && !isSelf && (
                                  <button
                                    type="button"
                                    onClick={() => setClearLoansModalTarget(u)}
                                    className="p-1 rounded-lg hover:bg-amber-500/15 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
                                    title={`Clear ${u.loansCount} loans for ${u.name || u.email}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isSelf ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 italic">Current Session</span>
                                    <button
                                      type="button"
                                      onClick={() => setResetPasswordModalTarget(u)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 dark:bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition active:scale-[0.98]"
                                      title="Change / reset your admin password"
                                    >
                                      <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                      <span>Reset Password</span>
                                    </button>
                                  </div>
                                ) : isUpdating ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Updating...
                                  </span>
                                ) : (
                                  <>
                                    {/* Reset Password Button */}
                                    <button
                                      type="button"
                                      onClick={() => setResetPasswordModalTarget(u)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 dark:bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition active:scale-[0.98]"
                                      title={`Reset password for ${u.name || u.email}`}
                                    >
                                      <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                      <span>Reset Password</span>
                                    </button>

                                    {/* Role Toggle Button */}
                                    {u.role === "USER" ? (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleRole(u, "ADMIN")}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/15 dark:bg-purple-600/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/25 transition active:scale-[0.98]"
                                        title="Promote to System Admin"
                                      >
                                        <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                        <span>Promote to Admin</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleRole(u, "USER")}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:border-rose-500/30 hover:bg-rose-500/10 transition active:scale-[0.98]"
                                        title="Demote to Standard User"
                                      >
                                        <UserMinus className="w-3.5 h-3.5" />
                                        <span>Demote to User</span>
                                      </button>
                                    )}

                                    {/* Manage Data Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenUserDataModal(u)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-700 dark:text-slate-300 border border-indigo-200 dark:border-slate-700/80 transition active:scale-[0.98]"
                                      title="Inspect & Remove Transactions or Loans"
                                    >
                                      <FolderEdit className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                      <span>Manage Data</span>
                                    </button>

                                    {/* Remove Account Button */}
                                    <button
                                      type="button"
                                      onClick={() => setDeleteUserModalTarget(u)}
                                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition active:scale-[0.98]"
                                      title={`Permanently delete account for ${u.name || u.email}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-slate-200/80 dark:divide-white/[0.05] p-2">
                  {users.map((u) => {
                    const isSelf = !!currentUserId && u.id === currentUserId;
                    const isUpdating = updatingUserId === u.id;

                    return (
                      <div key={u.id} className="p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {u.name || "Nameless"}
                            {isSelf && (
                              <span className="ml-1.5 text-[10px] text-slate-500 dark:text-slate-400 italic">
                                (You)
                              </span>
                            )}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              u.role === "ADMIN"
                                ? "bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30"
                                : "bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate">{u.email}</p>
                        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                          <span>Joined: {formatDateDDMMYYYY(u.createdAt)}</span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              {u.transactionsCount} txs
                              {u.transactionsCount > 0 && !isSelf && (
                                <button
                                  type="button"
                                  onClick={() => setClearTransactionsModalTarget(u)}
                                  className="text-rose-500 dark:text-rose-400 hover:text-rose-600 p-0.5"
                                  title="Clear transactions"
                                >
                                  <Trash2 className="w-3 h-3 inline" />
                                </button>
                              )}
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              {u.loansCount} loans
                              {u.loansCount > 0 && !isSelf && (
                                <button
                                  type="button"
                                  onClick={() => setClearLoansModalTarget(u)}
                                  className="text-amber-600 dark:text-amber-400 hover:text-amber-500 p-0.5"
                                  title="Clear loans"
                                >
                                  <Trash2 className="w-3 h-3 inline" />
                                </button>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Action on Mobile */}
                        <div className="pt-1 flex flex-wrap items-center justify-end gap-1.5">
                          {isSelf ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-500 italic">Current Session</span>
                              <button
                                type="button"
                                onClick={() => setResetPasswordModalTarget(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 dark:bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span>Reset Password</span>
                              </button>
                            </div>
                          ) : isUpdating ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Updating...
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setResetPasswordModalTarget(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 dark:bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span>Reset Password</span>
                              </button>

                              {u.role === "USER" ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleRole(u, "ADMIN")}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/15 dark:bg-purple-600/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/25 transition"
                                >
                                  <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                  <span>Promote</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleRole(u, "USER")}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:border-rose-500/30 transition"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                  <span>Demote</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenUserDataModal(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-slate-300 border border-indigo-200 dark:border-slate-700/80 transition"
                              >
                                <FolderEdit className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span>Manage</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteUserModalTarget(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </>
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
                        Create administrative email and password credentials
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseAdminModal}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Section */}
                <form onSubmit={handleCreateAdmin} className="space-y-3">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="admin-name"
                      className="block text-[11px] font-medium text-slate-300 mb-1"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="admin-name"
                        type="text"
                        required
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="Admin Full Name"
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
                      Admin Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="admin-email"
                        type="email"
                        required
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="admin@example.com"
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition h-9"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="admin-password"
                      className="block text-[11px] font-medium text-slate-300 mb-1"
                    >
                      Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="admin-password"
                        type={showAdminPassword ? "text" : "password"}
                        required
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-8 pr-11 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition h-9"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowAdminPassword((prev) => !prev)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white transition focus:outline-none"
                        aria-label={showAdminPassword ? "Hide password" : "Show password"}
                      >
                        {showAdminPassword ? (
                          <Eye className="w-4 h-4 text-purple-400 hover:text-purple-300" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="admin-confirm-password"
                      className="block text-[11px] font-medium text-slate-300 mb-1"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="admin-confirm-password"
                        type={showAdminConfirmPassword ? "text" : "password"}
                        required
                        value={newAdminConfirmPassword}
                        onChange={(e) => setNewAdminConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-8 pr-11 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition h-9"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowAdminConfirmPassword((prev) => !prev)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white transition focus:outline-none"
                        aria-label={showAdminConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showAdminConfirmPassword ? (
                          <Eye className="w-4 h-4 text-purple-400 hover:text-purple-300" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                        )}
                      </button>
                    </div>
                  </div>

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
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Create Admin Account
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 1. Remove User Account Confirmation Modal */}
          {deleteUserModalTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-md bg-[#111827] border border-rose-900/60 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Permanently Remove Account</h3>
                      <p className="text-[11px] text-slate-400">Irreversible account & data deletion</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteUserModalTarget(null)}
                    disabled={isDeletingUser}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>User / Account:</span>
                    <span className="font-semibold text-white">
                      {deleteUserModalTarget.name || "Nameless User"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Email Address:</span>
                    <span className="font-mono text-slate-200 truncate max-w-[200px]">
                      {deleteUserModalTarget.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Account Role:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                      {deleteUserModalTarget.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 pt-1.5 border-t border-slate-800/80">
                    <span>Associated Data:</span>
                    <span className="text-rose-400 font-semibold">
                      {deleteUserModalTarget.transactionsCount} transactions &bull;{" "}
                      {deleteUserModalTarget.loansCount} loans
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    Warning: This action will permanently wipe this user account, their wallet profile,
                    and all associated transactions and loans from PocketKhata. This cannot be undone.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteUserModalTarget(null)}
                    disabled={isDeletingUser}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteUser}
                    disabled={isDeletingUser}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-xs font-semibold text-white shadow-md shadow-rose-600/30 transition active:scale-[0.99]"
                  >
                    {isDeletingUser ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Deleting Account...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        Confirm Delete Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Clear All Transactions Confirmation Modal */}
          {clearTransactionsModalTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-md bg-[#111827] border border-rose-900/60 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                      <ReceiptText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Remove All Transactions</h3>
                      <p className="text-[11px] text-slate-400">Clear transaction history for user</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setClearTransactionsModalTarget(null)}
                    disabled={isClearingTransactions}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Target User:</span>
                    <span className="font-semibold text-white">
                      {clearTransactionsModalTarget.name || clearTransactionsModalTarget.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Email:</span>
                    <span className="font-mono text-slate-200 truncate max-w-[200px]">
                      {clearTransactionsModalTarget.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 pt-1.5 border-t border-slate-800/80">
                    <span>Transactions to Remove:</span>
                    <span className="text-rose-400 font-bold">
                      {clearTransactionsModalTarget.transactionsCount} record(s)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  Are you sure you want to delete all transaction records for this account? Their day-to-day
                  ledger history will be reset to zero.
                </p>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setClearTransactionsModalTarget(null)}
                    disabled={isClearingTransactions}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClearTransactions(clearTransactionsModalTarget)}
                    disabled={isClearingTransactions}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-xs font-semibold text-white shadow-md shadow-rose-600/30 transition active:scale-[0.99]"
                  >
                    {isClearingTransactions ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Clearing Transactions...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        Confirm Remove Transactions
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Clear All Loans Confirmation Modal */}
          {clearLoansModalTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-md bg-[#111827] border border-amber-900/60 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <HandCoins className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Remove All Peer Loans</h3>
                      <p className="text-[11px] text-slate-400">Clear Udhaar lending records for user</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setClearLoansModalTarget(null)}
                    disabled={isClearingLoans}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Target User:</span>
                    <span className="font-semibold text-white">
                      {clearLoansModalTarget.name || clearLoansModalTarget.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Email:</span>
                    <span className="font-mono text-slate-200 truncate max-w-[200px]">
                      {clearLoansModalTarget.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 pt-1.5 border-t border-slate-800/80">
                    <span>Loans to Remove:</span>
                    <span className="text-amber-400 font-bold">
                      {clearLoansModalTarget.loansCount} peer loan(s)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  Are you sure you want to delete all Udhaar loans for this account? All active and collected
                  loan records will be removed.
                </p>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setClearLoansModalTarget(null)}
                    disabled={isClearingLoans}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClearLoans(clearLoansModalTarget)}
                    disabled={isClearingLoans}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-xs font-semibold text-white shadow-md shadow-amber-600/30 transition active:scale-[0.99]"
                  >
                    {isClearingLoans ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Clearing Loans...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        Confirm Remove Loans
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Detailed User Data Inspector & Removal Modal */}
          {userDataModalTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
              <div className="w-full max-w-2xl bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 my-8 relative">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <FolderEdit className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        User Data Inspector & Management
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {userDataModalTarget.name || "User"} &bull; {userDataModalTarget.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDataModalTarget(null);
                      setUserDetailedData(null);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Privacy Guarantee Note */}
                <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <LockKeyhole className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    <strong className="text-slate-200">Financial Privacy Enforced:</strong> Money totals,
                    wallet balances, and transaction amounts are excluded from inspection.
                  </span>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <button
                    type="button"
                    onClick={() => setUserDataActiveTab("TRANSACTIONS")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      userDataActiveTab === "TRANSACTIONS"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <ReceiptText className="w-3.5 h-3.5" />
                    <span>Transactions</span>
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40">
                      {userDetailedData?.transactions.length ?? userDataModalTarget.transactionsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserDataActiveTab("LOANS")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      userDataActiveTab === "LOANS"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <HandCoins className="w-3.5 h-3.5" />
                    <span>Peer Loans</span>
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40">
                      {userDetailedData?.loans.length ?? userDataModalTarget.loansCount}
                    </span>
                  </button>
                </div>

                {/* Tab Content */}
                {isLoadingUserData ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                    <span className="text-xs">Loading user records...</span>
                  </div>
                ) : userDataActiveTab === "TRANSACTIONS" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">
                        Recorded Ledger Transactions (
                        {userDetailedData?.transactions.length || 0})
                      </span>
                      {userDetailedData && userDetailedData.transactions.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setClearTransactionsModalTarget(userDataModalTarget)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear All ({userDetailedData.transactions.length})</span>
                        </button>
                      )}
                    </div>

                    {!userDetailedData?.transactions || userDetailedData.transactions.length === 0 ? (
                      <div className="p-8 text-center rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                        No transactions found for this user account.
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-800 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
                        {userDetailedData.transactions.map((t) => (
                          <div key={t.id} className="p-3 flex items-center justify-between gap-3">
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    t.type === "EXPENSE"
                                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  }`}
                                >
                                  {t.type}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                                  {t.wallet}
                                </span>
                                <span className="font-semibold text-white truncate">
                                  {t.category}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                <span>{formatDateDDMMYYYY(t.date)}</span>
                                {t.description && <span>&bull; {t.description}</span>}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteSingleItem(
                                  userDataModalTarget.id,
                                  "DELETE_TRANSACTION",
                                  t.id
                                )
                              }
                              disabled={deletingItemId === t.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition shrink-0"
                              title="Delete this transaction"
                            >
                              {deletingItemId === t.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">
                        Peer Loans Recorded ({userDetailedData?.loans.length || 0})
                      </span>
                      {userDetailedData && userDetailedData.loans.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setClearLoansModalTarget(userDataModalTarget)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear All ({userDetailedData.loans.length})</span>
                        </button>
                      )}
                    </div>

                    {!userDetailedData?.loans || userDetailedData.loans.length === 0 ? (
                      <div className="p-8 text-center rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                        No peer loans found for this user account.
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-800 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
                        {userDetailedData.loans.map((l) => (
                          <div key={l.id} className="p-3 flex items-center justify-between gap-3">
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    l.status === "COLLECTED"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  }`}
                                >
                                  {l.status}
                                </span>
                                <span className="font-semibold text-white truncate">
                                  {l.borrowerName}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  ({l.borrowerPhone})
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                <span>Lent: {formatDateDDMMYYYY(l.lentDate)}</span>
                                <span>&bull; Due: {formatDateDDMMYYYY(l.dueDate)}</span>
                                {l.notes && <span>&bull; {l.notes}</span>}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteSingleItem(userDataModalTarget.id, "DELETE_LOAN", l.id)
                              }
                              disabled={deletingItemId === l.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition shrink-0"
                              title="Delete this peer loan"
                            >
                              {deletingItemId === l.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setResetPasswordModalTarget(userDataModalTarget);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition active:scale-[0.98]"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reset Password</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteUserModalTarget(userDataModalTarget);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition active:scale-[0.98]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete User Account</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDataModalTarget(null);
                      setUserDetailedData(null);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. Reset User Password Modal */}
          {resetPasswordModalTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-md bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl shadow-2xl p-6 relative overflow-hidden">
                {/* Subtle Amber Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset Account Password</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Set a new direct login password for this account</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseResetPasswordModal}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Target Account Summary */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {resetPasswordModalTarget.name || "Nameless User"}
                    </div>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
                      {resetPasswordModalTarget.email}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold shrink-0 ${
                      resetPasswordModalTarget.role === "ADMIN"
                        ? "bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30"
                        : "bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {resetPasswordModalTarget.role}
                  </span>
                </div>

                {/* Password Generator Toolbar */}
                <div className="mt-4 flex items-center justify-between gap-2 bg-amber-50/50 dark:bg-slate-900/50 p-2.5 rounded-2xl border border-amber-200/60 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Strong Password</span>
                  </button>

                  {resetNewPassword && (
                    <button
                      type="button"
                      onClick={handleCopyGeneratedPassword}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition shadow-sm"
                      title="Copy to clipboard"
                    >
                      {copiedResetPassword ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Form */}
                <form onSubmit={handleResetPasswordSubmit} className="mt-4 space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      New Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showResetPassword ? "text" : "password"}
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Enter new password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showResetPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showResetConfirmPassword ? "text" : "password"}
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Confirm new password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showResetConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {resetNewPassword &&
                      resetConfirmPassword &&
                      resetNewPassword.trim() !== resetConfirmPassword.trim() && (
                        <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 font-medium">
                          Passwords do not match.
                        </p>
                      )}
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200/80 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleCloseResetPasswordModal}
                      disabled={isResettingPassword}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isResettingPassword ||
                        resetNewPassword.trim().length < 6 ||
                        resetNewPassword.trim() !== resetConfirmPassword.trim()
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-400/20 transition active:scale-[0.98]"
                    >
                      {isResettingPassword ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Resetting...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Save New Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
