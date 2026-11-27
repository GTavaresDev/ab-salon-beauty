import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  dashboardPrisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;
const useNeonAdapter =
  connectionString && new URL(connectionString).hostname.endsWith(".neon.tech");

export const prisma =
  globalForPrisma.dashboardPrisma ??
  new PrismaClient({
    ...(useNeonAdapter
      ? { adapter: new PrismaNeon({ connectionString }) }
      : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.dashboardPrisma = prisma;
}
