import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, expect, it, vi } from "vitest";
import { prisma } from "./postgres-local";
import { approvePortalClient, pendingPortalClients } from "@core/application/query/controller/clients/portal-approval.controller";
import { fetchClientsAction } from "@core/application/query/controller/clients/client.controller";

const authState = vi.hoisted(() => ({
  userId: null as string | null,
  role: "Funcionario" as "Dono" | "Administrador" | "Gestor" | "Funcionario",
}));

vi.mock("@core/server/db/prisma", async () => {
  const local = await import("./postgres-local");
  return { prisma: local.prisma };
});

vi.mock("@/auth", () => ({
  auth: async () => (authState.userId ? { user: { id: authState.userId, role: authState.role } } : null),
  signOut: vi.fn(),
}));

const clientIds: string[] = [];
const userIds: string[] = [];

async function createStaffUser(role: "Dono" | "Administrador" | "Gestor" | "Funcionario", status = "Ativo") {
  const id = randomUUID();
  await prisma.user.create({
    data: { id, name: `Staff ${role}`, email: `${id}@example.invalid`, phone: "11999990000", initials: "ST", status },
  });
  await prisma.userPermission.create({
    data: {
      userId: id,
      name: role,
      enabled: true,
    },
  });
  userIds.push(id);
  return id;
}

async function createClient(overrides: { status?: string; portalAccess?: "WAITING" | "IN_REVIEW" | "APPROVED" } = {}) {
  const id = randomUUID();
  await prisma.client.create({
    data: {
      id,
      name: `Cliente ${id.slice(0, 6)}`,
      email: `${id}@example.invalid`,
      phone: "11988887777",
      initials: "CL",
      status: overrides.status ?? "Ativo",
      portalAccess: overrides.portalAccess ?? "IN_REVIEW",
    },
  });
  clientIds.push(id);
  return id;
}

beforeEach(() => {
  authState.userId = null;
  authState.role = "Funcionario";
});

afterAll(async () => {
  try {
    await prisma.client.deleteMany({ where: { id: { in: clientIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  } finally {
    await prisma.$disconnect();
  }
});

it("somente Product Manegar consulta e aprova cadastros em análise", async () => {
  const gestorId = await createStaffUser("Gestor");
  const adminId = await createStaffUser("Administrador");
  const pending = await createClient({ status: "Ativo", portalAccess: "IN_REVIEW" });
  const waiting = await createClient({ status: "Ativo", portalAccess: "WAITING" });
  const inactive = await createClient({ status: "Inativo", portalAccess: "IN_REVIEW" });

  authState.userId = gestorId;
  authState.role = "Gestor";
  expect(await pendingPortalClients()).toEqual([]);
  expect((await approvePortalClient(pending)).success).toBe(false);
  expect((await fetchClientsAction()).map((client) => client.id)).not.toContain(pending);

  authState.userId = adminId;
  authState.role = "Administrador";
  const listedIds = (await pendingPortalClients()).map((client) => client.id);
  expect(listedIds).toContain(pending);
  expect(listedIds).not.toContain(waiting);
  expect(listedIds).not.toContain(inactive);
  expect(await approvePortalClient(pending)).toEqual({ success: true });
  const approved = await prisma.client.findUniqueOrThrow({ where: { id: pending } });
  expect(approved.portalApprovedById).toBe(adminId);
  expect(approved.portalApprovedAt).not.toBeNull();
  expect((await approvePortalClient(pending)).success).toBe(false);
  expect((await approvePortalClient(waiting)).success).toBe(false);
  expect((await approvePortalClient(inactive)).success).toBe(false);
});

it("recusa Dono, Funcionario, visitante e papel rebaixado no banco", async () => {
  const donoId = await createStaffUser("Dono");
  const funcId = await createStaffUser("Funcionario");
  const clientId = await createClient({ status: "Ativo", portalAccess: "IN_REVIEW" });

  // Visitante sem sessão
  await expect(pendingPortalClients()).rejects.toThrow("Não autenticado");
  await expect(approvePortalClient(clientId)).rejects.toThrow("Não autenticado");

  // Dono
  authState.userId = donoId;
  authState.role = "Dono";
  expect(await pendingPortalClients()).toEqual([]);
  expect((await approvePortalClient(clientId)).success).toBe(false);

  // Funcionario
  authState.userId = funcId;
  authState.role = "Funcionario";
  expect(await pendingPortalClients()).toEqual([]);
  expect((await approvePortalClient(clientId)).success).toBe(false);

  // Sessão com cookie dizendo Gestor, mas papel atual no banco é Funcionario
  authState.userId = funcId;
  authState.role = "Gestor";
  expect(await pendingPortalClients()).toEqual([]);
  expect((await approvePortalClient(clientId)).success).toBe(false);

  const unchanged = await prisma.client.findUniqueOrThrow({ where: { id: clientId } });
  expect(unchanged.portalAccess).toBe("IN_REVIEW");
  expect(unchanged.portalApprovedAt).toBeNull();
});
