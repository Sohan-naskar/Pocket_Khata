"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, getSession, useSession } from "next-auth/react";
import {
  Wallet,
  Lock,
  Mail,
  Loader2,
  ArrowRight,
  Shield,
  GraduationCap,
  ShieldAlert,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { success, error: toastError } = useToast();

  const [accountType, setAccountType] = useState<"USER" | "ADMIN">("USER");

  // Strict Credential Isolation: Separate state for Student Account
  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Strict Credential Isolation: Separate state for System Admin Account
  const [adminIdentifier, setAdminIdentifier] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [adminLoginError, setAdminLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 403 Unauthorized Account State
  const [unauthorizedAccountInfo, setUnauthorizedAccountInfo] = useState<{
    email: string;
    role?: string;
  } | null>(null);

  React.useEffect(() => {
    const errorParam = searchParams.get("error");
    const attemptEmail = searchParams.get("attemptEmail");

    if (errorParam === "unauthorized" || errorParam === "AdminUnauthorized" || errorParam === "AccessDenied") {
      setUnauthorizedAccountInfo({
        email: attemptEmail || session?.user?.email || "user@pocketkhata.app",
        role: "USER (Student Account)",
      });
    } else if (errorParam === "CredentialsSignin") {
      toastError("Authentication Failed", "Invalid username/email or password. Please verify your credentials.");
    }
  }, [searchParams, session?.user?.email, toastError]);

  const handleSelectAdmin = () => {
    setAccountType("ADMIN");
    setAdminLoginError("");
  };

  const handleSelectUser = () => {
    setAccountType("USER");
    setAdminLoginError("");
  };

  const handleReturnToLogin = async () => {
    try {
      await signOut({ redirect: false });
    } catch {
      // Ignore errors during logout
    }
    setUnauthorizedAccountInfo(null);
    setAccountType("USER");
    setAdminLoginError("");
    setStudentIdentifier("");
    setStudentPassword("");
    setAdminIdentifier("");
    setAdminPassword("");
    router.replace("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (accountType === "USER") {
      if (!studentIdentifier || !studentPassword) {
        toastError("Missing Fields", "Please enter your student username/email and password.");
        return;
      }
    } else {
      if (!adminIdentifier || !adminPassword) {
        toastError("Missing Fields", "Please enter your admin username/email and password.");
        return;
      }
    }

    setIsLoading(true);
    setAdminLoginError("");

    try {
      if (accountType === "ADMIN") {
        const cleanAdminId = adminIdentifier.trim().toLowerCase();

        // 1. Pre-verify if account exists and whether it has permission to log in as ADMIN
        const verifyRes = await fetch("/api/auth/verify-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanAdminId }),
        }).catch(() => null);

        if (verifyRes && verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.exists && verifyData.role && verifyData.role !== "ADMIN") {
            setUnauthorizedAccountInfo({
              email: cleanAdminId,
              role: `${verifyData.role} (Student Account)`,
            });
            setIsLoading(false);
            return;
          }
        }

        // 2. Perform NextAuth Credentials Sign-In
        const res = await signIn("credentials", {
          identifier: cleanAdminId,
          email: cleanAdminId,
          password: adminPassword,
          accountType: "ADMIN",
          redirect: false,
        });

        if (res?.error) {
          toastError("Login Failed", "Invalid admin credentials. Please verify your username/email and password.");
          setIsLoading(false);
          return;
        }

        success("Welcome back!", "Redirecting to Admin Portal...");
        window.location.href = "/admin";
      } else {
        // Student login
        const cleanStudentId = studentIdentifier.trim().toLowerCase();

        const res = await signIn("credentials", {
          identifier: cleanStudentId,
          email: cleanStudentId,
          password: studentPassword,
          accountType: "USER",
          redirect: false,
        });

        if (res?.error) {
          toastError("Login Failed", "Invalid student username/email or password. Please verify your credentials.");
          setIsLoading(false);
          return;
        }

        success("Welcome back!", "Redirecting to your student dashboard...");
        window.location.href = callbackUrl || "/dashboard";
      }
    } catch {
      toastError("Error", "Something went wrong during sign-in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 403 Access Denied View for Unauthorized Accounts on the Login Page
  if (unauthorizedAccountInfo) {
    return (
      <div className="space-y-3 text-center animate-in fade-in duration-200">
        {/* Shield Icon Container with Glow */}
        <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-6 h-6" />
        </div>

        {/* Heading & Badge */}
        <div className="space-y-1">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            403 &bull; Unauthorized Account
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Access Denied
          </h2>
          <p className="text-[11px] text-slate-300 leading-relaxed max-w-xs mx-auto">
            Only registered <strong className="text-purple-400">System Administrators</strong> can log into and access the Admin Platform Telemetry page.
          </p>
        </div>

        {/* Account Details Box */}
        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-left space-y-2 text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>Signed In As:</span>
            <span className="font-mono text-white font-medium truncate max-w-[170px]">
              {unauthorizedAccountInfo.email}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Account Role:</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {unauthorizedAccountInfo.role || "USER (Student Account)"}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400 pt-1.5 border-t border-slate-800/80">
            <span>Admin Status:</span>
            <span className="text-rose-400 font-semibold">Not Authorized</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
          If you believe this is an error, please sign out and log in with your authorized admin account, or ask an existing System Admin to grant you admin privileges.
        </p>

        {/* Single Action Button: Return to Login Page */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleReturnToLogin}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition h-9 shadow-md shadow-indigo-600/30 active:scale-[0.99]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Login Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Account Type Selector Tabs */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
          Account Type
        </label>
        <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-slate-900/90 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={handleSelectUser}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-semibold transition ${
              accountType === "USER"
                ? "bg-indigo-600/25 text-indigo-300 border border-indigo-500/50 shadow-sm"
                : "text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Account</span>
          </button>
          <button
            type="button"
            onClick={handleSelectAdmin}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-semibold transition ${
              accountType === "ADMIN"
                ? "bg-purple-600/25 text-purple-300 border border-purple-500/50 shadow-sm"
                : "text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>System Admin</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {adminLoginError && (
        <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-2 animate-in fade-in duration-200">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{adminLoginError}</span>
        </div>
      )}

      {/* Manual Username/Email & Password Login Form */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* Username or Email Address */}
        <div>
          <label
            htmlFor={accountType === "ADMIN" ? "admin-identifier" : "student-identifier"}
            className="block text-[11px] font-medium text-slate-300 mb-1"
          >
            {accountType === "ADMIN" ? "Admin Username or Email" : "Username or Email"}
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {accountType === "ADMIN" ? (
              <input
                id="admin-identifier"
                key="admin-id-input"
                type="text"
                required
                autoComplete="username email"
                value={adminIdentifier}
                onChange={(e) => setAdminIdentifier(e.target.value)}
                placeholder="admin@pocketkhata.app or admin"
                disabled={isLoading}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-9"
              />
            ) : (
              <input
                id="student-identifier"
                key="student-id-input"
                type="text"
                required
                autoComplete="username email"
                value={studentIdentifier}
                onChange={(e) => setStudentIdentifier(e.target.value)}
                placeholder="student@example.com or username"
                disabled={isLoading}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-9"
              />
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor={accountType === "ADMIN" ? "admin-password" : "student-password"}
              className="block text-[11px] font-medium text-slate-300"
            >
              Password (min 6 chars)
            </label>
            {accountType === "USER" && (
              <Link
                href="/forgot-password"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 transition"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {accountType === "ADMIN" ? (
              <>
                <input
                  id="admin-password"
                  key="admin-pass-input"
                  type={showAdminPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  className="w-full pl-8 pr-11 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-9"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowAdminPassword((prev) => !prev)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition focus:outline-none"
                  aria-label={showAdminPassword ? "Hide password" : "Show password"}
                >
                  {showAdminPassword ? (
                    <Eye className="w-4 h-4 text-purple-400 hover:text-purple-300" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                  )}
                </button>
              </>
            ) : (
              <>
                <input
                  id="student-password"
                  key="student-pass-input"
                  type={showStudentPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  className="w-full pl-8 pr-11 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-9"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowStudentPassword((prev) => !prev)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition focus:outline-none"
                  aria-label={showStudentPassword ? "Hide password" : "Show password"}
                >
                  {showStudentPassword ? (
                    <Eye className="w-4 h-4 text-indigo-400 hover:text-indigo-300" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-0.5">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg disabled:opacity-60 text-white font-semibold text-xs shadow-md transition h-9 active:scale-[0.99] ${
              accountType === "ADMIN"
                ? "bg-purple-600 hover:bg-purple-500 shadow-purple-600/30"
                : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>
                  {accountType === "ADMIN"
                    ? "Sign In as System Admin"
                    : "Sign In as Student"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Navigation */}
      <p className="text-center text-[11px] text-slate-400 pt-0.5">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-4 sm:py-6 bg-[#090D16] relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />

      <div className="w-full max-w-[370px] relative z-10 space-y-3">
        {/* Header Branding */}
        <div className="text-center space-y-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-600/30">
            <Wallet className="w-4.5 h-4.5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Pocket<span className="text-indigo-400">Khata</span>
          </h1>
          <p className="text-[11px] text-slate-400 max-w-[260px] mx-auto leading-tight">
            Student personal finance, dual-wallet auto ledger &amp; peer Udhaar tracker.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-[#111827]/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
          <Suspense
            fallback={
              <div className="flex items-center justify-center gap-2 py-6 text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Loading sign-in...</span>
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
