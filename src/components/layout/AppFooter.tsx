"use client";

import React from "react";
import Link from "next/link";
import { Wallet, Heart, Phone, Mail, ShieldCheck } from "lucide-react";

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#070A12] border-t border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 mt-auto pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand identity */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              Hostel<span className="text-indigo-400">Khata</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 text-center md:text-left">
            Built for hostellers, bachelors, and flatmates managing daily UPI & Cash.
          </p>
        </div>

        {/* Quick Functional Links (Zero broken links) */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-white transition">
            Dashboard
          </Link>
          <Link href="/transactions" className="hover:text-white transition">
            Day Ledger
          </Link>
          <Link href="/udhaar" className="hover:text-white transition">
            Udhaar Tracker
          </Link>
          <Link href="/analytics" className="hover:text-white transition">
            Analytics
          </Link>
          <Link href="/wallet-settings" className="hover:text-white transition">
            Wallet Settings
          </Link>
          <a
            href="tel:+918000000000"
            className="flex items-center gap-1 hover:text-indigo-400 transition"
          >
            <Phone className="w-3 h-3" />
            <span>Support</span>
          </a>
          <a
            href="mailto:support@hostelkhata.app"
            className="flex items-center gap-1 hover:text-indigo-400 transition"
          >
            <Mail className="w-3 h-3" />
            <span>Contact</span>
          </a>
        </div>

        {/* Copyright & Live Status */}
        <div className="flex flex-col items-center md:items-end gap-1 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-medium text-[11px]">System Online</span>
          </div>
          <p className="flex items-center gap-1">
            <span>&copy; {currentYear} HostelKhata. Crafted with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
            <span>for campus life.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

