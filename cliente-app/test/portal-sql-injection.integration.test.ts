import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, expect, it, vi } from "vitest";
import { prisma } from "@core/infrastructure/shared/client";
import { loginClientAction } from "@core/application/query/controller/login/login.controller";
import { completeClientProfileAction } from "@core/application/query/controller/login/login-profile.controller";
import { encodeClientSessionToken, clientSessionCookieName } from "@/lib/client-session-token";
import { hasPortalAccess, admitVerifiedClient } from "@/lib/portal-access";

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

vi.mock("next/navigation", () => ({
  redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); },
}));

vi.mock("next-auth", () => ({
  default: () => ({ handlers: {}, signIn: vi.fn() }),
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

it("parametriza entradas com sintaxe SQL em id, e-mail e perfil sem aprovar ou expor terceiros", async () => {
  const victimId = randomUUID();
  const victimEmail = `${victimId}@example.invalid`;
  const attackerId = randomUUID();
  const attackerEmail = `${attackerId}@example.invalid`;

  await prisma.client.createMany({
    data: [
      { id: victimId, name: "Vitima", email: victimEmail, phone: "11911112222", initials: "VI", status: "Ativo", portalAccess: "WAITING" },
      { id: attackerId, name: "Atacante", email: attackerEmail, phone: "11933334444", initials: "AT", status: "Ativo", portalAccess: "APPROVED" },
    ],
  });
  createdIds.push(victimId, attackerId);

  const sqlPayloads = [
    "' OR '1'='1",
    "'; UPDATE \"Clients\" SET \"portalAccess\" = 'APPROVED'; --",
    "x' UNION SELECT id, email FROM \"Clients\" --",
  ];

  for (const payload of sqlPayloads) {
    expect(await hasPortalAccess(payload)).toBe(false);
    expect(await admitVerifiedClient(payload)).toBe(false);

    const loginRes = await loginClientAction({ email: payload, password: "qualquer-senha" });
    expect(loginRes).toEqual({ success: false, error: "E-mail ou senha inválidos." });
  }

  const token = await encodeClientSessionToken({
    clientId: attackerId,
    name: "Atacante",
    email: attackerEmail,
    initials: "AT",
  });
  cookieJar.set(clientSessionCookieName(), token);

  const profileRes = await completeClientProfileAction({
    name: "Nome '; UPDATE \"Clients\" SET \"portalAccess\" = 'APPROVED'; --",
    phone: "11933334444",
    birthDate: "1990-01-01",
  });
  expect(profileRes.success).toBe(true);

  const victimAfter = await prisma.client.findUniqueOrThrow({ where: { id: victimId } });
  expect(victimAfter.portalAccess).toBe("WAITING");
  expect(victimAfter.portalApprovedAt).toBeNull();
  expect(victimAfter.portalApprovedById).toBeNull();
});
