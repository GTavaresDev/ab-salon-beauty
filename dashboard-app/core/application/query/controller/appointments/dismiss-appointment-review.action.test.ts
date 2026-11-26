import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireSessionAction: vi.fn(),
  findAppointment: vi.fn(),
  reviewUpsert: vi.fn(),
}));

vi.mock("@core/server/gateway/appointment.gateway", () => ({
  createAppointmentGateway: () => ({
    appointments: { findById: mocks.findAppointment },
    services: {}, list: {}, create: vi.fn(), updateStatus: vi.fn(), delete: vi.fn(), occupiedSlots: {},
  }),
}));
vi.mock("@core/server/db/prisma", () => ({ prisma: { appointmentReview: { upsert: mocks.reviewUpsert } } }));
vi.mock("@core/application/query/controller/users/auth.controller", () => ({ requireSessionAction: mocks.requireSessionAction }));
vi.mock("@core/server/shared/day-lock", () => ({ withDayLock: vi.fn() }));
vi.mock("@/lib/action-error-handler", () => ({ formatActionError: (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback }));

const { dismissAppointmentReviewAction } = await import("./appointment.controller");

describe("dismissAppointmentReviewAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireSessionAction.mockResolvedValue({ id: "staff-1", role: "Funcionario" });
    mocks.findAppointment.mockResolvedValue({
      id: "appointment-1", status: "Concluído", clientId: "client-1", userId: "staff-1",
    });
    mocks.reviewUpsert.mockResolvedValue({});
  });

  it("records a permanent dismissal tied to the appointment, client, and attendant", async () => {
    expect(await dismissAppointmentReviewAction("appointment-1")).toEqual({ success: true });
    expect(mocks.reviewUpsert).toHaveBeenCalledWith({
      where: { appointmentId: "appointment-1" },
      create: expect.objectContaining({
        appointmentId: "appointment-1", clientId: "client-1", attendantId: "staff-1", dismissedAt: expect.any(Date),
      }),
      update: { dismissedAt: expect.any(Date) },
    });
  });

  it.each([
    [null, "Agendamento não encontrado."],
    [{ id: "appointment-1", status: "Confirmado", clientId: "client-1", userId: "staff-1" }, "Este atendimento não pode ser dispensado"],
    [{ id: "appointment-1", status: "Concluído", clientId: null, userId: "staff-1" }, "Este atendimento não pode ser dispensado"],
  ])("rejects an ineligible appointment (%s)", async (appointment) => {
    mocks.findAppointment.mockResolvedValue(appointment);
    const result = await dismissAppointmentReviewAction("appointment-1");
    expect(result.success).toBe(false);
    expect(mocks.reviewUpsert).not.toHaveBeenCalled();
  });

  it("does not let an unrelated staff member dismiss the survey", async () => {
    mocks.findAppointment.mockResolvedValue({
      id: "appointment-1", status: "Concluído", clientId: "client-1", userId: "another-staff",
    });
    expect((await dismissAppointmentReviewAction("appointment-1")).success).toBe(false);
    expect(mocks.reviewUpsert).not.toHaveBeenCalled();
  });
});
