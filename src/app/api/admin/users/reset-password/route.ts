import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { checkIsAdminEmail } from "@/auth.config";

export async function POST(req: Request) {
  try {
    const session = await auth().catch(() => null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAdmin =
      (session?.user as any)?.role === "ADMIN" || checkIsAdminEmail(session?.user?.email);

    if (!session?.user?.id || !isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: "Target user ID and new password are required" },
        { status: 400 }
      );
    }

    const cleanPassword = String(newPassword).trim();
    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user account not found" }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(cleanPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Clean up any pending password reset requests for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: targetUser.email },
    });

    return NextResponse.json({
      success: true,
      message: `Password for ${targetUser.name || targetUser.email} has been successfully reset.`,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
      },
    });
  } catch (error) {
    console.error("[Admin Reset Password Error]:", error);
    return NextResponse.json(
      { error: "Internal server error while resetting user password" },
      { status: 500 }
    );
  }
}

