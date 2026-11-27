import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildUser } from "@core/server/use-case/users/test-helpers";

const { createExecute, requireSession, findById, updateExecute } = vi.hoisted(() => ({
  createExecute: vi.fn(),
  requireSession: vi.fn(),
  findById: vi.fn(),
  updateExecute: vi.fn(),
}));

vi.mock("@core/server/gateway/user.gateway", () => ({
  createUserGateway: () => ({
    users: { findById },
    create: { execute: createExecute },
    list: { execute: vi.fn() },
    update: { execute: updateExecute },
    delete: { execute: vi.fn() },
  }),
}));
vi.mock("@core/application/query/controller/users/auth.controller", () => ({
  requireSessionAction: requireSession,
}));
vi.mock("@core/server/auth/password", () => ({ hashPassword: vi.fn(async () => "hashed") }));

import { createUserAction, updateUserAction } from "./user.controller";

describe("createUserAction authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSession.mockResolvedValue({ id: "actor", role: "Gestor", permissionLevel: 2 });
    createExecute.mockImplementation(async (input) => buildUser({
      id: "created", name: input.name, email: input.email, role: input.role,
    }));
  });

  const input = (permissionLevel: unknown) => ({
    name: "Pessoa Teste",
    email: "pessoa@example.com",
    password: "Valid-Password-123!",
    permissionLevel,
  });

  it.each([0, -1, 99, "0", null, undefined, 1.5, Number.NaN])(
    "rejects invalid permission level %s before persistence",
    async (permissionLevel) => {
      const result = await createUserAction(input(permissionLevel));
      expect(result).toEqual({ success: false, error: "Operação não permitida" });
      expect(createExecute).not.toHaveBeenCalled();
    },
  );

  it("rejects a Gestor attempting to create another elevated account", async () => {
    const result = await createUserAction(input(2));
    expect(result).toEqual({ success: false, error: "Operação não permitida" });
    expect(createExecute).not.toHaveBeenCalled();
  });

  it("allows a Gestor to create Usuario", async () => {
    const result = await createUserAction(input(3));
    expect(result.success).toBe(true);
    expect(createExecute).toHaveBeenCalledWith(expect.objectContaining({
      role: "Funcionario",
      actorRole: "Gestor",
    }));
  });

  it("rejects Usuario regardless of the requested level", async () => {
    requireSession.mockResolvedValue({ id: "actor", role: "Funcionario", permissionLevel: 3 });
    const result = await createUserAction(input(3));
    expect(result).toEqual({ success: false, error: "Operação não permitida" });
    expect(createExecute).not.toHaveBeenCalled();
  });

  it("rejects an absent permission level", async () => {
    const missingLevel: Record<string, unknown> = { ...input(3) };
    delete missingLevel.permissionLevel;
    const result = await createUserAction(missingLevel);
    expect(result).toEqual({ success: false, error: "Operação não permitida" });
    expect(createExecute).not.toHaveBeenCalled();
  });
});

describe("updateUserAction report access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSession.mockResolvedValue({ id: "admin", role: "Administrador", permissionLevel: 1 });
    const manager = buildUser({ id: "target", role: "Gestor" });
    findById.mockResolvedValue(manager);
    updateExecute.mockResolvedValue(manager);
  });

  it.each([true, false])("permite que o Admin salve Ver_Relatorios como %s", async (viewReports) => {
    const result = await updateUserAction({ id: "target", viewReports });
    expect(result.success).toBe(true);
    expect(updateExecute).toHaveBeenCalledWith(expect.objectContaining({ id: "target", viewReports }));
  });

  it("rejeita alteração solicitada por Gestor", async () => {
    requireSession.mockResolvedValue({ id: "manager", role: "Gestor", permissionLevel: 2 });
    expect((await updateUserAction({ id: "target", viewReports: true })).success).toBe(false);
    expect(updateExecute).not.toHaveBeenCalled();
  });

  it("rejeita alteração em um Funcionário", async () => {
    findById.mockResolvedValue(buildUser({ id: "target", role: "Funcionario" }));
    expect((await updateUserAction({ id: "target", viewReports: true })).success).toBe(false);
    expect(updateExecute).not.toHaveBeenCalled();
  });
});
