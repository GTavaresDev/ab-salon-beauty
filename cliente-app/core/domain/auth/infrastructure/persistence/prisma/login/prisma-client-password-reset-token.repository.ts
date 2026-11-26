import { prisma } from "@core/infrastructure/shared/client";
import type { ClientPasswordResetTokenRepository, ResetTokenIssue } from "@core/domain/auth/repositories/client-password-reset-token.repository";

const windowMs = 15 * 60_000;

export class PrismaClientPasswordResetTokenRepository implements ClientPasswordResetTokenRepository {
  async issue(input: ResetTokenIssue): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      // Todas as instâncias usam a mesma ordem de locks: origem, depois cliente.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(1, hashtext(${input.originHash}))`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(2, hashtext(${input.clientId}))`;
      const eligible = await tx.client.findFirst({ where: {
        id: input.clientId, email: input.issuedEmail, status: "Ativo",
        OR: [{ password: { not: null } }, { oauthAccounts: { none: {} } }],
      }, select: { id: true } });
      if (!eligible) return false;

      const createdAt = { gt: new Date(Date.now() - windowMs) };
      const recent = await tx.clientPasswordResetToken.count({ where: { clientId: input.clientId, createdAt } });
      if (recent >= 3) return false;
      const fromOrigin = await tx.clientPasswordResetToken.count({ where: { originHash: input.originHash, createdAt } });
      if (fromOrigin >= 20) return false;

      await tx.clientPasswordResetToken.create({ data: input });
      return true;
    });
  }

  async findValidByTokenHash(tokenHash: string): Promise<{ clientId: string } | null> {
    const token = await prisma.clientPasswordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
      select: { clientId: true, issuedEmail: true, client: { select: { email: true, status: true } } },
    });
    if (!token || token.client.status !== "Ativo" || (token.issuedEmail && token.issuedEmail !== token.client.email)) return null;
    return { clientId: token.clientId };
  }

  async consume(clientId: string, tokenHash: string, passwordHash: string): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(2, hashtext(${clientId}))`;
      const now = new Date();
      const token = await tx.clientPasswordResetToken.findFirst({
        where: { clientId, tokenHash, usedAt: null, expiresAt: { gt: now } },
        select: { issuedEmail: true },
      });
      if (!token) return false;
      const changed = await tx.client.updateMany({
        where: { id: clientId, status: "Ativo", email: token.issuedEmail ?? undefined,
          OR: [{ password: { not: null } }, { oauthAccounts: { none: {} } }] },
        data: { password: passwordHash },
      });
      if (!changed.count) return false;
      await tx.clientPasswordResetToken.updateMany({ where: { clientId, usedAt: null }, data: { usedAt: now } });
      return true;
    });
  }
}
