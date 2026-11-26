import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, expect, it, vi } from "vitest";
import { prisma } from "@core/infrastructure/shared/client";
import { completeClientProfileAction } from "@core/application/query/controller/login/login-profile.controller";
import { createLoginFactory } from "@core/domain/auth/login.factory";
import { encodeClientSessionToken, clientSessionCookieName } from "@/lib/client-session-token";

const cookieJar = new Map<string, string>();

vi.mock("@core/infrastructure/shared/client", async () => {
  const { PrismaClient } = await import("@prisma/client");
  const url = new URL(process.env.TEST_DATABASE_URL ?? "about:blank");
  if (url.protocol !== "postgresql:" || url.hostname !== "127.0.0.1" ||
      url.pathname !== "/salon_fixture_test" || url.search || url.hash) {
    throw new Error("Banco local de teste obrigatório.");
  }
  return { prisma: new PrismaClient({ datasourceUrl: url.href }) };
});

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined),
    set: (name: string, value: string) => { cookieJar.set(name, value); },
    delete: (name: string) => { cookieJar.delete(name); },
  }),
}));

const createdIds: string[] = [];

beforeEach(() => {
  process.env.AUTH_SECRET = "test-secret-key-at-least-32-chars-long";
  cookieJar.clear();
});

afterAll(async () => {
  try { await prisma.client.deleteMany({ where: { id: { in: createdIds } } }); }
  finally { await prisma.$disconnect(); }
});

it("descarta campos extras de aprovação, status ou papel no cadastro e atualização de perfil", async () => {
  const { registerClient } = createLoginFactory();
  const selfEmail = `${randomUUID()}@example.invalid`;
  const otherId = randomUUID();
  const otherEmail = `${otherId}@example.invalid`;

  await prisma.client.create({
    data: {
      id: otherId,
      name: "Outro Cliente",
      email: otherEmail,
      phone: "11988887777",
      initials: "OC",
      status: "Ativo",
      portalAccess: "IN_REVIEW",
    },
  });
  createdIds.push(otherId);

  const registered = await registerClient.execute({
    name: "Novo Cliente",
    email: selfEmail,
    phone: "11977776666",
    password: "SenhaForte123",
    // Campos extras maliciosos simulando tentativa de autoaprovação
    ...({
      portalAccess: "APPROVED",
      portalApprovedAt: new Date().toISOString(),
      portalApprovedById: "self",
      role: "Administrador",
    } as Record<string, unknown>),
  });
  createdIds.push(registered.id);

  expect("portalAccess" in registered).toBe(false);
  expect("portalApprovedAt" in registered).toBe(false);
  expect("portalApprovedById" in registered).toBe(false);

  const selfInDb = await prisma.client.findUniqueOrThrow({ where: { id: registered.id } });
  expect(selfInDb.portalAccess).toBe("WAITING");
  expect(selfInDb.portalApprovedAt).toBeNull();
  expect(selfInDb.portalApprovedById).toBeNull();

  // Simula cliente aprovado completando o próprio perfil e tentando injetar campos para outro cliente ou para si
  await prisma.client.update({
    where: { id: registered.id },
    data: { portalAccess: "APPROVED", portalApprovedAt: new Date("2026-01-01T00:00:00Z"), portalApprovedById: "gestor-1" },
  });

  const token = await encodeClientSessionToken({
    clientId: registered.id,
    name: registered.name,
    email: registered.email,
    initials: registered.initials,
  });
  cookieJar.set(clientSessionCookieName(), token);

  const profileResult = await completeClientProfileAction({
    name: "Novo Cliente Atualizado",
    phone: "11977776666",
    birthDate: "1995-05-10",
    ...({
      id: otherId,
      clientId: otherId,
      status: "Inativo",
      portalAccess: "WAITING",
      portalApprovedById: "hacker",
      role: "Gestor",
    } as Record<string, unknown>),
  });
  expect(profileResult.success).toBe(true);

  const selfAfter = await prisma.client.findUniqueOrThrow({ where: { id: registered.id } });
  expect(selfAfter.portalAccess).toBe("APPROVED");
  expect(selfAfter.portalApprovedById).toBe("gestor-1");

  const otherAfter = await prisma.client.findUniqueOrThrow({ where: { id: otherId } });
  expect(otherAfter.portalAccess).toBe("IN_REVIEW");
  expect(otherAfter.portalApprovedAt).toBeNull();
  expect(otherAfter.portalApprovedById).toBeNull();
});
