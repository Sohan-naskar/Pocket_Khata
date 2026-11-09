"use client";

import React from "react";
import Link from "next/link";
import {
  Wallet,
  CreditCard,
  Banknote,
  HandCoins,
  ReceiptText,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  Zap,
} from "lucide-react";
import { AppFooter } from "@/components/layout/AppFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-[#F9FAFB] flex flex-col overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.2),rgba(255,255,255,0))]" />

      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full bg-[#090D16]/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Hostel<span className="text-indigo-400">Khata</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition px-3 py-2 rounded-xl min-h-[44px] flex items-center"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition min-h-[44px]"
            >
              <span>Open Khata</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10">
        <section className="px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built exclusively for Students, Bachelors & Hostellers</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
            Stop losing track of your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
              UPI vs Cash
            </span>{" "}
            and Roommate Udhaar.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Hostel life has two wallets: <strong>Online (UPI/Bank)</strong> and <strong>Cash (Pocket Money)</strong>. HostelKhata tracks both simultaneously, logs daily expenses in strict <code>DD-MM-YYYY</code> format, and reminds friends to return borrowed money with one-tap phone and email links.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition min-h-[44px]"
            >
              <span>Get Started — It&apos;s Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition min-h-[44px]"
            >
              <span>View Interactive Demo</span>
            </Link>
          </div>

          {/* Micro trust indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Dual-Wallet Auto-Balance
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              1-Tap Contact Reminders
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Strict DD-MM-YYYY Dates
            </span>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Crafted specifically for the chaotic hostel budget
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Everything hostellers and flatmates actually need, without unnecessary accounting jargon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 hover:border-blue-500/40 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Dual-Wallet Auto-Calculation
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Set and maintain separate <strong>Online (UPI)</strong> and <strong>Cash (Pocket)</strong> balances. Every samosa in cash or mess fee in UPI automatically updates the right wallet and your live Total Balance.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 hover:border-amber-500/40 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <HandCoins className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Udhaar Tracker & Overdue Alerts
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Log loans to friends with borrower name, phone, email, and expected return date. When due, an amber alert banner pops up with <strong>1-tap call & email links</strong>. When collected, money returns to your balance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 hover:border-emerald-500/40 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ReceiptText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Strict DD-MM-YYYY Day Ledger
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Zero confusion over ambiguous US date formats. Every daily expenditure is recorded and displayed in clean <code>DD-MM-YYYY</code> format with monthly Spent vs. Saved comparison analytics.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border border-indigo-500/40 shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Ready to take control of your hostel finances?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-6">
              Create your account in under 30 seconds or try our instant demo with preloaded student transactions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/40 transition min-h-[44px] flex items-center justify-center gap-2"
              >
                <span>Open Your Khata Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition min-h-[44px] flex items-center justify-center"
              >
                <span>Demo Student Sign In</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <AppFooter />
    </div>
  );
}

