import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSaleAction, deleteSaleAction, updateSaleAction } from "@core/application/query/controller/sales/sale.controller";
import { createServiceAction, deleteServiceAction, fetchServicesAction, updateServiceAction } from "@core/application/query/controller/services/service.controller";

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  findUser: vi.fn(),
  verifyPassword: vi.fn(),
  createSale: vi.fn(),
  updateSale: vi.fn(),
  deleteSale: vi.fn(),
  listServices: vi.fn(),
  createService: vi.fn(),
  updateService: vi.fn(),
  deleteService: vi.fn(),
}));

vi.mock("@core/application/query/controller/users/auth.controller", () => ({
  requireSessionAction: mocks.session,
}));
vi.mock("@core/server/db/repository/users/prisma-user.repository", () => ({
  PrismaUserRepository: class { findById = mocks.findUser; },
}));
vi.mock("@core/server/auth/password", () => ({ verifyPassword: mocks.verifyPassword }));
vi.mock("@core/server/gateway/sale.gateway", () => ({
  createSaleGateway: () => ({
    create: { execute: mocks.createSale },
    update: { execute: mocks.updateSale },
    delete: { execute: mocks.deleteSale },
  }),
}));
vi.mock("@core/server/gateway/service.gateway", () => ({
  createServiceGateway: () => ({
    list: { execute: mocks.listServices },
    create: { execute: mocks.createService },
    update: { execute: mocks.updateService },
    delete: { execute: mocks.deleteService },
  }),
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  const record = { toJSON: () => ({ id: "record" }) };
  mocks.createSale.mockResolvedValue(record);
  mocks.updateSale.mockResolvedValue(record);
  mocks.listServices.mockResolvedValue([record]);
  mocks.createService.mockResolvedValue(record);
  mocks.updateService.mockResolvedValue(record);
});

describe("autorizações de vendas", () => {
  const confirmation = { id: "sale", password: "senha-de-teste" };

  it.each([
    { role: "Funcionario" },
    { role: "Gestor" },
    { role: "Administrador", impersonating: true },
  ])("reserva edição e exclusão à conta administrativa efetiva (%o)", async (actor) => {
    mocks.session.mockResolvedValue({ id: "actor", ...actor });

    expect((await updateSaleAction({ ...confirmation, quantity: 2 })).success).toBe(false);
    expect((await deleteSaleAction(confirmation)).success).toBe(false);
    expect(mocks.findUser).not.toHaveBeenCalled();
    expect(mocks.updateSale).not.toHaveBeenCalled();
    expect(mocks.deleteSale).not.toHaveBeenCalled();
  });

  it("confirma as duas operações com a senha do Admin autenticado", async () => {
    mocks.session.mockResolvedValue({ id: "actor", role: "Administrador" });
    mocks.findUser.mockResolvedValue({ role: "Administrador", status: "Ativo", password: "hash-do-ator" });
    mocks.verifyPassword.mockResolvedValueOnce(false).mockResolvedValue(true);

    expect((await deleteSaleAction(confirmation)).success).toBe(false);
    expect(mocks.deleteSale).not.toHaveBeenCalled();

    expect((await updateSaleAction({ ...confirmation, quantity: 2 })).success).toBe(true);
    expect((await deleteSaleAction(confirmation)).success).toBe(true);
    expect(mocks.findUser).toHaveBeenCalledWith("actor");
    expect(mocks.verifyPassword).toHaveBeenCalledWith(confirmation.password, "hash-do-ator");
    expect(mocks.updateSale).toHaveBeenCalledWith(expect.objectContaining({ id: "sale", quantity: 2 }));
    expect(mocks.deleteSale).toHaveBeenCalledWith("sale");
  });

  it("mantém a criação de vendas pelo funcionário autenticado", async () => {
    mocks.session.mockResolvedValue({ id: "actor", role: "Funcionario" });
    const result = await createSaleAction({ productId: "product", quantity: 1, paymentMethod: "Pix" });

    expect(result.success).toBe(true);
    expect(mocks.createSale).toHaveBeenCalledWith(expect.objectContaining({ createdById: "actor" }));
  });
});

describe("autorizações de serviços", () => {
  it("mantém a leitura pelo funcionário e reserva as mutações aos gestores do catálogo", async () => {
    mocks.session.mockResolvedValue({ role: "Funcionario" });
    expect(await fetchServicesAction()).toEqual([{ id: "record" }]);
    expect((await createServiceAction({ name: "Serviço", duration: 30 })).success).toBe(false);
    expect((await updateServiceAction({ id: "service", price: 15 })).success).toBe(false);
    expect((await deleteServiceAction("service")).success).toBe(false);
    expect(mocks.createService).not.toHaveBeenCalled();
    expect(mocks.updateService).not.toHaveBeenCalled();
    expect(mocks.deleteService).not.toHaveBeenCalled();
  });

  it.each(["Administrador", "Gestor"])("permite gerenciar o catálogo como %s", async (role) => {
    mocks.session.mockResolvedValue({ role });
    expect((await createServiceAction({ name: "Serviço", duration: 30 })).success).toBe(true);
    expect((await updateServiceAction({ id: "service", price: 15 })).success).toBe(true);
    expect((await deleteServiceAction("service")).success).toBe(true);
  });
});
