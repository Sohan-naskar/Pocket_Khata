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
  CreditCard,
  Banknote,
  Shield,
  UserCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function SignupPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [startingOnline, setStartingOnline] = useState("3000");
  const [startingCash, setStartingCash] = useState("800");
  const [isLoading, setIsLoading] = useState(false);

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
          startingOnline: parseFloat(startingOnline) || 0,
          startingCash: parseFloat(startingCash) || 0,
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
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toastError("Error", "Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#090D16]">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(255,255,255,0))]" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition mb-3 shadow-xl"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Pocket<span className="text-indigo-400">Khata</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Join PocketKhata
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Never lose track of your UPI balance, cash, or friend loans again.
          </p>
        </div>

        <div className="bg-[#111827]/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("USER")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition min-h-[44px] ${
                    role === "USER"
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <UserCircle2 className="w-4 h-4 text-indigo-400" />
                  Personal Account
                </button>
                <button
                  type="button"
                  onClick={() => setRole("ADMIN")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition min-h-[44px] ${
                    role === "ADMIN"
                      ? "bg-purple-600/20 border-purple-500 text-purple-300 ring-1 ring-purple-500"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  System Admin
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aryan Sharma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 outline-none transition min-h-[44px]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 outline-none transition min-h-[44px]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Password (min 6 chars)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 outline-none transition min-h-[44px]"
                />
              </div>
            </div>

            {/* Initial Starting Balance Split */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <p className="text-xs font-semibold text-slate-300">
                Initial Wallet Split (Can be adjusted anytime)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="startingOnline"
                    className="flex items-center gap-1.5 text-xs text-blue-400 mb-1"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Online (UPI / Bank)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">
                      ₹
                    </span>
                    <input
                      id="startingOnline"
                      type="number"
                      min="0"
                      step="any"
                      value={startingOnline}
                      onChange={(e) => setStartingOnline(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-slate-950 border border-blue-900/60 focus:border-blue-500 text-sm font-mono text-white outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="startingCash"
                    className="flex items-center gap-1.5 text-xs text-emerald-400 mb-1"
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    Cash (Physical Pocket)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">
                      ₹
                    </span>
                    <input
                      id="startingCash"
                      type="number"
                      min="0"
                      step="any"
                      value={startingCash}
                      onChange={(e) => setStartingCash(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-slate-950 border border-emerald-900/60 focus:border-emerald-500 text-sm font-mono text-white outline-none min-h-[44px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition min-h-[44px] active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account & Open Khata
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Already have a PocketKhata account?{" "}
            <Link
              href="/login"
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
