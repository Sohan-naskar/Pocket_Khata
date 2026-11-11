"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { success, error: toastError } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!token) {
      const msg = "Invalid or missing password reset token. Please request a new link.";
      setFormError(msg);
      toastError("Invalid Token", msg);
      return;
    }

    if (!password || !confirmPassword) {
      const msg = "Please enter and confirm your new password.";
      setFormError(msg);
      toastError("Missing Fields", msg);
      return;
    }

    if (password.length < 6) {
      const msg = "New password must be at least 6 characters long.";
      setFormError(msg);
      toastError("Weak Password", msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = "Passwords do not match. Please verify both fields.";
      setFormError(msg);
      toastError("Password Mismatch", msg);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || "Could not reset password.";
        setFormError(msg);
        toastError("Reset Failed", msg);
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      success("Password Reset!", "Your password has been successfully updated.");
    } catch {
      const msg = "Network error. Please try again.";
      setFormError(msg);
      toastError("Network Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-3 animate-in fade-in duration-200">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <h2 className="text-sm sm:text-base font-bold text-white">
            Password Reset Complete!
          </h2>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Your PocketKhata credentials have been updated securely. You can now sign in with your new password.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition h-9 active:scale-[0.99]"
          >
            <span>Sign In to PocketKhata</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center space-y-3 animate-in fade-in duration-200">
        <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <h2 className="text-sm sm:text-base font-bold text-white">
            Invalid Reset Link
          </h2>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            No valid password reset token was found in the URL. Reset links expire after 60 minutes or after use.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <Link
            href="/forgot-password"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition h-9"
          >
            <span>Request New Reset Link</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition h-9"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Inline Error Alert */}
      {formError && (
        <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-2 animate-in fade-in duration-200">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{formError}</span>
        </div>
      )}

      <div className="space-y-1">
        <h2 className="text-xs sm:text-sm font-semibold text-white">
          Create New Password
        </h2>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Choose a secure password with a minimum of 6 characters for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* New Password */}
        <div>
          <label
            htmlFor="new-password"
            className="block text-[11px] font-medium text-slate-300 mb-1"
          >
            New Password (min 6 chars)
          </label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formError) setFormError("");
              }}
              placeholder="••••••••••••"
              disabled={isLoading}
              className="w-full pl-8 pr-11 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-9"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <Eye className="w-4 h-4 text-indigo-400 hover:text-indigo-300" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-200" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-[11px] font-medium text-slate-300 mb-1"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (formError) setFormError("");
              }}
              placeholder="••••••••••••"
              disabled={isLoading}
              className="w-full pl-8 pr-11 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-9"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition focus:outline-none"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? (
                <Eye className="w-4 h-4 text-indigo-400 hover:text-indigo-300" />
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
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition h-9 active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Update Password &amp; Open Khata</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Navigation */}
      <p className="text-center text-[11px] text-slate-400 pt-0.5">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-4 sm:py-6 bg-[#090D16] relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />

      <div className="w-full max-w-[370px] relative z-10 space-y-3">
        {/* Header Branding */}
        <div className="text-center space-y-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-600/30">
            <KeyRound className="w-4.5 h-4.5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Pocket<span className="text-indigo-400">Khata</span>
          </h1>
          <p className="text-[11px] text-slate-400 max-w-[260px] mx-auto leading-tight">
            Set your new account password to restore access.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-[#111827]/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
          <Suspense
            fallback={
              <div className="flex items-center justify-center gap-2 py-6 text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Validating reset link...</span>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

