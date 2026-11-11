import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || typeof token !== "string" || !token.trim()) {
      return NextResponse.json(
        { error: "A valid reset token is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Look up the reset token in the database
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token: token.trim() },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid or already used password reset link. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify token expiration
    if (new Date(resetRecord.expiresAt) < new Date()) {
      // Invalidate expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetRecord.id },
      });

      return NextResponse.json(
        { error: "This password reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Look up associated user
    const user = await prisma.user.findUnique({
      where: { email: resetRecord.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account associated with this reset link was not found." },
        { status: 404 }
      );
    }

    // Hash the new password with bcryptjs
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user's password hash in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Remove all reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { email: resetRecord.email },
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset. You can now log in.",
    });
  } catch (error) {
    console.error("[ResetPassword Error]:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while resetting your password" },
      { status: 500 }
    );
  }
}

