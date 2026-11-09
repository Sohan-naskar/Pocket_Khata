import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { parseDDMMYYYY } from "@/lib/date-utils";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
  const wallet = searchParams.get("wallet");
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    userId,
  };

  if (wallet && (wallet === "ONLINE" || wallet === "CASH")) {
    where.wallet = wallet;
  }

  if (type) {
    where.type = type;
  }

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { description: { contains: search } },
      { category: { contains: search } },
    ];
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { type, wallet, amount, category, description, dateStr } = body;

    if (!type || !wallet || !amount || !category) {
      return NextResponse.json(
        { error: "Type, wallet, amount, and category are required" },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (wallet !== "ONLINE" && wallet !== "CASH") {
      return NextResponse.json(
        { error: "Wallet must be either ONLINE or CASH" },
        { status: 400 }
      );
    }

    const txDate = dateStr ? parseDDMMYYYY(dateStr) : new Date();

    // Ensure wallet profile exists
    await prisma.walletProfile.upsert({
      where: { userId },
      create: { userId, onlineBalance: 0, cashBalance: 0 },
      update: {},
    });

    const isIncome = type === "INCOME";

    // Perform atomic transaction: create log + update balance
    const [newTx, updatedWallet] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId,
          type: isIncome ? "INCOME" : "EXPENSE",
          wallet,
          amount: numAmount,
          category,
          description: description?.trim() || null,
          date: txDate,
        },
      }),
      prisma.walletProfile.update({
        where: { userId },
        data: isIncome
          ? wallet === "ONLINE"
            ? { onlineBalance: { increment: numAmount } }
            : { cashBalance: { increment: numAmount } }
          : wallet === "ONLINE"
          ? { onlineBalance: { decrement: numAmount } }
          : { cashBalance: { decrement: numAmount } },
      }),
    ]);

    return NextResponse.json(
      {
        transaction: newTx,
        wallet: {
          onlineBalance: updatedWallet.onlineBalance,
          cashBalance: updatedWallet.cashBalance,
          totalBalance: updatedWallet.onlineBalance + updatedWallet.cashBalance,
        },
        message: `${isIncome ? "Income" : "Expense"} of ₹${numAmount} recorded in ${wallet} wallet`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { error: "Failed to record transaction" },
      { status: 500 }
    );
  }
}
