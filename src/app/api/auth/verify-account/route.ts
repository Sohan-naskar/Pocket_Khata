import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email ? String(body.email).toLowerCase().trim() : "";
    if (!email) {
      return NextResponse.json({ exists: false });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });

    return NextResponse.json({ exists: !!user, role: user?.role || null });
  } catch {
    return NextResponse.json({ exists: false });
  }
}

