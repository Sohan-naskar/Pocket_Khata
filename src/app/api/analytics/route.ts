import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const monthYearParam = searchParams.get("monthYear"); // Format: MM-YYYY, e.g. 11-2026

  let targetMonth: number;
  let targetYear: number;

  if (monthYearParam && monthYearParam.includes("-")) {
    const [m, y] = monthYearParam.split("-").map(Number);
    targetMonth = m - 1; // JS 0-indexed month
    targetYear = y;
  } else {
    const now = new Date();
    targetMonth = now.getMonth();
    targetYear = now.getFullYear();
  }

  const startDate = new Date(targetYear, targetMonth, 1, 0, 0, 0);
  const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  // Fetch transactions for this month
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  let totalIncome = 0;
  let totalSpent = 0;
  let onlineSpent = 0;
  let cashSpent = 0;
  const categorySpendingMap: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.type === "INCOME" || tx.type === "LOAN_REPAYMENT") {
      totalIncome += tx.amount;
    } else if (tx.type === "EXPENSE" || tx.type === "LOAN_DISBURSEMENT") {
      totalSpent += tx.amount;
      if (tx.wallet === "ONLINE") {
        onlineSpent += tx.amount;
      } else {
        cashSpent += tx.amount;
      }

      categorySpendingMap[tx.category] = (categorySpendingMap[tx.category] || 0) + tx.amount;
    }
  }

  const totalSaved = Math.max(0, totalIncome - totalSpent);
  const savingsRate = totalIncome > 0 ? Math.round((totalSaved / totalIncome) * 100) : 0;

  // Format category list sorted by highest spending
  const categoryBreakdown = Object.entries(categorySpendingMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const formattedMonthStr = `${String(targetMonth + 1).padStart(2, "0")}-${targetYear}`;

  return NextResponse.json({
    monthYear: formattedMonthStr,
    totalIncome,
    totalSpent,
    totalSaved,
    savingsRate,
    walletBreakdown: {
      onlineSpent,
      cashSpent,
    },
    categoryBreakdown,
    transactionCount: transactions.length,
  });
}
