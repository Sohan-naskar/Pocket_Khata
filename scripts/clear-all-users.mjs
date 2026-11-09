import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const usersBefore = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });
  console.log(`Found ${usersBefore.length} user(s) before cleanup:`);
  usersBefore.forEach((u) => console.log(` - ${u.email} (${u.name}, ${u.role})`));

  console.log("\nDeleting all records...");
  const delTransactions = await prisma.transaction.deleteMany();
  const delLoans = await prisma.loan.deleteMany();
  const delWallets = await prisma.walletProfile.deleteMany();
  const delSessions = await prisma.session.deleteMany();
  const delAccounts = await prisma.account.deleteMany();
  const delTokens = await prisma.verificationToken.deleteMany();
  const delUsers = await prisma.user.deleteMany();

  console.log(`Deleted:`);
  console.log(` - ${delTransactions.count} transactions`);
  console.log(` - ${delLoans.count} loans`);
  console.log(` - ${delWallets.count} wallet profiles`);
  console.log(` - ${delSessions.count} sessions`);
  console.log(` - ${delAccounts.count} OAuth accounts`);
  console.log(` - ${delTokens.count} verification tokens`);
  console.log(` - ${delUsers.count} users`);

  const remaining = await prisma.user.count();
  console.log(`\nRemaining users in database: ${remaining}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

