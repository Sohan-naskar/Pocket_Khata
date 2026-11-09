import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PocketKhata database with demo data...");

  // Clear existing data in dev
  await prisma.transaction.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.walletProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdminPassword = await bcrypt.hash("adminPassword123", 10);
  const hashedUserPassword = await bcrypt.hash("userPassword123", 10);
  const hashedLegacyStudentPassword = await bcrypt.hash("studentPassword123", 10);

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@pocketkhata.app",
      passwordHash: hashedAdminPassword,
      role: "ADMIN",
      walletProfile: {
        create: {
          onlineBalance: 25000,
          cashBalance: 8500,
          currency: "INR",
        },
      },
    },
  });

  console.log(`✅ Created Admin user: ${adminUser.email}`);

  // 2. Create Primary User (Aryan Sharma)
  const primaryUser = await prisma.user.create({
    data: {
      name: "Aryan Sharma",
      email: "user@pocketkhata.app",
      passwordHash: hashedUserPassword,
      role: "USER",
      walletProfile: {
        create: {
          onlineBalance: 4250.0,
          cashBalance: 1150.0,
          currency: "INR",
        },
      },
    },
  });

  // Create legacy student demo alias for backward compatibility
  await prisma.user.create({
    data: {
      name: "Aryan Sharma",
      email: "student@hostelkhata.app",
      passwordHash: hashedLegacyStudentPassword,
      role: "USER",
      walletProfile: {
        create: {
          onlineBalance: 4250.0,
          cashBalance: 1150.0,
          currency: "INR",
        },
      },
    },
  });

  console.log(`✅ Created Primary user: ${primaryUser.email}`);

  // 3. Create Sample Everyday Transactions
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const sampleTransactions = [
    {
      userId: primaryUser.id,
      type: "INCOME" as const,
      wallet: "ONLINE" as const,
      amount: 8500,
      category: "Monthly Salary",
      description: "Monthly income deposited via Bank Transfer",
      date: new Date(now.getTime() - 8 * dayMs),
    },
    {
      userId: primaryUser.id,
      type: "EXPENSE" as const,
      wallet: "ONLINE" as const,
      amount: 1850,
      category: "Groceries & Supermarket",
      description: "Weekly vegetables, milk & supermarket groceries",
      date: new Date(now.getTime() - 7 * dayMs),
    },
    {
      userId: primaryUser.id,
      type: "EXPENSE" as const,
      wallet: "CASH" as const,
      amount: 60,
      category: "Chai & Snacks",
      description: "Evening Tea & Snacks with colleagues",
      date: new Date(now.getTime() - 5 * dayMs),
    },
    {
      userId: primaryUser.id,
      type: "EXPENSE" as const,
      wallet: "CASH" as const,
      amount: 120,
      category: "Travel & Fuel",
      description: "Auto rickshaw & metro card recharge",
      date: new Date(now.getTime() - 4 * dayMs),
    },
    {
      userId: primaryUser.id,
      type: "EXPENSE" as const,
      wallet: "ONLINE" as const,
      amount: 499,
      category: "Bills & Recharges",
      description: "Broadband Wi-Fi & Mobile Bill",
      date: new Date(now.getTime() - 3 * dayMs),
    },
    {
      userId: primaryUser.id,
      type: "EXPENSE" as const,
      wallet: "ONLINE" as const,
      amount: 750,
      category: "Food & Dining",
      description: "Weekend dinner with friends",
      date: new Date(now.getTime() - 1 * dayMs),
    },
  ];

  for (const tx of sampleTransactions) {
    await prisma.transaction.create({ data: tx });
  }
  console.log(`✅ Created ${sampleTransactions.length} sample everyday transactions`);

  // 4. Create Sample Udhaar / Loans
  // Loan 1: Overdue loan (Due 1 day ago) - triggers Overdue Banner!
  await prisma.loan.create({
    data: {
      userId: primaryUser.id,
      borrowerName: "Vikram Malhotra",
      borrowerPhone: "9876543210",
      borrowerEmail: "vikram@example.com",
      amount: 450,
      wallet: "ONLINE",
      lentDate: new Date(now.getTime() - 5 * dayMs),
      dueDate: new Date(now.getTime() - 1 * dayMs), // Overdue!
      status: "PENDING",
      notes: "Dinner bill split at city center restaurant",
    },
  });

  // Loan 2: Pending loan (Due in 3 days)
  await prisma.loan.create({
    data: {
      userId: primaryUser.id,
      borrowerName: "Rohan Gupta",
      borrowerPhone: "9823456789",
      borrowerEmail: "rohan@example.com",
      amount: 300,
      wallet: "CASH",
      lentDate: new Date(now.getTime() - 2 * dayMs),
      dueDate: new Date(now.getTime() + 3 * dayMs),
      status: "PENDING",
      notes: "Cash for metro smart card recharge",
    },
  });

  // Loan 3: Collected loan
  await prisma.loan.create({
    data: {
      userId: primaryUser.id,
      borrowerName: "Sneha Patel",
      borrowerPhone: "9812345678",
      borrowerEmail: "sneha@example.com",
      amount: 500,
      wallet: "ONLINE",
      lentDate: new Date(now.getTime() - 12 * dayMs),
      dueDate: new Date(now.getTime() - 6 * dayMs),
      status: "COLLECTED",
      collectedAt: new Date(now.getTime() - 5 * dayMs),
      repaymentWallet: "ONLINE",
      notes: "Shared home internet router bill",
    },
  });

  console.log("✅ Created 3 sample loans (1 Overdue, 1 Pending, 1 Collected)");
  console.log("\n🚀 Demo Credentials:");
  console.log("   User:  user@pocketkhata.app  / userPassword123");
  console.log("   Admin: admin@pocketkhata.app / adminPassword123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
