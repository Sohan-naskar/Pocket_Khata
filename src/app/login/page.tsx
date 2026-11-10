"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Wallet,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Shield,
  CheckCircle2,
  X,
  Mail,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const urlError = searchParams.get("error");
  const { error: toastError, success } = useToast();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(() => {
    if (urlError === "AdminMustUsePassword") {
      return "Admin accounts cannot use Google sign-in. Please log in at /admin/login.";
    }
    if (urlError === "OAuthCallbackError") {
      return "The Google authentication request was cancelled or mismatched. Please try again.";
    }
    return "";
  });

  // Dev Google Sign-In helper modal when GOOGLE_CLIENT_ID is not configured in .env
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [devGoogleEmail, setDevGoogleEmail] = useState("student@pocketkhata.app");
  const [isDevGoogleLoading, setIsDevGoogleLoading] = useState(false);

  React.useEffect(() => {
    if (urlError === "AdminMustUsePassword") {
      setErrorMessage(
        "Admin accounts cannot use Google sign-in. Please log in at /admin/login."
      );
    }
  }, [urlError]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage("");

    try {
      // Check if real Google OAuth credentials are configured in .env
      const statusRes = await fetch("/api/auth/providers-status").catch(() => null);
      const statusData = statusRes ? await statusRes.json() : null;

      if (!statusData?.googleConfigured) {
        setIsGoogleLoading(false);
        setIsGoogleModalOpen(true);
        return;
      }

      await signIn("google", { callbackUrl });
    } catch {
      toastError("Google Sign-In", "Unable to initiate Google sign-in. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleDevGoogleLogin = async (targetEmail: string) => {
    if (!targetEmail) {
      toastError("Missing Email", "Please enter an email address.");
      return;
    }

    setIsDevGoogleLoading(true);
    try {
      const clean = targetEmail.trim().toLowerCase();
      const res = await fetch("/api/auth/dev-google-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, isSignup: true }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "AdminMustUsePassword") {
          setIsGoogleModalOpen(false);
          setErrorMessage(data.message || "Admin accounts cannot use Google sign-in. Please log in at /admin/login.");
          return;
        }
        toastError("Sign-In Failed", data.error || "Unable to simulate Google sign-in.");
        return;
      }

      // Complete sign-in
      const signInRes = await signIn("student-dev-google", {
        email: data.email,
        devKey: data.devKey,
        redirect: false,
      });

      if (signInRes?.error) {
        toastError("Sign-In Error", "Could not complete simulated Google login.");
        return;
      }

      success("Welcome!", "Signing you into your Khata...");
      setIsGoogleModalOpen(false);
      window.location.href = callbackUrl || "/dashboard";
    } catch {
      toastError("Error", "Network error during simulated Google sign-in.");
    } finally {
      setIsDevGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand & Intro */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30">
          <Wallet className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Pocket<span className="text-indigo-400">Khata</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
          Student personal finance, dual-wallet auto ledger & peer Udhaar tracker.
        </p>
      </div>

      {/* Main Student Login Card */}
      <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
        {/* Admin Error Alert Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-100">
                  {urlError === "AdminMustUsePassword"
                    ? "Administrator Notice"
                    : "Authentication Alert"}
                </strong>
                <span>{errorMessage}</span>
              </div>
            </div>

            {urlError === "AdminMustUsePassword" && (
              <div className="pt-1">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white underline underline-offset-2 transition"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  <span>Go to Administrator Login &rarr;</span>
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="space-y-1">
          <h2 className="text-base font-bold text-white">Student Sign-In</h2>
          <p className="text-xs text-slate-400">
            One-click authentication using your Google account.
          </p>
        </div>

        {/* Primary CTA: Large "Continue with Google" Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition shadow-lg shadow-white/10 active:scale-[0.99] disabled:opacity-75 min-h-[48px]"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
                <span>Connecting with Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Value Prop Badges */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Dual-wallet balance tracking (Online UPI + Physical Cash)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Peer-to-peer Udhaar loans & 1-tap reminders</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Strict chronological DD-MM-YYYY day ledger</span>
          </div>
        </div>
      </div>

      {/* Subtle Footer Link to Staff / Admin Portal */}
      <div className="text-center pt-2">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-purple-400 transition"
        >
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span>Staff / Admin Portal &rarr;</span>
        </Link>
      </div>

      {/* Local Dev Simulated Google Modal (When GOOGLE_CLIENT_ID is not configured in .env) */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GoogleIcon />
                <div>
                  <h3 className="text-base font-bold text-white">Google Sign-In (Local Dev)</h3>
                  <p className="text-[11px] text-slate-400">Simulate one-click student login</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-blue-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Real Google OAuth credentials are not set in <code>.env</code>. Enter any student email to simulate instant Google authentication.
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDevGoogleLogin(devGoogleEmail);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Student Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={devGoogleEmail}
                    onChange={(e) => setDevGoogleEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition h-9"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDevGoogleLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition"
                >
                  {isDevGoogleLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign In as Student</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-[#F9FAFB] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <span>Loading PocketKhata...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
