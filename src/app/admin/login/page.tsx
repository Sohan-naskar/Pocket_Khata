"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Shield,
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  LockKeyhole,
} from "lucide-react";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(() => {
    if (urlError === "AdminUnauthorized") {
      return "Administrator privileges required to access the admin portal.";
    }
    if (urlError === "CredentialsSignin") {
      return "Invalid administrator credentials. Please verify your email and password.";
    }
    return "";
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both admin email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg("Invalid administrator credentials or unauthorized account.");
        setIsLoading(false);
        return;
      }

      // Successful admin login -> navigate to Admin Portal
      window.location.href = callbackUrl || "/admin";
    } catch {
      setErrorMsg("Network error during sign-in. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand & Badge Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-md shadow-purple-500/10">
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span>PocketKhata &bull; System Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Admin Portal Sign-In
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
          Authorized personnel only. Authenticate using your administrative credentials.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-4">
        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-200">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-semibold block text-rose-200">Authentication Failed</strong>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin Email */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pocketkhata.app"
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-10"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Administrator Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-10"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-600/30 transition h-11 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to Admin Portal</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
          <LockKeyhole className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Strict zero-trust security. Google OAuth disabled for admin accounts.</span>
        </div>
      </div>

      {/* Return to Login Page */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Login Page</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-[#F9FAFB] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            <span>Loading admin authentication...</span>
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
