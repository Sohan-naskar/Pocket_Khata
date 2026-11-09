import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding HostelKhata database with demo data...");

  // Clear existing data in dev
  await prisma.transaction.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.walletProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdminPassword = await bcrypt.hash("adminPassword123", 10);
  const hashedStudentPassword = await bcrypt.hash("studentPassword123", 10);

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: "Hostel Warden (Admin)",
      email: "admin@hostelkhata.app",
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

  // 2. Create Student User (Aryan Sharma)
  const studentUser = await prisma.user.create({
    data: {
      name: "Aryan Sharma",
      email: "student@hostelkhata.app",
      passwordHash: hashedStudentPassword,
      role: "USER",
      walletProfile: {
        create: {
          onlineBalance: 3250.0,
          cashBalance: 650.0,
          currency: "INR",
        },
      },
    },
  });

  console.log(`✅ Created Student user: ${studentUser.email}`);

  // 3. Create Sample Transactions for Student
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const sampleTransactions = [
    {
      userId: studentUser.id,
      type: "INCOME" as const,
      wallet: "ONLINE" as const,
      amount: 6000,
      category: "Monthly Allowance (Parents)",
      description: "Monthly pocket allowance via UPI from Dad",
      date: new Date(now.getTime() - 8 * dayMs),
    },
    {
      userId: studentUser.id,
      type: "EXPENSE" as const,
      wallet: "ONLINE" as const,
      amount: 2200,
      category: "Food & Mess",
      description: "Hostel Mess Advance Bill - November",
      date: new Date(now.getTime() - 7 * dayMs),
    },
    {
      userId: studentUser.id,
      type: "EXPENSE" as const,
      wallet: "CASH" as const,
      amount: 40,
      category: "Chai & Snacks",
      description: "Evening Chai & Samosa near Library Gate",
      date: new Date(now.getTime() - 5 * dayMs),
    },
    {
      userId: studentUser.id,
      type: "EXPENSE" as const,
      wallet: "CASH" as const,
      amount: 110,
      category: "Stationery & Xerox",
      description: "Data Structures lab manual xerox & spiral binding",
      date: new Date(now.getTime() - 4 * dayMs),
    },
    {
      userId: studentUser.id,
      type: "EXPENSE" as const,
      wallet: "ONLINE" as const,
      amount: 299,
      category: "Recharge & Subscriptions",
      description: "Monthly Mobile Data & Calling Recharge",
      date: new Date(now.getTime() - 3 * dayMs),
    },
    {
      userId: studentUser.id,
      type: "EXPENSE" as const,
      wallet: "CASH" as const,
      amount: 80,
      category: "Travel & Auto/Bus",
      description: "Shared auto rickshaw to railway station",
      date: new Date(now.getTime() - 1 * dayMs),
    },
  ];

  for (const tx of sampleTransactions) {
    await prisma.transaction.create({ data: tx });
  }
  console.log(`✅ Created ${sampleTransactions.length} sample transactions`);

  // 4. Create Sample Udhaar / Loans
  // Loan 1: Overdue loan (Due 1 day ago) - should trigger Overdue Banner!
  const overdueLoan = await prisma.loan.create({
    data: {
      userId: studentUser.id,
      borrowerName: "Vikram Malhotra (Room 204)",
      borrowerPhone: "9876543210",
      borrowerEmail: "vikram.m@hostel.edu",
      amount: 350,
      wallet: "ONLINE",
      lentDate: new Date(now.getTime() - 5 * dayMs),
      dueDate: new Date(now.getTime() - 1 * dayMs), // Overdue!
      status: "PENDING",
      notes: "Dinner split at Punjabi Dhaba near campus",
    },
  });

  // Loan 2: Pending loan (Due in 3 days)
  const pendingLoan = await prisma.loan.create({
    data: {
      userId: studentUser.id,
      borrowerName: "Rohan Gupta (Room 108)",
      borrowerPhone: "9823456789",
      borrowerEmail: "rohan.g@hostel.edu",
      amount: 200,
      wallet: "CASH",
      lentDate: new Date(now.getTime() - 2 * dayMs),
      dueDate: new Date(now.getTime() + 3 * dayMs),
      status: "PENDING",
      notes: "Cash for college bus monthly pass passbook",
    },
  });

  // Loan 3: Collected loan
  const collectedLoan = await prisma.loan.create({
    data: {
      userId: studentUser.id,
      borrowerName: "Sneha Patel (Flat 3B)",
      borrowerPhone: "9812345678",
      borrowerEmail: "sneha.p@college.ac.in",
      amount: 500,
      wallet: "ONLINE",
      lentDate: new Date(now.getTime() - 12 * dayMs),
      dueDate: new Date(now.getTime() - 6 * dayMs),
      status: "COLLECTED",
      collectedAt: new Date(now.getTime() - 5 * dayMs),
      repaymentWallet: "ONLINE",
      notes: "Flat Wi-Fi router share",
    },
  });

  console.log("✅ Created 3 sample loans (1 Overdue, 1 Pending, 1 Collected)");
  console.log("\n🚀 Demo Credentials:");
  console.log("   Student: student@hostelkhata.app / studentPassword123");
  console.log("   Admin:   admin@hostelkhata.app   / adminPassword123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

