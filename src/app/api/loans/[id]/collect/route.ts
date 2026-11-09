import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id: loanId } = params;

  try {
    const body = await req.json();
    const { repaymentWallet = "ONLINE" } = body;

    if (repaymentWallet !== "ONLINE" && repaymentWallet !== "CASH") {
      return NextResponse.json(
        { error: "Repayment wallet must be ONLINE or CASH." },
        { status: 400 }
      );
    }

    // Find the loan and ensure it belongs to this user
    const loan = await prisma.loan.findFirst({
      where: {
        id: loanId,
        userId,
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found." }, { status: 404 });
    }

    if (loan.status === "COLLECTED") {
      return NextResponse.json(
        { error: "This loan has already been collected." },
        { status: 400 }
      );
    }

    // Execute atomic collection: mark loan collected + log repayment + credit wallet
    const [updatedLoan, updatedWallet] = await prisma.$transaction(async (tx) => {
      const updatedL = await tx.loan.update({
        where: { id: loanId },
        data: {
          status: "COLLECTED",
          collectedAt: new Date(),
          repaymentWallet,
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: "LOAN_REPAYMENT",
          wallet: repaymentWallet,
          amount: loan.amount,
          category: "Udhaar / Loan Repayment",
          description: `Collected Udhaar repayment from ${loan.borrowerName}`,
          date: new Date(),
          loanId: loan.id,
        },
      });

      const updatedW = await tx.walletProfile.update({
        where: { userId },
        data:
          repaymentWallet === "ONLINE"
            ? { onlineBalance: { increment: loan.amount } }
            : { cashBalance: { increment: loan.amount } },
      });

      return [updatedL, updatedW];
    });

    return NextResponse.json({
      loan: updatedLoan,
      wallet: {
        onlineBalance: updatedWallet.onlineBalance,
        cashBalance: updatedWallet.cashBalance,
        totalBalance: updatedWallet.onlineBalance + updatedWallet.cashBalance,
      },
      message: `Successfully collected ₹${loan.amount} from ${loan.borrowerName} into ${repaymentWallet} wallet!`,
    });
  } catch (error) {
    console.error("Collect loan error:", error);
    return NextResponse.json(
      { error: "Failed to collect loan repayment." },
      { status: 500 }
    );
  }
}
