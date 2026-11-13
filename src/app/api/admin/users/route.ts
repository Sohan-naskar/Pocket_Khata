import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// POST: Create a new System Admin account (Manual Email + Password only)
export async function POST(req: Request) {
  try {
    const session = await auth().catch(() => null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required for admin accounts" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      if (existingUser.role !== "ADMIN") {
        const passwordHash = await bcrypt.hash(password, 10);
        const updated = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: "ADMIN",
            name: name?.trim() || existingUser.name,
            passwordHash,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        });
        return NextResponse.json(
          {
            message: `Account (${cleanEmail}) has been granted System Admin access.`,
            user: updated,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: "This email address is already an active System Admin." },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        name: name?.trim() || cleanEmail.split("@")[0],
        email: cleanEmail,
        passwordHash,
        role: "ADMIN",
        walletProfile: {
          create: {
            onlineBalance: 0,
            cashBalance: 0,
            currency: "INR",
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "New System Admin created successfully.",
        user: newAdmin,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin user creation error:", error);
    return NextResponse.json(
      { error: "Internal server error while creating admin user" },
      { status: 500 }
    );
  }
}

// PATCH: Promote/Demote user role OR Reset user password (Admin session required)
export async function PATCH(req: Request) {
  try {
    const session = await auth().catch(() => null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }
    const body = await req.json();
    const { userId, role, newPassword, action } = body;

    // Handle Password Reset Action
    if (action === "RESET_PASSWORD" || (userId && newPassword && !role)) {
      if (!newPassword || String(newPassword).trim().length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long" },
          { status: 400 }
        );
      }
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!targetUser) {
        return NextResponse.json({ error: "Target user not found" }, { status: 404 });
      }
      const passwordHash = await bcrypt.hash(String(newPassword).trim(), 10);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
      await prisma.passwordResetToken.deleteMany({
        where: { email: targetUser.email },
      });
      return NextResponse.json({
        message: `Password for ${targetUser.name || targetUser.email} has been successfully reset.`,
        success: true,
      });
    }

    if (!userId || !role || (role !== "USER" && role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Valid userId and role ('USER' or 'ADMIN') are required" },
        { status: 400 }
      );
    }

    // Self-demotion guard (if authenticated session exists)
    if (session?.user?.id && userId === session.user.id && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Action prohibited: You cannot demote your own admin account." },
        { status: 400 }
      );
    }

    // Last admin protection guard
    if (role === "USER") {
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (targetUser?.role === "ADMIN") {
        const totalAdmins = await prisma.user.count({
          where: { role: "ADMIN" },
        });
        if (totalAdmins <= 1) {
          return NextResponse.json(
            { error: "Action prohibited: At least one System Admin must exist." },
            { status: 400 }
          );
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: `User role successfully updated to ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Role update error:", error);
    return NextResponse.json(
      { error: "Internal server error while updating user role" },
      { status: 500 }
    );
  }
}

// DELETE: Permanently delete a user account and all cascading data (Admin session required)
export async function DELETE(req: Request) {
  try {
    const session = await auth().catch(() => null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Valid userId is required" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Guard: Prevent deleting own session account if logged in
    if (session?.user?.id && userId === session.user.id) {
      return NextResponse.json(
        { error: "Action prohibited: You cannot delete your own active admin account." },
        { status: 400 }
      );
    }

    // Guard: Prevent deleting the last remaining admin
    if (targetUser.role === "ADMIN") {
      const totalAdmins = await prisma.user.count({
        where: { role: "ADMIN" },
      });
      if (totalAdmins <= 1) {
        return NextResponse.json(
          { error: "Action prohibited: At least one System Admin must exist." },
          { status: 400 }
        );
      }
    }

    // Clean atomic cascading delete
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { userId } }),
      prisma.loan.deleteMany({ where: { userId } }),
      prisma.walletProfile.deleteMany({ where: { userId } }),
      prisma.session.deleteMany({ where: { userId } }),
      prisma.account.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return NextResponse.json({
      message: `User account (${targetUser.email}) and all associated records permanently removed.`,
      deletedUserId: userId,
    });
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error while deleting user account" },
      { status: 500 }
    );
  }
}
