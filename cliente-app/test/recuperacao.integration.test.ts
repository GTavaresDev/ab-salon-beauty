import { randomUUID } from "node:crypto";
import { afterAll, expect, it, vi } from "vitest";
import { createLoginFactory } from "@core/domain/auth/login.factory";
import { verifyPassword } from "@core/domain/auth/infrastructure/auth/password";
import { prisma } from "@core/infrastructure/shared/client";

vi.mock("@core/infrastructure/shared/client", async () => {
  const { PrismaClient } = await import("@prisma/client");
  const url = new URL(process.env.TEST_DATABASE_URL ?? "about:blank");
  if (url.protocol !== "postgresql:" || url.hostname !== "127.0.0.1" ||
      url.pathname !== "/salon_fixture_test" || url.search || url.hash) throw new Error("Banco local de teste obrigatório.");
  return { prisma: new PrismaClient({ datasourceUrl: url.href }) };
});

const auth = createLoginFactory();
const ids: string[] = [];
async function fixture() {
  const id = randomUUID();
  const email = id + "@example.invalid";
  await prisma.client.create({ data: { id, email, name: "Cliente fictício", phone: "00000000000", initials: "CF" } });
  ids.push(id);
  return { id, email };
}

afterAll(async () => {
  try { await prisma.client.deleteMany({ where: { id: { in: ids } } }); }
  finally { await prisma.$disconnect(); }
});

it("limita emissões concorrentes por conta e permite apenas uma definição de senha pelos links enviados", async () => {
  const { id, email } = await fixture();
  const mailbox: string[] = [];
  const issue = auth.requestPasswordReset(async (message) => {
    expect(message.to).toBe(email);
    mailbox.push(new URL(message.resetUrl).searchParams.get("token")!);
  });
  await Promise.all(Array.from({ length: 5 }, () => issue.execute(email, "https://example.invalid", "origem-a")));
  expect(mailbox).toHaveLength(3);
  expect((await prisma.client.findUniqueOrThrow({ where: { id } })).password).toBeNull();
  const attempts = [mailbox[0], mailbox[0], mailbox[1]];
  const results = await Promise.allSettled(attempts.map((token, i) => auth.resetPassword.execute(token, "senha-ficticia-" + i)));
  expect(results.filter(r => r.status === "fulfilled")).toHaveLength(1);
  const winner = results.findIndex(r => r.status === "fulfilled");
  const account = await prisma.client.findUniqueOrThrow({ where: { id } });
  expect(await verifyPassword("senha-ficticia-" + winner, account.password!)).toBe(true);
  expect(await prisma.clientPasswordResetToken.count({ where: { clientId: id, usedAt: null } })).toBe(0);
});

it("limita emissões da mesma origem entre contas e não envia link para conta exclusiva do Google", async () => {
  const send = vi.fn(async () => {});
  const issue = auth.requestPasswordReset(send);
  const origin = randomUUID();
  for (let index = 0; index < 21; index++) {
    const { email } = await fixture();
    await issue.execute(email, "https://example.invalid", origin);
  }
  expect(send).toHaveBeenCalledTimes(20);
  const google = await fixture();
  await prisma.clientOAuthAccount.create({ data: { clientId: google.id, provider: "google", providerAccountId: randomUUID() } });
  await issue.execute(google.email, "https://example.invalid", randomUUID());
  expect(send).toHaveBeenCalledTimes(20);
});

it("rejeita o link após mudança do e-mail cadastrado", async () => {
  const account = await fixture();
  let token = "";
  await auth.requestPasswordReset(async message => {
    token = new URL(message.resetUrl).searchParams.get("token")!;
  }).execute(account.email, "https://example.invalid", randomUUID());
  await prisma.client.update({ where: { id: account.id }, data: { email: randomUUID() + "@example.invalid" } });
  await expect(auth.resetPassword.execute(token, "senha-ficticia")).rejects.toThrow(/inválido/);
  expect((await prisma.client.findUniqueOrThrow({ where: { id: account.id } })).password).toBeNull();
});
