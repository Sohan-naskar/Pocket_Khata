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

// On Vercel, delete hardcoded NEXTAUTH_URL so dynamic host detection works
if (process.env.VERCEL) {
  delete process.env.NEXTAUTH_URL;
}

export function checkIsAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  if (clean === "admin@pocketkhata.app" || clean === "admin@example.com") return true;
  if (process.env.ADMIN_INIT_EMAIL && process.env.ADMIN_INIT_EMAIL.toLowerCase().trim() === clean) return true;
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase().trim() === clean) return true;
  if (process.env.ADMIN_EMAILS) {
    const list = process.env.ADMIN_EMAILS.toLowerCase().split(",").map((s) => s.trim());
    if (list.includes(clean)) return true;
  }
  return false;
}

export const authConfig: NextAuthConfig = {
  basePath: "/api/auth",
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userRole = (auth?.user as any)?.role;
      const { pathname } = nextUrl;

      // 1. NextAuth endpoints, static assets, favicon, icon
      if (
        pathname.startsWith("/api/auth") ||
        pathname === "/unauthorized" ||
        pathname === "/icon.svg" ||
        pathname === "/favicon.ico"
      ) {
        return true;
      }

      // 2. Dedicated Admin Login Route (/admin/login)
      if (pathname === "/admin/login") {
        if (isLoggedIn && userRole === "ADMIN") {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      // 3. Admin Protected Routes (/admin & /admin/*)
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
          const callbackUrl = encodeURIComponent(pathname);
          return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
        }
        if (userRole !== "ADMIN") {
          return Response.redirect(new URL("/login?error=AdminUnauthorized", nextUrl));
        }
        return true;
      }

      // 4. Admin API Protection (/api/admin/*)
      if (pathname.startsWith("/api/admin")) {
        if (!isLoggedIn || userRole !== "ADMIN") {
          return Response.json({ error: "Forbidden: Admin access only" }, { status: 403 });
        }
        return true;
      }

      // 5. Student / User Auth Routes (/login, /signup, /forgot-password, /reset-password)
      if (
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password"
      ) {
        if (nextUrl.searchParams.has("error")) {
          return true;
        }
        if (isLoggedIn) {
          if (userRole === "ADMIN") {
            return Response.redirect(new URL("/admin", nextUrl));
          }
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // 6. Student Protected Routes (/dashboard, /transactions, /udhaar, /analytics, /wallet-settings, etc.)
      const isStudentRoute =
        pathname === "/" ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/transactions") ||
        pathname.startsWith("/udhaar") ||
        pathname.startsWith("/analytics") ||
        pathname.startsWith("/wallet-settings") ||
        pathname.startsWith("/day-ledger") ||
        pathname.startsWith("/udhaar-tracker") ||
        pathname.startsWith("/monthly-analytics");

      if (isStudentRoute) {
        if (!isLoggedIn) {
          if (pathname === "/") {
            return Response.redirect(new URL("/login", nextUrl));
          }
          const callbackUrl = encodeURIComponent(pathname);
          return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
        }

        // If an Admin account visits student routes, redirect them to /admin
        if (userRole === "ADMIN") {
          return Response.redirect(new URL("/admin", nextUrl));
        }

        if (pathname === "/") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }

        return true;
      }

      // All other API routes require authentication
      if (pathname.startsWith("/api/")) {
        if (!isLoggedIn) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        return true;
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
