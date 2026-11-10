"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Wallet,
  Lock,
  Mail,
  User,
  Loader2,
  ArrowRight,
  UserCircle2,
  CheckCircle2,
  Sparkles,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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

export default function SignupPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Dev Google Sign-In helper modal when GOOGLE_CLIENT_ID is not configured in .env
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [devGoogleEmail, setDevGoogleEmail] = useState("newstudent@pocketkhata.app");
  const [isDevGoogleLoading, setIsDevGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toastError("Missing Fields", "Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      toastError("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: cleanEmail,
          password,
          role: "USER",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError("Registration Failed", data.error || "Unable to create account.");
        setIsLoading(false);
        return;
      }

      success("Account Created!", "Signing you into your new PocketKhata...");

      // Automatically sign in the newly registered personal user
      const loginRes = await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    } catch {
      toastError("Network Error", "Could not complete registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      // Check if real Google OAuth credentials are configured in .env
      const statusRes = await fetch("/api/auth/providers-status").catch(() => null);
      const statusData = statusRes ? await statusRes.json() : null;

      if (!statusData?.googleConfigured) {
        setIsGoogleLoading(false);
        setIsGoogleModalOpen(true);
        return;
      }

      await signIn("google", { callbackUrl: "/dashboard" });
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
        body: JSON.stringify({ email: clean }),
      });
      const data = await res.json();

      if (!res.ok) {
        toastError("Sign-In Failed", data.error || "Unable to simulate Google sign-in.");
        return;
      }

      // Complete sign-in via student-dev-google
      const signInRes = await signIn("student-dev-google", {
        email: data.email,
        devKey: data.devKey,
        redirect: false,
      });

      if (signInRes?.error) {
        toastError("Sign-In Error", "Could not complete simulated Google login.");
        return;
      }

      success("Welcome!", "Opening your new Khata...");
      setIsGoogleModalOpen(false);
      window.location.href = "/dashboard";
    } catch {
      toastError("Error", "Network error during simulated Google sign-in.");
    } finally {
      setIsDevGoogleLoading(false);
    }
  };

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
            Create your student personal account to track cash, UPI, and Udhaar loans.
          </p>
        </div>

        {/* Main Card Container (Matching 2nd Reference Photo) */}
        <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-4">
          {/* Account Type (Strictly Personal Account Only per system rules) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Account Type
            </label>
            <div className="p-1 bg-slate-900/90 rounded-xl border border-slate-800">
              <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-indigo-600/25 text-indigo-300 border border-indigo-500/50 shadow-sm">
                <UserCircle2 className="w-4 h-4" />
                <span>Personal Account (Student)</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aryan Sharma"
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-10"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-10"
                />
              </div>
            </div>

            {/* Submit CTA Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition h-10 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account &amp; Open Khata</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#111827] px-2.5 text-slate-500 tracking-wider">
                Or sign up with
              </span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2 px-3 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-200 text-xs sm:text-sm font-medium transition h-10 shadow-sm disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <GoogleIcon />
            )}
            <span>Sign up with Google</span>
          </button>

          {/* Footer Navigation */}
          <p className="text-center text-xs text-slate-400 mt-2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Dev Simulated Google Sign-In Modal when GOOGLE_CLIENT_ID is not configured in .env */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <GoogleIcon />
                <h3 className="text-sm font-bold text-white">Google Sign-In</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Enter your Google account email to sign in instantly with simulated Google OAuth.
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Google Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={devGoogleEmail}
                    onChange={(e) => setDevGoogleEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none h-10"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDevGoogleLogin(devGoogleEmail)}
                disabled={isDevGoogleLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm transition h-10 shadow-md shadow-indigo-600/30"
              >
                {isDevGoogleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sign In as Student</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
