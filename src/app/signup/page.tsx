"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Wallet,
  Lock,
  Mail,
  User,
  Loader2,
  ArrowRight,
  ShieldAlert,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { success, error: toastError } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Dev Google Sign-Up helper modal when GOOGLE_CLIENT_ID is not configured in .env
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [devGoogleEmail, setDevGoogleEmail] = useState("");
  const [isDevGoogleLoading, setIsDevGoogleLoading] = useState(false);

  React.useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "Configuration") {
      toastError(
        "OAuth Configuration Notice",
        "Google credentials or NEXTAUTH_URL need to be set in Vercel settings."
      );
    } else if (errorParam) {
      toastError("Authentication Notice", `Sign-up notice: ${errorParam}`);
    }
  }, [searchParams, toastError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toastError("Missing Information", "Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      toastError("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: "USER",
          startingOnline: 0,
          startingCash: 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toastError("Registration Failed", data.error || "Unable to create account.");
        setIsLoading(false);
        return;
      }

      success("Account Created!", "Signing you into your personal Khata...");

      const signInRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        window.location.href = "/login";
      } else {
        window.location.href = callbackUrl || "/dashboard";
      }
    } catch {
      toastError("Error", "Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      // Check if real Google OAuth is configured in .env
      const statusRes = await fetch("/api/auth/providers-status").catch(() => null);
      const statusData = statusRes ? await statusRes.json() : null;

      if (!statusData?.googleConfigured) {
        setIsGoogleLoading(false);
        setIsGoogleModalOpen(true);
        return;
      }

      if (typeof document !== "undefined") {
        document.cookie = "pk_signup_flow=true; path=/; max-age=600; SameSite=Lax";
      }
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      toastError("Google Sign-In", "Unable to sign in with Google. Check client credentials.");
      setIsGoogleLoading(false);
    }
  };

  const handleDevGoogleSignup = async (targetEmail: string) => {
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
        toastError("Sign-Up Failed", data.error || "Unable to complete Google sign-up.");
        return;
      }

      const signInRes = await signIn("credentials", {
        email: data.email,
        password: data.tempPassword,
        redirect: false,
      });

      if (signInRes?.error) {
        window.location.href = "/login";
        return;
      }

      success("Account Created!", "Signing you into your Khata...");
      setIsGoogleModalOpen(false);
      window.location.href = "/dashboard";
    } catch {
      toastError("Error", "Network error during simulated Google sign-up.");
    } finally {
      setIsDevGoogleLoading(false);
    }
  };

  return (
    <>
      <div className="bg-[#111827]/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
          {/* Name and Email side-by-side on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-[11px] font-medium text-slate-300 mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="User Name"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition h-9"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-[11px] font-medium text-slate-300 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition h-9"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="signup-password"
              className="block text-[11px] font-medium text-slate-300 mb-1"
            >
              Password (min 6 chars)
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="signup-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition h-9"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition h-10 active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Creating your Khata...
              </>
            ) : (
              <>
                Create Account & Open Khata
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-2 sm:my-2.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#111827] px-2.5 text-slate-500 tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign-up Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2 px-3 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-200 text-xs sm:text-sm font-medium transition h-10"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            )}
            Sign up with Google
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-400 mt-2.5">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
          >
            Log in
          </Link>
        </p>
      </div>

      {/* Google OAuth Setup / Dev Sign-Up Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Google OAuth Setup Required
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Fix Google Error 401: invalid_client
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error explanation */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs leading-relaxed space-y-1">
              <p className="font-semibold text-amber-200">Why did Google show Error 401: invalid_client?</p>
              <p className="text-slate-300 text-[11px]">
                Google Cloud OAuth credentials (<code className="text-amber-300">GOOGLE_CLIENT_ID</code> and <code className="text-amber-300">GOOGLE_CLIENT_SECRET</code>) are not yet configured in your <code className="text-indigo-300">.env</code> file.
              </p>
            </div>

            {/* Option 1: Instant One-Click Sign-up with Google Account */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Instant Google Sign-Up (Local & Dev)
                </span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Enter your Google email to immediately create an account without waiting for Google Cloud Console:
              </p>

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={devGoogleEmail}
                    onChange={(e) => setDevGoogleEmail(e.target.value)}
                    placeholder="your-google-email@gmail.com"
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-indigo-500 text-xs text-white outline-none h-9"
                  />
                </div>

                <button
                  type="button"
                  disabled={isDevGoogleLoading}
                  onClick={() => handleDevGoogleSignup(devGoogleEmail)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition h-9 shadow-md shadow-indigo-600/30 disabled:opacity-60"
                >
                  {isDevGoogleLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                  Create Account with Google Email
                </button>
              </div>
            </div>

            {/* Option 2: Step-by-Step Google Cloud Setup */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
              <p className="font-semibold text-slate-300 text-[11px]">
                To Enable Real Google Cloud OAuth:
              </p>
              <ol className="list-decimal list-inside text-[11px] text-slate-400 space-y-1">
                <li>Create an OAuth Client ID at <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-indigo-400 underline">Google Cloud Console</a>.</li>
                <li>Set Authorized Redirect URI to: <code className="text-slate-300 bg-slate-950 px-1 py-0.5 rounded">http://localhost:3000/api/auth/callback/google</code></li>
                <li>Add credentials to <code className="text-slate-300 bg-slate-950 px-1 py-0.5 rounded">.env</code>:
                  <div className="mt-1 font-mono text-[10px] bg-slate-950 p-2 rounded text-slate-300 border border-slate-800">
                    GOOGLE_CLIENT_ID=&quot;your-id.apps.googleusercontent.com&quot;<br />
                    GOOGLE_CLIENT_SECRET=&quot;GOCSPX-your-secret&quot;
                  </div>
                </li>
              </ol>
            </div>

            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(false)}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-3 py-3 sm:py-6 bg-[#090D16]">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(255,255,255,0))]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-2 sm:mb-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition mb-1.5 shadow-md"
          >
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow shadow-indigo-600/30">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Pocket<span className="text-indigo-400">Khata</span>
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Join PocketKhata
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track daily UPI balance, cash, and friend loans easily.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 text-center">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400 mx-auto" />
              <p className="text-xs text-slate-400 mt-2">Loading signup...</p>
            </div>
          }
        >
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
