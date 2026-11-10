import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { checkIsAdminEmail } from "@/auth.config";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, isSignup = false } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const isAdmin = checkIsAdminEmail(cleanEmail);

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Enforce: Admin accounts cannot sign in via Google
    if (user?.role === "ADMIN" || isAdmin) {
      return NextResponse.json(
        {
          error: "AdminMustUsePassword",
          message: "Admin accounts cannot use Google sign-in. Please log in at /admin/login.",
        },
        { status: 403 }
      );
    }

    const FALLBACK_AUTH_SECRET =
      process.env.AUTH_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      "pocketkhata-super-secret-jwt-token-key-2026-production-verified-32chars";

    // If user does not exist, auto-create as student USER
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: cleanEmail.split("@")[0],
          email: cleanEmail,
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

    return NextResponse.json({
      success: true,
      email: user.email,
      role: "USER",
      devKey: FALLBACK_AUTH_SECRET,
    });
  } catch (error) {
    console.error("Dev Google signin error:", error);
    return NextResponse.json(
      { error: "Internal server error during dev sign-in" },
      { status: 500 }
    );
  }
}

