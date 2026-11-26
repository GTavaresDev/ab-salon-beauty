import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, expect, it, vi } from "vitest";
import { hashPassword } from "@core/domain/auth/infrastructure/auth/password";
import { prisma } from "@core/infrastructure/shared/client";
import { loginClientAction } from "@core/application/query/controller/login/login.controller";
import { ResolveOAuthClientAccount, GOOGLE_PROVIDER } from "@core/application/use-cases/login/google-account-link.usecase";
import { PrismaClientOAuthAccountRepository } from "@core/domain/auth/infrastructure/persistence/prisma/login/prisma-client-oauth-account.repository";
import { PrismaClientRepository } from "@core/domain/auth/infrastructure/persistence/prisma/login/prisma-client.repository";
import { admitVerifiedClient, pendingMessage } from "@/lib/portal-access";
import { portalOAuthErrorMessage } from "@/app/(free-acess)/_components/portal-oauth-error/portal-oauth-error";

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

async function createClientFixture(overrides: {
  password?: string | null;
  status?: string;
  portalAccess?: "WAITING" | "IN_REVIEW" | "APPROVED";
} = {}) {
  const id = randomUUID();
  const email = `${id}@example.invalid`;
  const hashed = overrides.password ? await hashPassword(overrides.password) : null;
  await prisma.client.create({
    data: {
      id,
      name: "Cliente Ficticio",
      email,
      phone: "11999990000",
      initials: "CF",
      password: hashed,
      status: overrides.status ?? "Ativo",
      portalAccess: overrides.portalAccess ?? "WAITING",
    },
  });
  createdIds.push(id);
  return { id, email };
}

beforeEach(() => {
  process.env.AUTH_SECRET = "test-secret-key-at-least-32-chars-long";
  cookieJar.clear();
});

afterAll(async () => {
  try { await prisma.client.deleteMany({ where: { id: { in: createdIds } } }); }
  finally { await prisma.$disconnect(); }
});

it("credenciais inválidas não iniciam a análise nem revelam o estado", async () => {
  const waiting = await createClientFixture({ password: "SenhaValida123", portalAccess: "WAITING" });
  const inReview = await createClientFixture({ password: "SenhaValida123", portalAccess: "IN_REVIEW" });

  const r1 = await loginClientAction({ email: waiting.email, password: "SenhaErrada" });
  const r2 = await loginClientAction({ email: inReview.email, password: "SenhaErrada" });
  const r3 = await loginClientAction({ email: "nao-existe@example.invalid", password: "SenhaErrada" });

  expect(r1).toEqual({ success: false, error: "E-mail ou senha inválidos." });
  expect(r2).toEqual({ success: false, error: "E-mail ou senha inválidos." });
  expect(r3).toEqual({ success: false, error: "E-mail ou senha inválidos." });
  expect(cookieJar.size).toBe(0);

  const dbWaiting = await prisma.client.findUniqueOrThrow({ where: { id: waiting.id } });
  expect(dbWaiting.portalAccess).toBe("WAITING");
});

it("primeiro login com senha válida coloca em análise, exibe mensagem e não emite sessão", async () => {
  const { id, email } = await createClientFixture({ password: "SenhaValida123", portalAccess: "WAITING" });

  const first = await loginClientAction({ email, password: "SenhaValida123" });
  expect(first).toEqual({ success: false, error: pendingMessage });
  expect(first.error).toBe("Seu cadastro foi concluído com sucesso e está em análise! Assim que ele for aprovado, seu acesso ao sistema será liberado.");
  expect(cookieJar.size).toBe(0);

  const afterFirst = await prisma.client.findUniqueOrThrow({ where: { id } });
  expect(afterFirst.portalAccess).toBe("IN_REVIEW");

  // Tentativa repetida mantém uma única solicitação em análise e não emite sessão
  const second = await loginClientAction({ email, password: "SenhaValida123" });
  expect(second).toEqual({ success: false, error: "Seu cadastro foi concluído com sucesso e está em análise! Assim que ele for aprovado, seu acesso ao sistema será liberado." });
  expect(cookieJar.size).toBe(0);

  const afterSecond = await prisma.client.findUniqueOrThrow({ where: { id } });
  expect(afterSecond.portalAccess).toBe("IN_REVIEW");
});

it("Google verificado coloca novo cliente em análise e Google não verificado não altera cadastro", async () => {
  const resolveAccount = new ResolveOAuthClientAccount(
    new PrismaClientRepository(),
    new PrismaClientOAuthAccountRepository(),
    { findByEmail: (email) => prisma.user.findUnique({ where: { email }, select: { id: true } }) },
  );

  const unverifiedEmail = `${randomUUID()}@example.invalid`;
  await expect(
    resolveAccount.execute({
      provider: GOOGLE_PROVIDER,
      providerAccountId: randomUUID(),
      email: unverifiedEmail,
      emailVerified: false,
      name: "Google Nao Verificado",
    }),
  ).rejects.toThrow();

  expect(await prisma.client.findUnique({ where: { email: unverifiedEmail } })).toBeNull();

  const googleEmail = `${randomUUID()}@example.invalid`;
  const resolved = await resolveAccount.execute({
    provider: GOOGLE_PROVIDER,
    providerAccountId: randomUUID(),
    email: googleEmail,
    emailVerified: true,
    name: "Google Verificado",
  });
  createdIds.push(resolved.id);

  const created = await prisma.client.findUniqueOrThrow({ where: { id: resolved.id } });
  expect(created.portalAccess).toBe("WAITING");

  const admitted = await admitVerifiedClient(resolved.id);
  expect(admitted).toBe(false);
  expect(portalOAuthErrorMessage("acesso")).toBe("Seu cadastro foi concluído com sucesso e está em análise! Assim que ele for aprovado, seu acesso ao sistema será liberado.");

  const inReview = await prisma.client.findUniqueOrThrow({ where: { id: resolved.id } });
  expect(inReview.portalAccess).toBe("IN_REVIEW");
});

it("cliente inativo com senha válida continua bloqueado e não entra em análise", async () => {
  const { id, email } = await createClientFixture({
    password: "SenhaValida123",
    status: "Inativo",
    portalAccess: "WAITING",
  });

  const result = await loginClientAction({ email, password: "SenhaValida123" });
  expect(result.success).toBe(false);
  expect(cookieJar.size).toBe(0);

  const dbClient = await prisma.client.findUniqueOrThrow({ where: { id } });
  expect(dbClient.portalAccess).toBe("WAITING");
});
