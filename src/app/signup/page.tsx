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
  Shield,
  UserCircle2,
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
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
          role,
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
        router.push("/login");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toastError("Error", "Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      toastError("Google Sign-In", "Unable to sign in with Google. Check client credentials.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="bg-[#111827]/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
      <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
        {/* Account Role Selector */}
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setRole("USER")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border text-xs font-semibold transition h-9 ${
                role === "USER"
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500"
                  : "bg-slate-900 border-slate-700/80 text-slate-400 hover:text-white"
              }`}
            >
              <UserCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              Personal Account
            </button>
            <button
              type="button"
              onClick={() => setRole("ADMIN")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border text-xs font-semibold transition h-9 ${
                role === "ADMIN"
                  ? "bg-purple-600/20 border-purple-500 text-purple-300 ring-1 ring-purple-500"
                  : "bg-slate-900 border-slate-700/80 text-slate-400 hover:text-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              System Admin
            </button>
          </div>
        </div>

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
                placeholder="Aryan Sharma"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition h-10 active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Creating Account...
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
              Or sign up with
            </span>
          </div>
        </div>

        {/* Google Sign-In Button (In place of Initial Wallet Split) */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full flex items-center justify-center gap-2.5 py-2 px-3 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-200 text-xs sm:text-sm font-medium transition h-10 shadow-sm"
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
