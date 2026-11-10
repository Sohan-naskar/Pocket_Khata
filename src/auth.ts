import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";

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
  if (clean === "admin@pocketkhata.app" || clean.startsWith("admin@")) return true;
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase().trim() === clean) return true;
  if (process.env.ADMIN_EMAILS) {
    const list = process.env.ADMIN_EMAILS.toLowerCase().split(",").map((s) => s.trim());
    if (list.includes(clean)) return true;
  }
  return false;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID || "demo-google-client-id",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo-google-client-secret",
            allowDangerousEmailAccountLinking: true,
          }),
        ]),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user || !user.passwordHash) return null;
        const isValid = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!isValid) return null;

        let role = user.role;
        if (checkIsAdminEmail(email) && role !== "ADMIN") {
          role = "ADMIN";
          await prisma.user
            .update({
              where: { id: user.id },
              data: { role: "ADMIN" },
            })
            .catch(() => {});
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role,
          image: user.image,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: FALLBACK_AUTH_SECRET,
  trustHost: true,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return true;
        try {
          const email = user.email.toLowerCase().trim();
          const isAdmin = checkIsAdminEmail(email);

          let dbUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email,
                name: user.name || email.split("@")[0],
                image: user.image || null,
                role: isAdmin ? "ADMIN" : "USER",
              },
            });

            await prisma.walletProfile
              .create({
                data: {
                  userId: dbUser.id,
                  onlineBalance: 0,
                  cashBalance: 0,
                  currency: "INR",
                },
              })
              .catch((err) => {
                console.warn("Wallet profile creation skipped:", err);
              });
          } else if (isAdmin && dbUser.role !== "ADMIN") {
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: { role: "ADMIN" },
            });
          }

          if (dbUser) {
            user.id = dbUser.id;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (user as any).role = dbUser.role;
          }
        } catch (err) {
          console.error("Warning during Google signIn callback:", err);
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role || "USER";
      }

      const email = (token.email || user?.email)?.toLowerCase().trim();
      if (checkIsAdminEmail(email)) {
        token.role = "ADMIN";
      } else if (account?.provider === "google" && email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } catch (e) {
          console.warn("JWT dbUser lookup error:", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = (token.role as string) || "USER";
      }
      return session;
    },
  },
});
