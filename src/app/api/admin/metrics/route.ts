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

  // 1. Total registered users
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

  // 3. Platform aggregates
  const totalTransactions = await prisma.transaction.count();
  const totalLoans = await prisma.loan.count();

  // 4. User list with details and counts
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      walletProfile: {
        select: {
          onlineBalance: true,
          cashBalance: true,
        },
      },
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
      totalTransactions,
      totalLoans,
    },
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      onlineBalance: u.walletProfile?.onlineBalance || 0,
      cashBalance: u.walletProfile?.cashBalance || 0,
      transactionsCount: u._count.transactions,
      loansCount: u._count.loans,
    })),
  });
}

