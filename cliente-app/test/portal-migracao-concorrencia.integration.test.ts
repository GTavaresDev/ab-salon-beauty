import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, expect, it, vi } from "vitest";
import { prisma } from "@core/infrastructure/shared/client";
import { admitVerifiedClient, hasPortalAccess } from "@/lib/portal-access";

vi.mock("@core/infrastructure/shared/client", async () => {
  const { PrismaClient } = await import("@prisma/client");
  const url = new URL(process.env.TEST_DATABASE_URL ?? "about:blank");
  if (url.protocol !== "postgresql:" || url.hostname !== "127.0.0.1" ||
      url.pathname !== "/salon_fixture_test" || url.search || url.hash) {
    throw new Error("Banco local de teste obrigatório.");
  }
  return { prisma: new PrismaClient({ datasourceUrl: url.href }) };
});

const createdIds: string[] = [];

afterAll(async () => {
  try { await prisma.client.deleteMany({ where: { id: { in: createdIds } } }); }
  finally { await prisma.$disconnect(); }
});

it("migração aprova ativos existentes, mantém inativos bloqueados e exige análise ao reativar", async () => {
  const migrationSql = readFileSync(
    path.resolve(import.meta.dirname, "../prisma/migrations/20261126040000_client_portal_access/migration.sql"),
    "utf8",
  );
  expect(migrationSql).toContain(`UPDATE "Clients" SET "portalAccess" = 'APPROVED' WHERE status = 'Ativo';`);

  const activeExisting = randomUUID();
  const inactiveExisting = randomUUID();
  const newClient = randomUUID();

  await prisma.client.createMany({
    data: [
      { id: activeExisting, name: "Ativo Antigo", email: `${activeExisting}@example.invalid`, phone: "11900000001", initials: "AA", status: "Ativo", portalAccess: "WAITING" },
      { id: inactiveExisting, name: "Inativo Antigo", email: `${inactiveExisting}@example.invalid`, phone: "11900000002", initials: "IA", status: "Inativo", portalAccess: "WAITING" },
    ],
  });
  createdIds.push(activeExisting, inactiveExisting, newClient);

  // Simula exatamente o backfill da migração para estes registros
  await prisma.$executeRawUnsafe(
    `UPDATE "Clients" SET "portalAccess" = 'APPROVED' WHERE id IN ($1, $2) AND status = 'Ativo'`,
    activeExisting,
    inactiveExisting,
  );

  // Novo cadastro após a migração começa em WAITING
  await prisma.client.create({
    data: { id: newClient, name: "Novo", email: `${newClient}@example.invalid`, phone: "11900000003", initials: "NO", status: "Ativo" },
  });

  expect(await hasPortalAccess(activeExisting)).toBe(true);
  expect(await hasPortalAccess(inactiveExisting)).toBe(false);
  expect(await hasPortalAccess(newClient)).toBe(false);

  // Reativar o inativo não concede acesso; ele precisa passar pela análise
  await prisma.client.update({ where: { id: inactiveExisting }, data: { status: "Ativo" } });
  expect(await hasPortalAccess(inactiveExisting)).toBe(false);
  expect(await admitVerifiedClient(inactiveExisting)).toBe(false);
  const reactivated = await prisma.client.findUniqueOrThrow({ where: { id: inactiveExisting } });
  expect(reactivated.portalAccess).toBe("IN_REVIEW");
});

it("logins e aprovações simultâneos preservam estado APPROVED e único registro de aprovação", async () => {
  const id = randomUUID();
  await prisma.client.create({
    data: { id, name: "Concorrente", email: `${id}@example.invalid`, phone: "11900000004", initials: "CO", status: "Ativo", portalAccess: "IN_REVIEW" },
  });
  createdIds.push(id);

  const approver1 = randomUUID();
  const approver2 = randomUUID();

  // Simula logins concorrentes (admitVerifiedClient) junto com múltiplas aprovações simultâneas
  await Promise.all([
    admitVerifiedClient(id),
    admitVerifiedClient(id),
    prisma.client.updateMany({
      where: { id, status: "Ativo", portalAccess: "IN_REVIEW" },
      data: { portalAccess: "APPROVED", portalApprovedAt: new Date("2026-11-26T10:00:00Z"), portalApprovedById: approver1 },
    }),
    prisma.client.updateMany({
      where: { id, status: "Ativo", portalAccess: "IN_REVIEW" },
      data: { portalAccess: "APPROVED", portalApprovedAt: new Date("2026-11-26T10:00:01Z"), portalApprovedById: approver2 },
    }),
    admitVerifiedClient(id),
  ]);

  const final = await prisma.client.findUniqueOrThrow({ where: { id } });
  expect(final.portalAccess).toBe("APPROVED");
  expect(final.portalApprovedAt).not.toBeNull();
  expect([approver1, approver2]).toContain(final.portalApprovedById);
});
