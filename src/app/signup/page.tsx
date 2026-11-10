"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Normal students authenticate exclusively via Google OAuth on /login
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F9FAFB] flex flex-col justify-center items-center p-4">
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        <span>Redirecting to Student Login...</span>
      </div>
    </div>
  );
}
