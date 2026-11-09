import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/udhaar/:path*",
    "/analytics/:path*",
    "/wallet-settings/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
