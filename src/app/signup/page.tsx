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
  AtSign,
  Loader2,
  ArrowRight,
  UserCircle2,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function SignupPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name || !email || !password || !confirmPassword) {
      const msg = "Please complete all required fields.";
      setFormError(msg);
      toastError("Missing Fields", msg);
      return;
    }

    if (password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setFormError(msg);
      toastError("Weak Password", msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = "Passwords do not match.";
      setFormError(msg);
      toastError("Password Mismatch", msg);
      return;
    }

    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "") || cleanEmail.split("@")[0];

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: cleanUsername,
          email: cleanEmail,
          password,
          role: "USER",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || "Unable to create account.";
        setFormError(msg);
        toastError("Registration Failed", msg);
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
      const msg = "Could not complete registration. Please try again.";
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
            <Wallet className="w-4.5 h-4.5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Pocket<span className="text-indigo-400">Khata</span>
          </h1>
          <p className="text-[11px] text-slate-400 max-w-[260px] mx-auto leading-tight">
            Create your student personal account to track cash, UPI, and Udhaar loans.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-[#111827]/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-3">
          {/* Account Type (Strictly Personal Account Only) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Account Type
            </label>
            <div className="p-0.5 bg-slate-900/90 rounded-lg border border-slate-800">
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md text-[11px] font-semibold bg-indigo-600/25 text-indigo-300 border border-indigo-500/50 shadow-sm">
                <UserCircle2 className="w-3.5 h-3.5" />
                <span>Personal Account (Student)</span>
              </div>
            </div>
          </div>

          {/* Inline Error Alert */}
          {formError && (
            <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-2 animate-in fade-in duration-200">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{formError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-[11px] font-medium text-slate-300 mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (formError) setFormError("");
                  }}
                  placeholder="Name"
                  disabled={isLoading}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-9"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-[11px] font-medium text-slate-300 mb-1"
              >
                Username
              </label>
              <div className="relative">
                <AtSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (formError) setFormError("");
                  }}
                  placeholder="User Name"
                  disabled={isLoading}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-9"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-medium text-slate-300 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formError) setFormError("");
                  }}
                  placeholder="user@example.com"
                  disabled={isLoading}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-9"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-medium text-slate-300 mb-1"
              >
                Password (min 6 chars)
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-[11px] font-medium text-slate-300 mb-1"
              >
                Confirm Password
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

            {/* Submit CTA Button */}
            <div className="pt-0.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition h-9 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account &amp; Open Khata</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Navigation */}
          <p className="text-center text-[11px] text-slate-400 pt-0.5">
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
    </div>
  );
}
