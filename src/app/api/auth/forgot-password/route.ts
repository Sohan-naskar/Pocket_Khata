import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email or username is required" },
        { status: 400 }
      );
    }

    const cleanInput = email.trim().toLowerCase();

    // Support looking up user by either registered email address or unique username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanInput },
          { username: cleanInput },
        ],
      },
    });

    // If user does not exist, return a generic success message to prevent user enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email or username, a reset link has been created.",
      });
    }

    // Generate cryptographically secure random token (64 hex characters)
    const token = crypto.randomBytes(32).toString("hex");
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Invalidate any previously issued tokens for this user's email
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    // Record the new reset token in the database
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expiresAt,
      },
    });

    const resetUrl = `/reset-password?token=${token}`;

    return NextResponse.json({
      success: true,
      message: "Password reset link generated successfully.",
      resetUrl,
    });
  } catch (error) {
    console.error("[ForgotPassword Error]:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request" },
      { status: 500 }
    );
  }
}

