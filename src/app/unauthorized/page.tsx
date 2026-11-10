"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  ShieldAlert,
  ArrowLeft,
  Wallet,
  LogOut,
  User,
  Shield,
} from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session?.user as any)?.role || "USER";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#090D16] relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.12),rgba(255,255,255,0))]" />

      <div className="w-full max-w-md relative z-10 text-center space-y-6">
        {/* Branding header */}
        <div className="mb-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition shadow-lg"
          >
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow shadow-indigo-600/30">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Pocket<span className="text-indigo-400">Khata</span>
            </span>
          </Link>
        </div>

        {/* 403 Card Container */}
        <div className="bg-[#111827]/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-5">
          {/* Shield Icon Container with Glow */}
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-xl shadow-rose-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>

          {/* Heading & Badge */}
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              403 &bull; Unauthorized Access
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              403 - Unauthorized Access
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
              You do not have administrative privileges to view this portal.
            </p>
          </div>

          {/* Account Details Box */}
          {session?.user && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Signed In As:
                </span>
                <span className="font-mono text-white font-medium truncate max-w-[200px]">
                  {session.user.email}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  Account Role:
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {userRole} (Personal Account)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800/80">
                <span>Admin Status:</span>
                <span className="text-rose-400 font-semibold">Not Authorized</span>
              </div>
            </div>
          )}

          {/* Informational Guidance */}
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            This section is strictly restricted to platform administrators. If you believe this is a mistake, please contact an existing System Administrator to request elevated access.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition h-11 shadow-md shadow-indigo-600/30 active:scale-[0.99]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to My Dashboard
            </button>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800/90 text-slate-400 hover:text-slate-200 text-xs font-medium transition h-9"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

