import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Running PocketKhata Database Seed & Bootstrap...");

  const adminEmail = (process.env.ADMIN_INIT_EMAIL || "admin@pocketkhata.app").toLowerCase().trim();
  const rawAdminPassword = process.env.ADMIN_INIT_PASSWORD || "adminPassword123";

  // 1. Check if any ADMIN exists in the database
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!existingAdmin) {
    const hashedAdminPassword = await bcrypt.hash(rawAdminPassword, 10);
    const adminUser = await prisma.user.create({
      data: {
        name: "System Administrator",
        email: adminEmail,
        passwordHash: hashedAdminPassword,
        role: "ADMIN",
        walletProfile: {
          create: {
            onlineBalance: 0,
            cashBalance: 0,
            currency: "INR",
          },
        },
      },
    });

    console.log("✅ Initial Admin successfully seeded. You can now log into /admin.");
    console.log(`   Admin Email: ${adminUser.email}`);
  } else {
    console.log(`ℹ️ Admin already exists in the database: ${existingAdmin.email} (Role: ${existingAdmin.role})`);
  }

  // 2. Ensure default demo user exists for immediate evaluation
  const demoEmail = "user@pocketkhata.app";
  const existingDemoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!existingDemoUser) {
    const hashedUserPassword = await bcrypt.hash("userPassword123", 10);
    const primaryUser = await prisma.user.create({
      data: {
        name: "Aryan Sharma",
        email: demoEmail,
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

    // Sample everyday transactions
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    await prisma.transaction.createMany({
      data: [
        {
          userId: primaryUser.id,
          type: "INCOME",
          wallet: "ONLINE",
          amount: 8500,
          category: "Monthly Salary",
          description: "Monthly income deposited via Bank Transfer",
          date: new Date(now.getTime() - 8 * dayMs),
        },
        {
          userId: primaryUser.id,
          type: "EXPENSE",
          wallet: "ONLINE",
          amount: 1850,
          category: "Groceries & Supermarket",
          description: "Weekly vegetables, milk & supermarket groceries",
          date: new Date(now.getTime() - 7 * dayMs),
        },
        {
          userId: primaryUser.id,
          type: "EXPENSE",
          wallet: "CASH",
          amount: 60,
          category: "Chai & Snacks",
          description: "Evening Tea & Snacks with colleagues",
          date: new Date(now.getTime() - 5 * dayMs),
        },
      ],
    });

    console.log(`✅ Default demo user seeded: ${primaryUser.email}`);
  }

  console.log("\n🚀 PocketKhata database bootstrap verified successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
