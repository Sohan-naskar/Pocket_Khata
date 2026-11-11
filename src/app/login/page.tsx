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
  UserCircle2,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { success, error: toastError } = useToast();

  const [accountType, setAccountType] = useState<"USER" | "ADMIN">("USER");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
        email: attemptEmail || session?.user?.email || "sohannaskar2004@gmail.com",
        role: "USER (Personal Account)",
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
    setIdentifier("");
    setPassword("");
    router.replace("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toastError("Missing Fields", "Please enter your username/email and password.");
      return;
    }

    setIsLoading(true);
    setAdminLoginError("");
    try {
      const cleanIdentifier = identifier.trim().toLowerCase();
      const res = await signIn("credentials", {
        email: cleanIdentifier,
        password,
        redirect: false,
      });

      if (res?.error) {
        toastError("Login Failed", "Invalid username/email or password. Please verify your credentials.");
        setIsLoading(false);
        return;
      }

      // Verify the user's actual registered role from the newly established session
      const userSession = await getSession();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentRole = (userSession?.user as any)?.role || "USER";

      // If user attempted to log in as System Admin, but their account role is NOT ADMIN:
      if (accountType === "ADMIN" && currentRole !== "ADMIN") {
        await signOut({ redirect: false });
        setUnauthorizedAccountInfo({
          email: cleanIdentifier,
          role: `${currentRole} (Personal Account)`,
        });
        setIsLoading(false);
        return;
      }

      success(
        "Welcome back!",
        currentRole === "ADMIN" ? "Redirecting to Admin Portal..." : "Redirecting to your dashboard..."
      );
      const destination = currentRole === "ADMIN" ? "/admin" : callbackUrl;
      window.location.href = destination;
    } catch {
      toastError("Error", "Something went wrong during sign-in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 403 Access Denied View for Unauthorized Accounts on the Login Page
  if (unauthorizedAccountInfo) {
    return (
      <div className="space-y-5 text-center animate-in fade-in duration-200">
        {/* Shield Icon Container with Glow */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-xl shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Heading & Badge */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            403 &bull; Unauthorized Account
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Access Denied
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
            Only registered <strong className="text-purple-400">System Administrators</strong> can log into and access the Admin Platform Telemetry page.
          </p>
        </div>

        {/* Account Details Box */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Signed In As:</span>
            <span className="font-mono text-white font-medium truncate max-w-[200px]">
              {unauthorizedAccountInfo.email}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Account Role:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {unauthorizedAccountInfo.role || "USER (Personal Account)"}
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

        {/* Single Action Button: Return to Login Page */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleReturnToLogin}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition h-11 shadow-md shadow-indigo-600/30 active:scale-[0.99]"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Login Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Account Type Selector Tabs */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Account Type
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={handleSelectUser}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
              accountType === "USER"
                ? "bg-indigo-600/25 text-indigo-300 border border-indigo-500/50 shadow-sm"
                : "text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            <UserCircle2 className="w-4 h-4" />
            <span>Personal Account</span>
          </button>
          <button
            type="button"
            onClick={handleSelectAdmin}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
              accountType === "ADMIN"
                ? "bg-purple-600/25 text-purple-300 border border-purple-500/50 shadow-sm"
                : "text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>System Admin</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {adminLoginError && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{adminLoginError}</span>
        </div>
      )}

      {/* Manual Username/Email & Password Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Username or Email Address */}
        <div>
          <label
            htmlFor="identifier"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            {accountType === "ADMIN" ? "Admin Username or Email" : "Username or Email"}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="identifier"
              type="text"
              required
              autoComplete="username email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={
                accountType === "ADMIN"
                  ? "admin@example.com or admin"
                  : "user@example.com or username"
              }
              disabled={isLoading}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-10"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Password (min 6 chars)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={isLoading}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-10"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl disabled:opacity-60 text-white font-semibold text-xs sm:text-sm shadow-md transition h-10 active:scale-[0.99] ${
              accountType === "ADMIN"
                ? "bg-purple-600 hover:bg-purple-500 shadow-purple-600/30"
                : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>
                  {accountType === "ADMIN"
                    ? "Sign In as System Admin"
                    : "Sign In & Open Khata"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Navigation */}
      <p className="text-center text-xs text-slate-400 pt-1">
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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#090D16] relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />

      <div className="w-full max-w-md relative z-10 space-y-5">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30">
            <Wallet className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pocket<span className="text-indigo-400">Khata</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
            Student personal finance, dual-wallet auto ledger &amp; peer Udhaar tracker.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
          <Suspense
            fallback={
              <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
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
