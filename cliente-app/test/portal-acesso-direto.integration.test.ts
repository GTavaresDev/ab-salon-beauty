import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, expect, it, vi } from "vitest";
import { prisma } from "@core/infrastructure/shared/client";
import { encodeClientSessionToken, clientSessionCookieName } from "@/lib/client-session-token";
import { getClientProfileStatusAction, completeClientProfileAction } from "@core/application/query/controller/login/login-profile.controller";
import { getMyAppointmentsController, getClientAppointmentAction } from "@core/application/query/controller/read-appointment.controller";
import { createClientAppointmentAction } from "@core/application/query/controller/create-appointment.controller";
import { getServicesController } from "@core/application/query/controller/get-services.controller";
import { getProfessionalsController } from "@core/application/query/controller/get-professionals.controller";
import { getAvailableDatesAction, getAvailableTimesAction } from "@core/application/query/controller/get-date.controller";
import ClientHomePage from "@/app/(free-acess)/cliente/painel/page";
import BookingPage from "@/app/(free-acess)/cliente/painel/agendar/page";
import MyAppointmentsPage from "@/app/(free-acess)/cliente/painel/meus-agendamentos/page";
import AppointmentDetailPage from "@/app/(free-acess)/cliente/painel/meus-agendamentos/[id]/page";

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
  notFound: () => { throw new Error("NOT_FOUND"); },
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

async function assertAllPrivatePathsBlocked() {
  await expect(ClientHomePage()).rejects.toThrow("REDIRECT:/cliente");
  await expect(BookingPage()).rejects.toThrow("REDIRECT:/cliente");
  await expect(MyAppointmentsPage()).rejects.toThrow("REDIRECT:/cliente");
  await expect(AppointmentDetailPage({ params: Promise.resolve({ id: "qualquer" }) })).rejects.toThrow("REDIRECT:/cliente");

  await expect(getClientProfileStatusAction()).rejects.toThrow("Faça login para continuar.");
  await expect(getMyAppointmentsController()).rejects.toThrow("Faça login para continuar.");
  await expect(getClientAppointmentAction("qualquer")).rejects.toThrow("Faça login para continuar.");
  await expect(getServicesController()).rejects.toThrow("Faça login para continuar.");
  await expect(getProfessionalsController()).rejects.toThrow("Faça login para continuar.");
  await expect(getAvailableDatesAction(randomUUID())).rejects.toThrow("Faça login para continuar.");
  await expect(getAvailableTimesAction(randomUUID(), "2026-12-01")).rejects.toThrow("Faça login para continuar.");

  const profileRes = await completeClientProfileAction({ name: "Teste", phone: "11999998888", birthDate: "1990-01-01" });
  expect(profileRes.success).toBe(false);

  const apptRes = await createClientAppointmentAction({
    date: "2026-12-01",
    time: "10:00",
    serviceId: randomUUID(),
    userId: randomUUID(),
  });
  expect(apptRes.success).toBe(false);
}

it("bloqueia visitante sem sessão em todas as páginas privadas e ações", async () => {
  await assertAllPrivatePathsBlocked();
});

it("bloqueia cliente em análise mesmo com cookie JWT assinado anteriormente", async () => {
  const id = randomUUID();
  const email = `${id}@example.invalid`;
  await prisma.client.create({
    data: { id, name: "Em Analise", email, phone: "11999990000", initials: "EA", status: "Ativo", portalAccess: "IN_REVIEW" },
  });
  createdIds.push(id);

  const oldToken = await encodeClientSessionToken({ clientId: id, name: "Em Analise", email, initials: "EA" });
  cookieJar.set(clientSessionCookieName(), oldToken);

  await assertAllPrivatePathsBlocked();
});

it("bloqueia cliente inativo mesmo se aprovado anteriormente com cookie válido", async () => {
  const id = randomUUID();
  const email = `${id}@example.invalid`;
  await prisma.client.create({
    data: { id, name: "Inativo", email, phone: "11999990000", initials: "IN", status: "Inativo", portalAccess: "APPROVED" },
  });
  createdIds.push(id);

  const oldToken = await encodeClientSessionToken({ clientId: id, name: "Inativo", email, initials: "IN" });
  cookieJar.set(clientSessionCookieName(), oldToken);

  await assertAllPrivatePathsBlocked();
});
