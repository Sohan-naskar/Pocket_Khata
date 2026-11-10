import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify Role is ADMIN
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

  // 1. Total registered users (Total student & staff accounts created)
  const totalUsers = await prisma.user.count();

  // 2. Active users this month (users with at least one transaction created or dated this month)
  const activeUserRecords = await prisma.transaction.groupBy({
    by: ["userId"],
    where: {
      date: {
        gte: startOfMonth,
      },
    },
  });
  const activeUsersThisMonth = activeUserRecords.length;

  // 3. New signups this month (Accounts created in the current month)
  const newSignupsThisMonth = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  // 4. Total platform admins (Total accounts holding the ADMIN role)
  const totalAdmins = await prisma.user.count({
    where: {
      role: "ADMIN",
    },
  });

  // 5. User list (CRITICAL PRIVACY: NO WALLET BALANCES, AMOUNTS, OR FINANCIAL DATA)
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          transactions: true,
          loans: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    metrics: {
      totalUsers,
      activeUsersThisMonth,
      newSignupsThisMonth,
      totalAdmins,
    },
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      transactionsCount: u._count.transactions,
      loansCount: u._count.loans,
    })),
  });
}
