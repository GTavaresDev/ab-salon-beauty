import { randomUUID } from "node:crypto";
import { afterAll, expect, it, vi } from "vitest";
import { prisma } from "./postgres-local";
import { createClientAction, updateClientAction } from "@core/application/query/controller/clients/client.controller";

const adminId = vi.hoisted(() => "00000000-0000-4000-8000-000000000001");

vi.mock("@core/server/db/prisma", async () => {
  const local = await import("./postgres-local");
  return { prisma: local.prisma };
});

vi.mock("@/auth", () => ({
  auth: async () => ({ user: { id: adminId, role: "Administrador" } }),
  signOut: vi.fn(),
}));

const clientIds: string[] = [];
const userIds: string[] = [];

afterAll(async () => {
  try {
    await prisma.client.deleteMany({ where: { id: { in: clientIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  } finally {
    await prisma.$disconnect();
  }
});

it("cadastro pela equipe começa aguardando primeiro login e ativar cliente no dashboard não concede acesso ao portal", async () => {
  await prisma.user.upsert({
    where: { id: adminId },
    create: { id: adminId, name: "Admin Teste", email: `${adminId}@example.invalid`, phone: "11999990000", initials: "AT", status: "Ativo" },
    update: {},
  });
  await prisma.userPermission.upsert({
    where: { userId_name: { userId: adminId, name: "Administrador" } },
    create: { userId: adminId, name: "Administrador", enabled: true },
    update: { enabled: true },
  });
  userIds.push(adminId);

  const email = `${randomUUID()}@example.invalid`;
  const created = await createClientAction({
    name: "Cliente Criado Equipe",
    email,
    phone: "11977776666",
    status: "Inativo",
    ...({ portalAccess: "APPROVED", portalApprovedById: adminId } as Record<string, unknown>),
  });
  expect(created.success).toBe(true);
  if (!created.success || !created.data) throw new Error("Falha ao criar cliente");
  clientIds.push(created.data.id);

  const dbAfterCreate = await prisma.client.findUniqueOrThrow({ where: { id: created.data.id } });
  expect(dbAfterCreate.portalAccess).toBe("WAITING");
  expect(dbAfterCreate.portalApprovedAt).toBeNull();
  expect(dbAfterCreate.portalApprovedById).toBeNull();

  // Reativar para Ativo pelo dashboard (inclusive com campos extras) não aprova o acesso ao portal
  const updated = await updateClientAction({
    id: created.data.id,
    status: "Ativo",
    ...({ portalAccess: "APPROVED", portalApprovedAt: new Date().toISOString() } as Record<string, unknown>),
  });
  expect(updated.success).toBe(true);

  const dbAfterUpdate = await prisma.client.findUniqueOrThrow({ where: { id: created.data.id } });
  expect(dbAfterUpdate.status).toBe("Ativo");
  expect(dbAfterUpdate.portalAccess).toBe("WAITING");
  expect(dbAfterUpdate.portalApprovedAt).toBeNull();
});
