"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, getSession, useSession } from "next-auth/react";
import {
  Wallet,
  Lock,
  Mail,
  Loader2,
  ArrowRight,
  Shield,
  UserCircle2,
  ShieldAlert,
  ArrowLeft,
  X,
  Sparkles,
  CheckCircle2,
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { success, error: toastError } = useToast();

  const [accountType, setAccountType] = useState<"USER" | "ADMIN">("USER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 403 Unauthorized Account State (Matches Image 2 reference)
  const [unauthorizedAccountInfo, setUnauthorizedAccountInfo] = useState<{
    email: string;
    role?: string;
  } | null>(null);

  // Dev Google Sign-In helper modal when GOOGLE_CLIENT_ID is not configured in .env
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [devGoogleEmail, setDevGoogleEmail] = useState("student@pocketkhata.app");
  const [isDevGoogleLoading, setIsDevGoogleLoading] = useState(false);

  React.useEffect(() => {
    const errorParam = searchParams.get("error");
    const attemptEmail = searchParams.get("attemptEmail");

    if (errorParam === "unauthorized" || errorParam === "AdminUnauthorized" || errorParam === "AccessDenied") {
      setUnauthorizedAccountInfo({
        email: attemptEmail || session?.user?.email || "sohannaskar2004@gmail.com",
        role: "USER (Personal Account)",
      });
    } else if (errorParam === "AdminMustUsePassword") {
      setAdminLoginError("Admin accounts cannot use Google sign-in. Please log in with your Admin Password.");
      setAccountType("ADMIN");
    } else if (errorParam === "CredentialsSignin") {
      toastError("Authentication Failed", "Invalid email or password. Please verify your credentials.");
    }
  }, [searchParams, session?.user?.email, toastError]);

  const handleSelectAdmin = () => {
    setAccountType("ADMIN");
    setAdminLoginError("");
  };

  const handleSelectUser = () => {
    setAccountType("USER");
    setAdminLoginError("");
  };

  const handleReturnToLogin = async () => {
    try {
      await signOut({ redirect: false });
    } catch {
      // Ignore errors during logout
    }
    setUnauthorizedAccountInfo(null);
    setAccountType("USER");
    setAdminLoginError("");
    setEmail("");
    setPassword("");
    router.replace("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toastError("Missing Fields", "Please enter both your email and password.");
      return;
    }

    setIsLoading(true);
    setAdminLoginError("");
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
      });

      if (res?.error) {
        toastError("Login Failed", "Invalid email or password. Please verify your credentials.");
        setIsLoading(false);
        return;
      }

      // Verify the user's actual registered role from the newly established session
      const userSession = await getSession();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentRole = (userSession?.user as any)?.role || "USER";

      // If user attempted to log in as System Admin, but their account role is NOT ADMIN:
      if (accountType === "ADMIN" && currentRole !== "ADMIN") {
        await signOut({ redirect: false });
        setUnauthorizedAccountInfo({
          email: cleanEmail,
          role: `${currentRole} (Personal Account)`,
        });
        setIsLoading(false);
        return;
      }

      success(
        "Welcome back!",
        currentRole === "ADMIN" ? "Redirecting to Admin Portal..." : "Redirecting to your dashboard..."
      );
      const destination = currentRole === "ADMIN" ? "/admin" : callbackUrl;
      window.location.href = destination;
    } catch {
      toastError("Error", "Something went wrong during sign-in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // If System Admin is selected, block Google sign-in with clear instruction
    if (accountType === "ADMIN") {
      setAdminLoginError(
        "Admin accounts cannot use Google sign-in. Please enter your Admin Email and Password above."
      );
      return;
    }

    setIsGoogleLoading(true);
    setAdminLoginError("");

    try {
      // Check if real Google OAuth credentials are configured in .env
      const statusRes = await fetch("/api/auth/providers-status").catch(() => null);
      const statusData = statusRes ? await statusRes.json() : null;

      if (!statusData?.googleConfigured) {
        setIsGoogleLoading(false);
        setIsGoogleModalOpen(true);
        return;
      }

      await signIn("google", { callbackUrl });
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
        if (data.error === "AdminMustUsePassword") {
          setIsGoogleModalOpen(false);
          setAccountType("ADMIN");
          setAdminLoginError(data.message || "Admin accounts cannot use Google sign-in. Please log in with your Admin Password.");
          return;
        }
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

      success("Welcome!", "Signing you into your Khata...");
      setIsGoogleModalOpen(false);
      window.location.href = callbackUrl || "/dashboard";
    } catch {
      toastError("Error", "Network error during simulated Google sign-in.");
    } finally {
      setIsDevGoogleLoading(false);
    }
  };

  // 403 Access Denied View for Unauthorized Accounts on the Login Page (Exact Image 2 Reference)
  if (unauthorizedAccountInfo) {
    return (
      <div className="space-y-5 text-center animate-in fade-in duration-200">
        {/* Shield Icon Container with Glow */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-xl shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Heading & Badge */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            403 &bull; Unauthorized Account
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Access Denied
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
            Only registered <strong className="text-purple-400">System Administrators</strong> can log into and access the Admin Platform Telemetry page.
          </p>
        </div>

        {/* Account Details Box */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Signed In As:</span>
            <span className="font-mono text-white font-medium truncate max-w-[200px]">
              {unauthorizedAccountInfo.email}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Account Role:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {unauthorizedAccountInfo.role || "USER (Personal Account)"}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Admin Status:</span>
            <span className="text-rose-400 font-semibold">Not Authorized</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          If you believe this is an error, please sign out and log in with your authorized admin account, or ask an existing System Admin to grant you admin privileges.
        </p>

        {/* Single Action Button: Return to Login Page */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleReturnToLogin}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition h-11 shadow-md shadow-indigo-600/30 active:scale-[0.99]"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Login Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Account Type Selector Tabs (Matching Image 2 Reference) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={handleSelectUser}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                accountType === "USER"
                  ? "bg-indigo-600/25 text-indigo-300 border border-indigo-500/50 shadow-sm"
                  : "text-slate-400 hover:text-white border border-transparent"
              }`}
            >
              <UserCircle2 className="w-4 h-4" />
              <span>Personal Account</span>
            </button>
            <button
              type="button"
              onClick={handleSelectAdmin}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                accountType === "ADMIN"
                  ? "bg-purple-600/25 text-purple-300 border border-purple-500/50 shadow-sm"
                  : "text-slate-400 hover:text-white border border-transparent"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>System Admin</span>
            </button>
          </div>
        </div>

        {/* Error Banner for Unauthorized Admin Attempt or Missing Google Permissions */}
        {adminLoginError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{adminLoginError}</span>
          </div>
        )}

        {/* Credentials Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
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
                placeholder={
                  accountType === "ADMIN"
                    ? "admin@example.com"
                    : "user@example.com"
                }
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition disabled:opacity-60 h-10"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className={`w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl disabled:opacity-60 text-white font-semibold text-xs sm:text-sm shadow-md transition h-10 active:scale-[0.99] ${
                accountType === "ADMIN"
                  ? "bg-purple-600 hover:bg-purple-500 shadow-purple-600/30"
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>
                    {accountType === "ADMIN"
                      ? "Sign In as System Admin"
                      : "Sign In & Open Khata"}
                  </span>
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
              Or sign in with
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
          <span>Sign in with Google</span>
        </button>

        {/* Footer Navigation */}
        <p className="text-center text-xs text-slate-400 mt-2">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
          >
            Sign up
          </Link>
        </p>
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

              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] text-slate-400">Quick Test Accounts:</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDevGoogleEmail("sohannaskar2004@gmail.com")}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700/80 transition"
                  >
                    sohannaskar2004@gmail.com
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevGoogleEmail("student@pocketkhata.app")}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700/80 transition"
                  >
                    student@pocketkhata.app
                  </button>
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
    </>
  );
}

export default function LoginPage() {
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
            Student personal finance, dual-wallet auto ledger &amp; peer Udhaar tracker.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
          <Suspense
            fallback={
              <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                <span>Loading sign-in...</span>
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
