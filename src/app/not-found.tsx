import Link from "next/link";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
          <Compass className="w-12 h-12" />
        </div>
        <span className="absolute -bottom-2 -right-2 px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-full border-2 border-[#090D16]">
          404
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-slate-400 max-w-md mx-auto text-sm sm:text-base mb-8 leading-relaxed">
        The page you are looking for doesn&apos;t exist or has moved. Your wallet balances and daily ledger records are safe and secure.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
        <Link
          href="/dashboard"
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-lg shadow-indigo-600/30 transition min-h-[44px]"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium text-slate-300 border border-slate-700 transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Home Page
        </Link>
      </div>
    </div>
  );
}
