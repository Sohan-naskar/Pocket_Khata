import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// POST: Create or provision a System Admin account (Open direct management on localhost)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, isGoogleAccount } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // Standard credential validation if not Google account
    if (!isGoogleAccount) {
      if (!name || !password) {
        return NextResponse.json(
          { error: "Name, email, and password are required for standard accounts" },
          { status: 400 }
        );
      }
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      // If it's a Google account or the admin is promoting an existing account
      if (isGoogleAccount || existingUser.role !== "ADMIN") {
        const updated = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: "ADMIN",
            name: name?.trim() || existingUser.name,
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

    let passwordHash: string | null = null;
    if (password && password.length >= 6) {
      passwordHash = await bcrypt.hash(password, 10);
    }

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
        message: isGoogleAccount
          ? `Google account (${cleanEmail}) provisioned as System Admin.`
          : "New System Admin created successfully.",
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

// PATCH: Promote or Demote an existing user's role (Open direct management on localhost)
export async function PATCH(req: Request) {
  try {
    const session = await auth().catch(() => null);
    const body = await req.json();
    const { userId, role } = body;

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

// DELETE: Permanently delete a user account and all cascading data
export async function DELETE(req: Request) {
  try {
    const session = await auth().catch(() => null);
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
