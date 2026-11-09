import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  let wallet = await prisma.walletProfile.findUnique({
    where: { userId },
  });

  if (!wallet) {
    wallet = await prisma.walletProfile.create({
      data: {
        userId,
        onlineBalance: 0,
        cashBalance: 0,
        currency: "INR",
      },
    });
  }

  const totalBalance = wallet.onlineBalance + wallet.cashBalance;

  return NextResponse.json({
    onlineBalance: wallet.onlineBalance,
    cashBalance: wallet.cashBalance,
    totalBalance,
    currency: wallet.currency,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { onlineBalance, cashBalance } = body;

    const updated = await prisma.walletProfile.upsert({
      where: { userId },
      create: {
        userId,
        onlineBalance: Math.max(0, Number(onlineBalance) || 0),
        cashBalance: Math.max(0, Number(cashBalance) || 0),
        currency: "INR",
      },
      update: {
        onlineBalance: Math.max(0, Number(onlineBalance) || 0),
        cashBalance: Math.max(0, Number(cashBalance) || 0),
      },
    });

    return NextResponse.json({
      onlineBalance: updated.onlineBalance,
      cashBalance: updated.cashBalance,
      totalBalance: updated.onlineBalance + updated.cashBalance,
      message: "Wallet balances updated successfully",
    });
  } catch (error) {
    console.error("Wallet update error:", error);
    return NextResponse.json({ error: "Failed to update wallet balances" }, { status: 500 });
  }
}
