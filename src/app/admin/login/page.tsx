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
  Eye,
  EyeOff,
} from "lucide-react";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="w-full max-w-[370px] space-y-3">
      {/* Brand & Badge Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold shadow-md shadow-purple-500/10">
          <Shield className="w-3 h-3 text-purple-400" />
          <span>PocketKhata &bull; System Administration</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Admin Portal Sign-In
        </h1>
        <p className="text-[11px] text-slate-400 max-w-[260px] mx-auto leading-tight">
          Authorized personnel only. Authenticate using your administrative credentials.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-[#111827]/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-3">
        {/* Error Banner */}
        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-[11px] text-rose-300 flex items-start gap-2 animate-in fade-in duration-200">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-semibold block text-rose-200">Authentication Failed</strong>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Admin Username or Email */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-[11px] font-medium text-slate-300 mb-1"
            >
              Admin Username or Email
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-email"
                type="text"
                required
                autoComplete="username email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com or username"
                disabled={isLoading}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-9"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-[11px] font-medium text-slate-300 mb-1"
            >
              Administrator Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading}
                className="w-full pl-8 pr-11 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-9"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Eye className="w-4 h-4 text-purple-400 hover:text-purple-300" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-0.5">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition h-9 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sign In to Admin Portal</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
          <LockKeyhole className="w-3 h-3 text-slate-500 shrink-0" />
          <span>Strict zero-trust security. Role-based administrator credentials.</span>
        </div>
      </div>

      {/* Return to Login Page */}
      <div className="text-center pt-0.5">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Return to Login Page</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-[#F9FAFB] flex flex-col justify-center items-center px-4 py-4 sm:py-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span>Loading admin authentication...</span>
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
