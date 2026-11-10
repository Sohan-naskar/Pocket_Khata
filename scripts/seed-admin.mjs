import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@pocketkhata.app";
  const adminPassword = process.env.ADMIN_PASSWORD || "adminPassword123";

  try {
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail.toLowerCase().trim() },
    });

    const hash = await bcrypt.hash(adminPassword, 10);

    if (existing) {
      await prisma.user.update({
        where: { email: adminEmail.toLowerCase().trim() },
        data: {
          passwordHash: hash,
          role: "ADMIN",
        },
      });
      console.log(`[PocketKhata Seed] Updated System Admin: ${adminEmail}`);
    } else {
      await prisma.user.create({
        data: {
          name: "System Administrator",
          email: adminEmail.toLowerCase().trim(),
          passwordHash: hash,
          role: "ADMIN",
          walletProfile: {
            create: {
              onlineBalance: 25000,
              cashBalance: 5000,
              currency: "INR",
            },
          },
        },
      });
      console.log(`[PocketKhata Seed] Created System Admin: ${adminEmail}`);
    }
  } catch (err) {
    console.warn("[PocketKhata Seed] Notice: Admin seeding skipped or database not ready:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();

