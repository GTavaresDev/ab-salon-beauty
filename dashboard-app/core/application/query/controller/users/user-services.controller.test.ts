import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireSession, findUser, findService, findServices, updateUser, queryRaw } = vi.hoisted(() => ({
  requireSession: vi.fn(),
  findUser: vi.fn(),
  findService: vi.fn(),
  findServices: vi.fn(),
  updateUser: vi.fn(),
  queryRaw: vi.fn(),
}));

vi.mock("./auth.controller", () => ({ requireSessionAction: requireSession }));
vi.mock("@core/server/db/prisma", () => ({ prisma: {
  user: { findUnique: findUser, update: updateUser },
  service: { findUnique: findService, findMany: findServices },
  $queryRaw: queryRaw,
} }));

import { replaceUserServicesAction, setUserServiceAction } from "./user-services.controller";

const userId = "funcionario-1";
const serviceId = "srv-1";

describe("setUserServiceAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSession.mockResolvedValue({ role: "Gestor" });
    findUser.mockResolvedValue({ permissions: [{ name: "Usuario", enabled: true }] });
    findService.mockResolvedValue({ id: serviceId });
    findServices.mockResolvedValue([{ id: serviceId }]);
    updateUser.mockResolvedValue({ serviceIds: [serviceId] });
    queryRaw.mockResolvedValue([{ serviceIds: [serviceId] }]);
  });

  it("blocks employees before reading or writing assignments", async () => {
    requireSession.mockResolvedValue({ role: "Funcionario" });
    expect(await setUserServiceAction({ userId, serviceId, assigned: true })).toMatchObject({ success: false });
    expect(findUser).not.toHaveBeenCalled();
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("rejects a service id that does not exist", async () => {
    findService.mockResolvedValue(null);
    expect(await setUserServiceAction({ userId, serviceId, assigned: true })).toMatchObject({ success: false });
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("assigns a valid service to a staff member", async () => {
    expect(await setUserServiceAction({ userId, serviceId, assigned: true })).toEqual({ success: true, data: [serviceId] });
    expect(queryRaw).toHaveBeenCalledOnce();
  });

  it("replaces the complete assignment list for an administrator", async () => {
    requireSession.mockResolvedValue({ role: "Administrador" });
    expect(await replaceUserServicesAction({ userId, serviceIds: [serviceId] }))
      .toEqual({ success: true, data: [serviceId] });
    expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ data: { serviceIds: [serviceId] } }));
  });

  it("rejects unknown ids before replacing assignments", async () => {
    findServices.mockResolvedValue([]);
    expect(await replaceUserServicesAction({ userId, serviceIds: [serviceId] })).toMatchObject({ success: false });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("rejects empty ids", async () => {
    expect(await replaceUserServicesAction({ userId, serviceIds: [""] })).toMatchObject({ success: false });
    expect(findUser).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
  });

});
