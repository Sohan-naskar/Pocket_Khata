import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// POST: Create a new System Admin account
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callerRole = (session.user as any).role;
    if (callerRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        name: name.trim(),
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
        message: "New System Admin created successfully",
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

// PATCH: Promote or Demote an existing user's role
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callerRole = (session.user as any).role;
    if (callerRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role || (role !== "USER" && role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Valid userId and role ('USER' or 'ADMIN') are required" },
        { status: 400 }
      );
    }

    // Self-demotion guard
    if (userId === session.user.id && role !== "ADMIN") {
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

