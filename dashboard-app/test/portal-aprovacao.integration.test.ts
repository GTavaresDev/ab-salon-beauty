import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, expect, it, vi } from "vitest";
import { prisma } from "./postgres-local";
import { approvePortalClient, pendingPortalClients } from "@core/application/query/controller/clients/portal-approval.controller";

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

it("Gestor e Administrador (Product Manager) aprovam cadastro ativo em análise e segunda tentativa preserva o primeiro registro", async () => {
  const gestorId = await createStaffUser("Gestor");
  const adminId = await createStaffUser("Administrador");
  const c1 = await createClient({ status: "Ativo", portalAccess: "IN_REVIEW" });
  const c2 = await createClient({ status: "Ativo", portalAccess: "IN_REVIEW" });
  const waiting = await createClient({ status: "Ativo", portalAccess: "WAITING" });
  const inactive = await createClient({ status: "Inativo", portalAccess: "IN_REVIEW" });

  authState.userId = gestorId;
  authState.role = "Gestor";

  const list = await pendingPortalClients();
  const listedIds = list.map((c) => c.id);
  expect(listedIds).toContain(c1);
  expect(listedIds).toContain(c2);
  expect(listedIds).not.toContain(waiting);
  expect(listedIds).not.toContain(inactive);

  expect(await approvePortalClient(c1)).toEqual({ success: true });
  const approved1 = await prisma.client.findUniqueOrThrow({ where: { id: c1 } });
  expect(approved1.portalAccess).toBe("APPROVED");
  expect(approved1.portalApprovedById).toBe(gestorId);
  expect(approved1.portalApprovedAt).not.toBeNull();

  // Segunda tentativa por Administrador preserva portalApprovedAt e portalApprovedById da primeira aprovação
  authState.userId = adminId;
  authState.role = "Administrador";
  const retry = await approvePortalClient(c1);
  expect(retry.success).toBe(false);
  const afterRetry = await prisma.client.findUniqueOrThrow({ where: { id: c1 } });
  expect(afterRetry.portalApprovedById).toBe(gestorId);
  expect(afterRetry.portalApprovedAt?.getTime()).toBe(approved1.portalApprovedAt?.getTime());

  // Administrador aprova o segundo cliente; WAITING e Inativo não são aprovados
  expect(await approvePortalClient(c2)).toEqual({ success: true });
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
