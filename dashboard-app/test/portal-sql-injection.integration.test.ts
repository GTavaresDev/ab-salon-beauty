import { randomUUID } from "node:crypto";
import { afterAll, expect, it, vi } from "vitest";
import { prisma } from "./postgres-local";
import { approvePortalClient } from "@core/application/query/controller/clients/portal-approval.controller";

const gestorId = vi.hoisted(() => "00000000-0000-4000-8000-000000000002");

vi.mock("@core/server/db/prisma", async () => {
  const local = await import("./postgres-local");
  return { prisma: local.prisma };
});

vi.mock("@/auth", () => ({
  auth: async () => ({ user: { id: gestorId, role: "Gestor" } }),
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

it("parametriza ID com sintaxe SQL na ação de aprovação sem aprovar terceiros", async () => {
  await prisma.user.upsert({
    where: { id: gestorId },
    create: { id: gestorId, name: "Gestor SQL", email: `${gestorId}@example.invalid`, phone: "11999990000", initials: "GS", status: "Ativo" },
    update: {},
  });
  await prisma.userPermission.upsert({
    where: { userId_name: { userId: gestorId, name: "Gestor" } },
    create: { userId: gestorId, name: "Gestor", enabled: true },
    update: { enabled: true },
  });
  userIds.push(gestorId);

  const victimId = randomUUID();
  await prisma.client.create({
    data: {
      id: victimId,
      name: "Vitima Painel",
      email: `${victimId}@example.invalid`,
      phone: "11911112222",
      initials: "VP",
      status: "Ativo",
      portalAccess: "IN_REVIEW",
    },
  });
  clientIds.push(victimId);

  const payloads = [
    "' OR '1'='1",
    "'; UPDATE \"Clients\" SET \"portalAccess\" = 'APPROVED'; --",
    `${victimId}' OR '1'='1`,
  ];

  for (const payload of payloads) {
    const res = await approvePortalClient(payload);
    expect(res.success).toBe(false);
  }

  const victimAfter = await prisma.client.findUniqueOrThrow({ where: { id: victimId } });
  expect(victimAfter.portalAccess).toBe("IN_REVIEW");
  expect(victimAfter.portalApprovedAt).toBeNull();
  expect(victimAfter.portalApprovedById).toBeNull();
});
