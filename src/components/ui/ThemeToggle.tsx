"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-white/10 dark:border-white/10 border-slate-250 bg-white/5 ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative p-2 rounded-xl text-slate-300 dark:text-slate-300 hover:text-white dark:hover:text-cyan-300 bg-white/[0.06] dark:bg-white/[0.06] border border-white/[0.1] dark:border-white/[0.1] backdrop-blur-md transition-all duration-200 active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center shadow-sm hover:border-indigo-400/40 dark:hover:border-cyan-400/40 ${className}`}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-400 animate-in spin-in-180 duration-300" />
      )}
    </button>
  );
}
