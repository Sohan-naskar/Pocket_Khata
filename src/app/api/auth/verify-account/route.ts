import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawInput = body?.email || body?.identifier || "";
    if (!rawInput) {
      return NextResponse.json({ exists: false });
    }

    const cleanIdentifier = String(rawInput).toLowerCase().trim();
    const rawTrimmed = String(rawInput).trim();
    const normalizedUsername = cleanIdentifier.replace(/[^a-z0-9_.-]/g, "");

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: cleanIdentifier, mode: "insensitive" } },
          { username: { equals: cleanIdentifier, mode: "insensitive" } },
          { username: { equals: normalizedUsername, mode: "insensitive" } },
          { name: { equals: cleanIdentifier, mode: "insensitive" } },
          { name: { equals: rawTrimmed, mode: "insensitive" } },
          ...(cleanIdentifier === "admin" || cleanIdentifier === "admin@example.com"
            ? [{ email: "admin@pocketkhata.app" }]
            : []),
        ],
      },
      select: { id: true, role: true, email: true, username: true, name: true },
    });

    return NextResponse.json({
      exists: !!user,
      role: user?.role || null,
      email: user?.email || null,
      username: user?.username || null,
      name: user?.name || null,
    });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
