import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  allowed: true,
  updateMany: vi.fn(),
  deleteAppointments: vi.fn(),
  deleteClient: vi.fn(),
}));
vi.mock("@core/application/query/controller/users/auth.controller", () => ({ requireSessionAction: vi.fn(async () => ({ id: "admin" })) }));
vi.mock("@/lib/permissions", () => ({ canApprovePortalAccess: () => mocks.allowed }));
vi.mock("@core/server/db/prisma", () => ({ prisma: {
  $transaction: async (fn: (tx: unknown) => unknown) => fn({
    client: { updateMany: mocks.updateMany, delete: mocks.deleteClient },
    appointment: { deleteMany: mocks.deleteAppointments },
  }),
} }));
import { rejectPortalClient } from "@core/application/query/controller/clients/portal-approval.controller";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.allowed = true;
  mocks.updateMany.mockResolvedValue({ count: 1 });
});
it("nega recusa sem permissão e não toca nos dados", async () => {
  mocks.allowed = false;
  expect((await rejectPortalClient("client")).success).toBe(false);
  expect(mocks.updateMany).not.toHaveBeenCalled();
});
it("não exclui cliente aprovado, inexistente ou fora de análise", async () => {
  mocks.updateMany.mockResolvedValue({ count: 0 });
  expect((await rejectPortalClient("client")).success).toBe(false);
  expect(mocks.deleteAppointments).not.toHaveBeenCalled();
  expect(mocks.deleteClient).not.toHaveBeenCalled();
});
it("exclui os vínculos e o cadastro apenas após validar e bloquear o pendente", async () => {
  expect(await rejectPortalClient("client")).toEqual({ success: true });
  expect(mocks.updateMany).toHaveBeenCalledWith({ where: { id: "client", status: "Ativo", portalAccess: "IN_REVIEW" }, data: { portalAccess: "IN_REVIEW" } });
  expect(mocks.deleteAppointments).toHaveBeenCalledWith({ where: { clientId: "client" } });
  expect(mocks.deleteClient).toHaveBeenCalledWith({ where: { id: "client" } });
  expect(mocks.deleteAppointments.mock.invocationCallOrder[0]).toBeLessThan(mocks.deleteClient.mock.invocationCallOrder[0]);
});
it("rejeita identificador vazio", async () => {
  expect((await rejectPortalClient(" ")).success).toBe(false);
  expect(mocks.updateMany).not.toHaveBeenCalled();
});
