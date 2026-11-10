import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.startsWith("file:")) {
    return envUrl;
  }

  // If running in Vercel or AWS Lambda environment where root filesystem is read-only
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = path.join("/tmp", "pocketkhata.db");
    try {
      if (!fs.existsSync(tmpDbPath)) {
        const candidatePaths = [
          path.join(process.cwd(), "dev.db"),
          path.join(process.cwd(), "prisma", "dev.db"),
          path.resolve("dev.db"),
        ];
        const sourcePath = candidatePaths.find((p) => fs.existsSync(p));
        if (sourcePath) {
          fs.copyFileSync(sourcePath, tmpDbPath);
          console.log(`[PocketKhata DB] Seeded database copied to /tmp from ${sourcePath}`);
        }
      }
      return `file:${tmpDbPath}`;
    } catch (e) {
      console.warn("[PocketKhata DB] Notice: Could not replicate SQLite to /tmp:", e);
    }
  }

  return envUrl || "file:./dev.db";
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasourceUrl: getDatabaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
