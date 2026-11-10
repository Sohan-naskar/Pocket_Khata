import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET: Fetch user's transactions and loans with STRICT FINANCIAL PRIVACY (no monetary amounts)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID parameter is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // STRICT FINANCIAL PRIVACY: amount is explicitly excluded
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        wallet: true,
        category: true,
        description: true,
        date: true,
        createdAt: true,
      },
      orderBy: { date: "desc" },
    });

    // STRICT FINANCIAL PRIVACY: amount is explicitly excluded
    const loans = await prisma.loan.findMany({
      where: { userId },
      select: {
        id: true,
        borrowerName: true,
        borrowerPhone: true,
        borrowerEmail: true,
        wallet: true,
        lentDate: true,
        dueDate: true,
        status: true,
        notes: true,
        collectedAt: true,
        createdAt: true,
      },
      orderBy: { lentDate: "desc" },
    });

    return NextResponse.json({
      user,
      transactions,
      loans,
    });
  } catch (error) {
    console.error("Admin user data fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching user data" },
      { status: 500 }
    );
  }
}

// DELETE: Remove transactions or loans from a user account (bulk or individual)
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { userId, action, itemId } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "userId and action are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "CLEAR_TRANSACTIONS") {
      const deleted = await prisma.transaction.deleteMany({
        where: { userId },
      });
      return NextResponse.json({
        message: `Cleared ${deleted.count} transaction(s) for ${user.email}.`,
        count: deleted.count,
      });
    }

    if (action === "CLEAR_LOANS") {
      // Unlink any transactions pointing to these loans
      await prisma.transaction.updateMany({
        where: { userId, loanId: { not: null } },
        data: { loanId: null },
      });
      const deleted = await prisma.loan.deleteMany({
        where: { userId },
      });
      return NextResponse.json({
        message: `Cleared ${deleted.count} peer loan(s) for ${user.email}.`,
        count: deleted.count,
      });
    }

    if (action === "DELETE_TRANSACTION") {
      if (!itemId) {
        return NextResponse.json(
          { error: "itemId (transaction ID) is required" },
          { status: 400 }
        );
      }
      await prisma.transaction.delete({
        where: { id: itemId, userId },
      });
      return NextResponse.json({
        message: "Transaction removed successfully.",
      });
    }

    if (action === "DELETE_LOAN") {
      if (!itemId) {
        return NextResponse.json(
          { error: "itemId (loan ID) is required" },
          { status: 400 }
        );
      }
      // Unlink transactions pointing to this loan
      await prisma.transaction.updateMany({
        where: { loanId: itemId },
        data: { loanId: null },
      });
      await prisma.loan.delete({
        where: { id: itemId, userId },
      });
      return NextResponse.json({
        message: "Peer loan removed successfully.",
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Supported: CLEAR_TRANSACTIONS, CLEAR_LOANS, DELETE_TRANSACTION, DELETE_LOAN" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin user data delete error:", error);
    return NextResponse.json(
      { error: "Internal server error while removing user data" },
      { status: 500 }
    );
  }
}
