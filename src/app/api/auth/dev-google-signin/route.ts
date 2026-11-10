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

    const defaultDevPassword = "adminPassword123";
    const passwordHash = await bcrypt.hash(defaultDevPassword, 10);

    // If user does not exist:
    if (!user) {
      if (!isSignup && !isAdmin) {
        return NextResponse.json(
          {
            error: "UnauthorizedAccount",
            message:
              "Unauthorized Account: This email is not registered. Please create an account or contact the administrator.",
          },
          { status: 404 }
        );
      }

      // Create new user (from signup flow or recognized admin)
      user = await prisma.user.create({
        data: {
          name: cleanEmail.split("@")[0],
          email: cleanEmail,
          passwordHash,
          role: isAdmin ? "ADMIN" : "USER",
          walletProfile: {
            create: {
              onlineBalance: 0,
              cashBalance: 0,
              currency: "INR",
            },
          },
        },
      });
    } else {
      // Ensure user has a valid password hash for credentials fallback
      if (!user.passwordHash || (isAdmin && user.role !== "ADMIN")) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            passwordHash: user.passwordHash || passwordHash,
            role: isAdmin ? "ADMIN" : user.role,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      email: user.email,
      role: user.role,
      tempPassword: defaultDevPassword,
    });
  } catch (error) {
    console.error("Dev Google signin error:", error);
    return NextResponse.json(
      { error: "Internal server error during dev sign-in" },
      { status: 500 }
    );
  }
}

