import type { NextAuthConfig } from "next-auth";

const FALLBACK_AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "pocketkhata-super-secret-jwt-token-key-2026-production-verified-32chars";

if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = FALLBACK_AUTH_SECRET;
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = FALLBACK_AUTH_SECRET;
}

export function checkIsAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  if (clean === "admin@pocketkhata.app") return true;
  if (clean === "sohannaskar2304@gmail.com") return true;
  if (process.env.ADMIN_INIT_EMAIL && process.env.ADMIN_INIT_EMAIL.toLowerCase().trim() === clean) return true;
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase().trim() === clean) return true;
  if (process.env.ADMIN_EMAILS) {
    const list = process.env.ADMIN_EMAILS.toLowerCase().split(",").map((s) => s.trim());
    if (list.includes(clean)) return true;
  }
  return false;
}

export const authConfig: NextAuthConfig = {
  providers: [],
  trustHost: true,
  secret: FALLBACK_AUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // 1. Completely public routes:
      // - /admin & /admin/* (Direct-access open telemetry portal, NO authentication required)
      // - /api/admin/* (Direct telemetry data APIs)
      // - /api/auth/* (NextAuth endpoints)
      // - /unauthorized, /icon.svg
      const isAdminRoute = pathname.startsWith("/admin");
      const isAdminApi = pathname.startsWith("/api/admin");
      const isAuthApi = pathname.startsWith("/api/auth");
      if (isAdminRoute || isAdminApi || isAuthApi || pathname === "/unauthorized") {
        return true;
      }

      // 2. Auth routes (/login, /signup)
      const isAuthRoute = pathname === "/login" || pathname === "/signup";
      if (isAuthRoute) {
        if (nextUrl.searchParams.has("error")) {
          return true;
        }
        if (isLoggedIn) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const role = (auth?.user as any)?.role;
          const email = auth?.user?.email;
          if (role === "ADMIN" || checkIsAdminEmail(email)) {
            return Response.redirect(new URL("/admin", nextUrl));
          }
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // 3. User account protection:
      // All student user routes (/dashboard, /transactions, /udhaar, /analytics, /wallet-settings, etc.)
      // strictly require full authentication.
      if (!isLoggedIn) {
        // Return 401 JSON for unauthenticated user API requests
        if (pathname.startsWith("/api/")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // For root homepage "/", redirect directly to /login
        if (pathname === "/") {
          return Response.redirect(new URL("/login", nextUrl));
        }

        // For all protected user routes, redirect to login with callbackUrl
        const callbackUrl = encodeURIComponent(pathname);
        return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
      }

      // If logged in and visiting root '/', redirect to /dashboard (or /admin for admins)
      if (pathname === "/") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const role = (auth?.user as any)?.role;
        const email = auth?.user?.email;
        if (role === "ADMIN" || checkIsAdminEmail(email)) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role || "USER";
      }
      const email = (token.email || user?.email)?.toLowerCase().trim();
      if (checkIsAdminEmail(email)) {
        token.role = "ADMIN";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = (token.role as string) || "USER";
      }
      return session;
    },
  },
};
