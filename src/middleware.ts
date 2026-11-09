import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (NextAuth authentication routes)
     * 2. /_next/* (Next.js internal static assets)
     * 3. /icon.svg, /favicon.ico (Favicon and static image files)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon.svg).*)",
  ],
};
