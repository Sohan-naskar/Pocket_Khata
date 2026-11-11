import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = body?.email ? String(body.email).toLowerCase().trim() : "";
    if (!identifier) {
      return NextResponse.json({ exists: false });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
          ...(identifier === "admin" || identifier === "admin@example.com" ? [{ email: "admin@pocketkhata.app" }] : [])
        ],
      },
      select: { id: true, role: true, email: true },
    });

    return NextResponse.json({ exists: !!user, role: user?.role || null, email: user?.email || null });
  } catch {
    return NextResponse.json({ exists: false });
  }
}

