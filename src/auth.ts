import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";

class UnauthorizedAccountError extends CredentialsSignin {
  code = "UnauthorizedAccount";
}

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
  if (clean === "sohannaskar2304@gmail.com") return true;
  if (process.env.ADMIN_INIT_EMAIL && process.env.ADMIN_INIT_EMAIL.toLowerCase().trim() === clean) return true;
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase().trim() === clean) return true;
  if (process.env.ADMIN_EMAILS) {
    const list = process.env.ADMIN_EMAILS.toLowerCase().split(",").map((s) => s.trim());
    if (list.includes(clean)) return true;
  }
  return false;
}

const isGoogleConfigured =
  !!process.env.GOOGLE_CLIENT_ID &&
  !!process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID.trim().length > 0 &&
  process.env.GOOGLE_CLIENT_SECRET.trim().length > 0 &&
  process.env.GOOGLE_CLIENT_ID !== "demo-google-client-id";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...(isGoogleConfigured
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      id: "credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Admin Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Strictly verify that the user exists and has a password
        if (!user || !user.passwordHash) {
          return null;
        }

        // Strictly enforce: ONLY users with role === 'ADMIN' can authenticate via Credentials
        const isAdmin = user.role === "ADMIN" || checkIsAdminEmail(email);
        if (!isAdmin) {
          return null;
        }

        const isValid = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!isValid) return null;

        // Ensure database reflects ADMIN role
        if (user.role !== "ADMIN") {
          await prisma.user
            .update({
              where: { id: user.id },
              data: { role: "ADMIN" },
            })
            .catch(() => {});
        }

        return {
          id: user.id,
          name: user.name || "System Admin",
          email: user.email,
          role: "ADMIN",
          image: user.image,
        };
      },
    }),
    Credentials({
      id: "student-dev-google",
      name: "Simulated Google Sign-In",
      credentials: {
        email: { label: "Google Email", type: "email" },
        devKey: { label: "Dev Key", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        if (credentials.devKey !== FALLBACK_AUTH_SECRET) return null;

        const email = String(credentials.email).toLowerCase().trim();
        // Strictly block admins from using Google login
        if (checkIsAdminEmail(email)) {
          return null;
        }

        let user = await prisma.user.findUnique({ where: { email } });
        if (user?.role === "ADMIN") {
          return null;
        }

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: email.split("@")[0],
              role: "USER",
              walletProfile: {
                create: {
                  onlineBalance: 0,
                  cashBalance: 0,
                  currency: "INR",
                },
              },
            },
          });
        }

        return {
          id: user.id,
          name: user.name || email.split("@")[0],
          email: user.email,
          role: "USER",
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
        if (!user.email) return "/login?error=UnauthorizedAccount";
        try {
          const email = user.email.toLowerCase().trim();
          const dbUser = await prisma.user.findUnique({
            where: { email },
          });

          // Strictly enforce: Admin accounts CANNOT authenticate via Google OAuth
          if (dbUser?.role === "ADMIN" || checkIsAdminEmail(email)) {
            return "/login?error=AdminMustUsePassword";
          }

          // Students/Normal Users: Automatically provision account & wallet on first Google sign-in
          let targetUser = dbUser;
          if (!targetUser) {
            targetUser = await prisma.user.create({
              data: {
                email,
                name: user.name || email.split("@")[0],
                image: user.image || null,
                role: "USER",
                walletProfile: {
                  create: {
                    onlineBalance: 0,
                    cashBalance: 0,
                    currency: "INR",
                  },
                },
              },
            });
          }

          user.id = targetUser.id;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (user as any).role = "USER";
          return true;
        } catch (err) {
          console.error("Warning during Google signIn callback:", err);
          return "/login?error=GoogleAuthFailed";
        }
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
      if (email && !token.role) {
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
