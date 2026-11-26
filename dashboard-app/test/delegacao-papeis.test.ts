import { beforeEach, describe, expect, it, vi } from "vitest";
import { validatePermissionGrant } from "@core/server/rule/permission-validation.business-rule";
import { updateUserPermissionsAction } from "@core/application/query/controller/users/permission.controller";
import { updateUserAction } from "@core/application/query/controller/users/user.controller";

const mocks = vi.hoisted(() => ({
  findById: vi.fn(),
  findUserPermissions: vi.fn(),
  grantPermission: vi.fn(),
  revokePermission: vi.fn(),
  update: vi.fn(),
}));
vi.mock("@core/application/query/controller/users/auth.controller", () => ({
  requireSessionAction: async () => ({ id: "admin", role: "Administrador", permissionLevel: 1 }),
}));
vi.mock("@core/server/gateway/user.gateway", () => ({
  createUserGateway: () => ({
    users: { findById: mocks.findById }, permissions: mocks, update: { execute: mocks.update },
  }),
}));

describe("Delegação de papéis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findById.mockImplementation(async (id: string) => ({
      id, role: id === "admin" ? "Administrador" : "Funcionario",
    }));
    mocks.findUserPermissions.mockResolvedValue([{ name: "Usuario", toJSON: () => ({ name: "Usuario" }) }]);
  });

  it.each(["Dono", "Product Manegar", "Administrador", "Gestor", "Funcionario", "Usuario"])(
    "reserva o identificador %s na regra de delegação individual", (name) => {
      expect(() => validatePermissionGrant({ role: "Administrador" }, "Funcionario", name)).toThrow(/papéis/i);
    },
  );

  it("rejeita um lote com papel superior antes de qualquer gravação", async () => {
    const result = await updateUserPermissionsAction({ userId: "destino", permissionNames: ["consulta", " Dono "] });
    expect(result.success).toBe(false);
    expect(mocks.grantPermission).not.toHaveBeenCalled();
    expect(mocks.revokePermission).not.toHaveBeenCalled();
  });

  it("concede permissão comum e preserva o papel omitido do lote", async () => {
    const result = await updateUserPermissionsAction({ userId: "destino", permissionNames: ["consulta"] });
    expect(result.success).toBe(true);
    expect(mocks.grantPermission).toHaveBeenCalledWith("destino", "consulta");
    expect(mocks.revokePermission).not.toHaveBeenCalled();
  });

  it("rejeita promoção acima do próprio papel também na edição do perfil", async () => {
    expect((await updateUserAction({ id: "destino", role: "Dono" })).success).toBe(false);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
