import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { checkIsAdminEmail } from "@/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, email, password, role = "USER", startingOnline = 0, startingCash = 0 } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanUsername = username
      ? String(username).toLowerCase().trim().replace(/[^a-z0-9_.-]/g, "")
      : cleanEmail.split("@")[0];

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }],
      },
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "This username is already taken. Please choose another." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // Public registration strictly creates personal accounts (USER role)
    const assignedRole = checkIsAdminEmail(cleanEmail) ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: {
        name: name?.trim() || cleanUsername,
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        role: assignedRole,
        walletProfile: {
          create: {
            onlineBalance: Math.max(0, Number(startingOnline) || 0),
            cashBalance: Math.max(0, Number(startingCash) || 0),
            currency: "INR",
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while creating account" },
      { status: 500 }
    );
  }
}
