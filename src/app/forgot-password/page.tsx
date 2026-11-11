"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  Mail,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function ForgotPasswordPage() {
  const { success, error: toastError } = useToast();

  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!identifier.trim()) {
      const msg = "Please enter your registered email address or username.";
      setFormError(msg);
      toastError("Missing Information", msg);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || "Unable to generate password reset link.";
        setFormError(msg);
        toastError("Request Failed", msg);
        setIsLoading(false);
        return;
      }

      success("Link Created", "Password reset link generated successfully.");
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      } else {
        setResetUrl("/login");
      }
    } catch {
      const msg = "Network error. Could not request password reset.";
      setFormError(msg);
      toastError("Network Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

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
            Self-service student password recovery &amp; credential reset.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-[#111827]/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-3">
          {resetUrl ? (
            /* Success State */
            <div className="text-center space-y-3 animate-in fade-in duration-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Reset Link Ready
                </h2>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  A secure 1-hour password reset link has been prepared for your account.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-left space-y-1 text-[11px] text-slate-400">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>Expiration:</span>
                  <span className="text-emerald-400 font-mono">60 Minutes</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  In this local installation, you can directly proceed below to set your new password.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href={resetUrl}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition h-9 active:scale-[0.99]"
                >
                  <span>Set New Password Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
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
          ) : (
            /* Input Form State */
            <>
              {/* Inline Error Alert */}
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-2 animate-in fade-in duration-200">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <h2 className="text-xs sm:text-sm font-semibold text-white">
                  Reset Your Password
                </h2>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter your registered username or email address below to generate a secure recovery link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                  <label
                    htmlFor="identifier"
                    className="block text-[11px] font-medium text-slate-300 mb-1"
                  >
                    Email Address or Username
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="identifier"
                      type="text"
                      required
                      autoComplete="email username"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (formError) setFormError("");
                      }}
                      placeholder="user@example.com or username"
                      disabled={isLoading}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-9"
                    />
                  </div>
                </div>

                <div className="pt-0.5">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition h-9 active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Reset Link...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate Reset Link</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Footer Return Link */}
              <p className="text-center text-[11px] text-slate-400 pt-0.5">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
                >
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

