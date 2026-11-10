import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";

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
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "hostelkhata-jwt-secret-key-32-chars",
  trustHost: true,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return true;
        try {
          const email = user.email.toLowerCase().trim();
          let dbUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email,
                name: user.name || email.split("@")[0],
                image: user.image || null,
                role: "USER",
              },
            });

            // Automatically create initial wallet profile for new Google user
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
          }

          if (dbUser) {
            user.id = dbUser.id;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (user as any).role = dbUser.role;
          }
        } catch (err) {
          console.error("Warning during Google signIn callback:", err);
          // Never block valid Google logins due to DB sync warning
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
      if (account?.provider === "google" && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email.toLowerCase().trim() },
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
