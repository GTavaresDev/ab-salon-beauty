import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAppointmentGateway: vi.fn(),
  getAvailableTimesGateway: vi.fn(),
  getBookableServicesGateway: vi.fn(),
  getBookableProfessionalsGateway: vi.fn(),
  requireClientSession: vi.fn(),
}));

vi.mock("@core/domain/auth/login.factory", () => ({
  createLoginFactory: () => ({
    availability: { listTimes: vi.fn().mockResolvedValue(["09:00"]) },
  }),
}));

vi.mock("@core/application/query/gateway/appointment.gateway", () => ({
  createAppointmentGateway: mocks.createAppointmentGateway,
}));

vi.mock("@core/application/query/gateway/date.gateway", () => ({
  getAvailableTimesGateway: mocks.getAvailableTimesGateway,
}));

vi.mock("@core/application/query/gateway/service.gateway", () => ({
  getBookableServicesGateway: mocks.getBookableServicesGateway,
}));

vi.mock("@core/application/query/gateway/professional.gateway", () => ({
  getBookableProfessionalsGateway: mocks.getBookableProfessionalsGateway,
}));

vi.mock("@/lib/client-session", () => ({
  requireClientSession: mocks.requireClientSession,
}));

import { createClientAppointmentAction } from "./create-appointment.controller";

describe("createClientAppointmentAction security boundary", () => {
  beforeEach(() => {
    mocks.getAvailableTimesGateway.mockResolvedValue({ tag: "right", value: ["09:00"] });
    vi.clearAllMocks();
    mocks.requireClientSession.mockResolvedValue({ clientId: "session-client", name: "Cliente" });
    mocks.createAppointmentGateway.mockResolvedValue({ tag: "right", value: { id: "appointment-1" } });
    mocks.getBookableServicesGateway.mockResolvedValue({
      tag: "right",
      value: [{ id: "service-1", name: "Consulta", description: "", durationMinutes: 30 }],
    });
    mocks.getBookableProfessionalsGateway.mockResolvedValue({
      tag: "right",
      value: [{ id: "professional-1", name: "Profissional", initials: "PR" }],
    });
  });

  it("uses the authenticated client ID and ignores an injected clientId", async () => {
    const result = await createClientAppointmentAction({
      serviceId: "service-1",
      professionalId: "professional-1",
      date: "2030-01-02",
      time: "09:00",
      clientId: "attacker-client",
    } as Parameters<typeof createClientAppointmentAction>[0]);

    expect(result.success).toBe(true);
    expect(mocks.createAppointmentGateway).toHaveBeenCalledWith("session-client", expect.objectContaining({
      serviceId: "service-1",
      service: "Consulta",
    }));
  });

  it("rejects malformed booking input before entering the day lock", async () => {
    const result = await createClientAppointmentAction({
      serviceId: "",
      professionalId: "professional-1",
      date: "2030-02-31",
      time: "9:00",
    });

    expect(result).toEqual({ success: false, error: "Dados do agendamento inválidos." });
    expect(mocks.createAppointmentGateway).not.toHaveBeenCalled();
  });

  it("does not reserve a time when there is no authenticated client session", async () => {
    mocks.requireClientSession.mockRejectedValue(new Error("Não autenticado"));

    const result = await createClientAppointmentAction({
      serviceId: "service-1",
      professionalId: "professional-1",
      date: "2030-01-02",
      time: "09:00",
    });

    expect(result.success).toBe(false);
    expect(mocks.createAppointmentGateway).not.toHaveBeenCalled();
  });
});
