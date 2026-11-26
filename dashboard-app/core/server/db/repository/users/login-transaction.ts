import { prisma } from "@core/server/db/prisma";
import { PrismaUserRepository } from "./prisma-user.repository";

export async function withLoginLock<T>(email: string, run: (users: PrismaUserRepository) => Promise<T>) {
  return prisma.$transaction(async (tx) => {
    const key = `staff-login:${email.trim().toLowerCase()}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key})::bigint)`;
    return run(new PrismaUserRepository(tx));
  }, { timeout: 15000 });
}
