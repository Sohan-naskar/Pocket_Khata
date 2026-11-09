// Full Dual-Wallet & Udhaar Engine Verification Test
import { PrismaClient } from "@prisma/client";
import { formatDateDDMMYYYY, isOverdue, getLoanDueStatus } from "../src/lib/date-utils.ts";

const prisma = new PrismaClient();

async function verifyEngine() {
  console.log("🚀 Testing HostelKhata Dual-Wallet & Udhaar Calculation Engine...\n");

  // 1. Fetch Student User (Aryan Sharma)
  const student = await prisma.user.findUnique({
    where: { email: "student@hostelkhata.app" },
    include: { walletProfile: true },
  });

  if (!student || !student.walletProfile) {
    throw new Error("Student demo user not found");
  }

  console.log(`1. Found student: ${student.name} (${student.email})`);
  const initialOnline = student.walletProfile.onlineBalance;
  const initialCash = student.walletProfile.cashBalance;
  const initialTotal = initialOnline + initialCash;
  console.log(`   Initial Online: ₹${initialOnline}, Cash: ₹${initialCash}, Total: ₹${initialTotal}`);

  // 2. Test Online Expense Logging
  const expenseOnlineAmt = 250;
  console.log(`\n2. Logging Online Expense of ₹${expenseOnlineAmt} (Hostel Canteen)...`);
  const [tx1, walletAfterOnlineExp] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: student.id,
        type: "EXPENSE",
        wallet: "ONLINE",
        amount: expenseOnlineAmt,
        category: "Food & Mess",
        description: "Evening Canteen Special Thali",
        date: new Date(),
      },
    }),
    prisma.walletProfile.update({
      where: { userId: student.id },
      data: { onlineBalance: { decrement: expenseOnlineAmt } },
    }),
  ]);

  console.log(`   New Online Balance: ₹${walletAfterOnlineExp.onlineBalance} (Expected: ₹${initialOnline - expenseOnlineAmt})`);
  console.log(`   New Cash Balance: ₹${walletAfterOnlineExp.cashBalance} (Unchanged: ₹${initialCash})`);
  console.log(`   New Total Balance: ₹${walletAfterOnlineExp.onlineBalance + walletAfterOnlineExp.cashBalance}`);
  if (walletAfterOnlineExp.onlineBalance !== initialOnline - expenseOnlineAmt) {
    throw new Error("Online balance deduction mismatch!");
  }

  // 3. Test Cash Expense Logging
  const expenseCashAmt = 45;
  console.log(`\n3. Logging Cash Expense of ₹${expenseCashAmt} (Chai & Bun Maska)...`);
  const [tx2, walletAfterCashExp] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: student.id,
        type: "EXPENSE",
        wallet: "CASH",
        amount: expenseCashAmt,
        category: "Chai & Snacks",
        description: "Chai & Bun Maska near Campus Gate",
        date: new Date(),
      },
    }),
    prisma.walletProfile.update({
      where: { userId: student.id },
      data: { cashBalance: { decrement: expenseCashAmt } },
    }),
  ]);

  console.log(`   New Cash Balance: ₹${walletAfterCashExp.cashBalance} (Expected: ₹${initialCash - expenseCashAmt})`);
  if (walletAfterCashExp.cashBalance !== initialCash - expenseCashAmt) {
    throw new Error("Cash balance deduction mismatch!");
  }

  // 4. Test Udhaar Lending (Deduction from Online Wallet)
  const loanAmt = 400;
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  console.log(`\n4. Lending ₹${loanAmt} Udhaar from ONLINE wallet to Vikram...`);
  const [loan1, walletAfterLend] = await prisma.$transaction([
    prisma.loan.create({
      data: {
        userId: student.id,
        borrowerName: "Vikram Malhotra",
        borrowerPhone: "9876543210",
        borrowerEmail: "vikram.m@hostel.edu",
        amount: loanAmt,
        wallet: "ONLINE",
        lentDate: new Date(),
        dueDate: yesterday, // Intentionally overdue!
        status: "PENDING",
        notes: "Split for weekend trip fuel",
      },
    }),
    prisma.transaction.create({
      data: {
        userId: student.id,
        type: "LOAN_DISBURSEMENT",
        wallet: "ONLINE",
        amount: loanAmt,
        category: "Udhaar / Loan Given",
        description: `Udhaar to Vikram Malhotra`,
        date: new Date(),
      },
    }),
    prisma.walletProfile.update({
      where: { userId: student.id },
      data: { onlineBalance: { decrement: loanAmt } },
    }),
  ]);

  console.log(`   New Online Balance after lending: ₹${walletAfterLend.onlineBalance}`);
  console.log(`   Loan ID: ${loan1.id}, Status: ${loan1.status}`);

  // 5. Test Overdue Detection & Strict DD-MM-YYYY Dates
  const overdueCheck = isOverdue(loan1.dueDate);
  const dueStatus = getLoanDueStatus(loan1.dueDate);
  const formattedLentDate = formatDateDDMMYYYY(loan1.lentDate);
  const formattedDueDate = formatDateDDMMYYYY(loan1.dueDate);
  console.log(`\n5. Checking Overdue Detection:`);
  console.log(`   Is Overdue: ${overdueCheck} (Expected: true)`);
  console.log(`   Status Label: "${dueStatus.label}"`);
  console.log(`   Lent Date (DD-MM-YYYY): "${formattedLentDate}"`);
  console.log(`   Due Date (DD-MM-YYYY): "${formattedDueDate}"`);
  if (!overdueCheck) throw new Error("Overdue detection failed!");
  if (!/^\d{2}-\d{2}-\d{4}$/.test(formattedDueDate)) throw new Error("Date format not DD-MM-YYYY!");

  // 6. Test Loan Collection (Receiving money back into CASH wallet)
  console.log(`\n6. Collecting ₹${loanAmt} Udhaar back into CASH wallet...`);
  const [loanCollected, walletAfterCollection] = await prisma.$transaction([
    prisma.loan.update({
      where: { id: loan1.id },
      data: {
        status: "COLLECTED",
        collectedAt: new Date(),
        repaymentWallet: "CASH",
      },
    }),
    prisma.transaction.create({
      data: {
        userId: student.id,
        type: "LOAN_REPAYMENT",
        wallet: "CASH",
        amount: loanAmt,
        category: "Udhaar / Loan Repayment",
        description: `Collected Udhaar repayment from Vikram Malhotra`,
        date: new Date(),
        loanId: loan1.id,
      },
    }),
    prisma.walletProfile.update({
      where: { userId: student.id },
      data: { cashBalance: { increment: loanAmt } },
    }),
  ]);

  console.log(`   Loan Status now: ${loanCollected.status}`);
  console.log(`   Repayment Wallet: ${loanCollected.repaymentWallet}`);
  console.log(`   New Cash Balance after collecting: ₹${walletAfterCollection.cashBalance}`);

  // 7. Test Admin Metrics
  console.log(`\n7. Testing Admin Telemetry Metrics...`);
  const totalUsers = await prisma.user.count();
  const totalTransactions = await prisma.transaction.count();
  const totalLoans = await prisma.loan.count();
  console.log(`   Total Users: ${totalUsers}`);
  console.log(`   Total Platform Transactions: ${totalTransactions}`);
  console.log(`   Total Udhaars: ${totalLoans}`);
  if (totalUsers < 2) throw new Error("Admin telemetry users count incorrect");

  console.log("\n🎉 ALL DUAL-WALLET & UDHAAR ENGINE CHECKS PASSED PERFECTLY!");
}

verifyEngine()
  .catch((err) => {
    console.error("❌ Engine verification error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
