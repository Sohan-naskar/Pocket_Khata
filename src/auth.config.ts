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

      // Public auth endpoints and static assets
      const isAuthRoute = pathname === "/login" || pathname === "/signup";
      const isAuthApi = pathname.startsWith("/api/auth");
      if (isAuthApi) {
        return true;
      }

      // If user is already logged in, redirect them to dashboard (or /admin for admins)
      if (isAuthRoute) {
        if (isLoggedIn) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const role = (auth?.user as any)?.role;
          if (role === "ADMIN") {
            return Response.redirect(new URL("/admin", nextUrl));
          }
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // If user is NOT logged in: strictly block access to the website
      if (!isLoggedIn) {
        // Return 401 JSON for unauthenticated API requests
        if (pathname.startsWith("/api/")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // For root homepage "/", redirect directly to /login
        if (pathname === "/") {
          return Response.redirect(new URL("/login", nextUrl));
        }

        // For all other routes, redirect to login with callback
        const callbackUrl = encodeURIComponent(pathname);
        return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
      }

      // If logged in and visiting root '/', redirect to /admin if ADMIN or /dashboard
      if (pathname === "/") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const role = (auth?.user as any)?.role;
        if (role === "ADMIN") {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Admin route authentication check
      const isAdminRoute = pathname.startsWith("/admin");
      if (isAdminRoute) {
        if (!isLoggedIn) {
          const callbackUrl = encodeURIComponent(pathname);
          return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
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
