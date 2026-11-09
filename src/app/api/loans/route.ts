import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { parseDDMMYYYY } from "@/lib/date-utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const loans = await prisma.loan.findMany({
    where: { userId },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(loans);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const {
      borrowerName,
      borrowerPhone,
      borrowerEmail,
      amount,
      wallet,
      lentDateStr,
      dueDateStr,
      notes,
    } = body;

    if (!borrowerName || !borrowerPhone || !amount || !wallet || !dueDateStr) {
      return NextResponse.json(
        { error: "Borrower name, phone, amount, wallet, and due date are required." },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number." },
        { status: 400 }
      );
    }

    if (wallet !== "ONLINE" && wallet !== "CASH") {
      return NextResponse.json(
        { error: "Wallet must be either ONLINE or CASH." },
        { status: 400 }
      );
    }

    const lentDate = lentDateStr ? parseDDMMYYYY(lentDateStr) : new Date();
    const dueDate = parseDDMMYYYY(dueDateStr);

    // Ensure wallet exists
    await prisma.walletProfile.upsert({
      where: { userId },
      create: { userId, onlineBalance: 0, cashBalance: 0 },
      update: {},
    });

    // Execute atomic transaction: create loan + transaction log + deduct wallet
    const [loan, updatedWallet] = await prisma.$transaction(async (tx) => {
      const createdLoan = await tx.loan.create({
        data: {
          userId,
          borrowerName: borrowerName.trim(),
          borrowerPhone: borrowerPhone.trim(),
          borrowerEmail: borrowerEmail?.trim() || null,
          amount: numAmount,
          wallet,
          lentDate,
          dueDate,
          status: "PENDING",
          notes: notes?.trim() || null,
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: "LOAN_DISBURSEMENT",
          wallet,
          amount: numAmount,
          category: "Udhaar / Loan Given",
          description: `Udhaar lent to ${borrowerName.trim()} (Due: ${dueDateStr})`,
          date: lentDate,
          loanId: createdLoan.id,
        },
      });

      const updated = await tx.walletProfile.update({
        where: { userId },
        data:
          wallet === "ONLINE"
            ? { onlineBalance: { decrement: numAmount } }
            : { cashBalance: { decrement: numAmount } },
      });

      return [createdLoan, updated];
    });

    return NextResponse.json(
      {
        loan,
        wallet: {
          onlineBalance: updatedWallet.onlineBalance,
          cashBalance: updatedWallet.cashBalance,
          totalBalance: updatedWallet.onlineBalance + updatedWallet.cashBalance,
        },
        message: `Lent ₹${numAmount} to ${borrowerName.trim()} from ${wallet} balance.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create loan error:", error);
    return NextResponse.json(
      { error: "Failed to record Udhaar loan." },
      { status: 500 }
    );
  }
}
