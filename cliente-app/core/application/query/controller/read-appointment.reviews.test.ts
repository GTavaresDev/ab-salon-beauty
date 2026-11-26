import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireClientSession: vi.fn(),
  revalidatePath: vi.fn(),
  appointmentFindMany: vi.fn(),
  appointmentFindFirst: vi.fn(),
  reviewFindUnique: vi.fn(),
  reviewCreate: vi.fn(),
  reviewUpdateMany: vi.fn(),
}));

vi.mock("@/lib/client-session", () => ({ requireClientSession: mocks.requireClientSession }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@core/infrastructure/shared/client", () => ({
  prisma: {
    appointment: { findMany: mocks.appointmentFindMany, findFirst: mocks.appointmentFindFirst },
    appointmentReview: {
      findUnique: mocks.reviewFindUnique,
      create: mocks.reviewCreate,
      updateMany: mocks.reviewUpdateMany,
    },
  },
}));
vi.mock("@core/application/query/gateway/appointment.gateway", () => ({
  cancelMyAppointmentGateway: vi.fn(),
  getMyAppointmentGateway: vi.fn(),
  getMyAppointmentsGateway: vi.fn(),
}));

const { getPendingReviewsAction, submitAppointmentReviewAction } = await import("./read-appointment.controller");

const ownedAppointment = { id: "a-1", clientId: "client-1", userId: "staff-1" };

describe("appointment review actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireClientSession.mockResolvedValue({ clientId: "client-1" });
    mocks.appointmentFindFirst.mockResolvedValue(ownedAppointment);
    mocks.reviewFindUnique.mockResolvedValue(null);
    mocks.reviewCreate.mockResolvedValue({});
    mocks.reviewUpdateMany.mockResolvedValue({ count: 1 });
  });

  it("only queries completed, assigned appointments owned by the signed-in client and excludes dismissed reviews", async () => {
    mocks.appointmentFindMany.mockResolvedValue([
      { id: "a-1", date: "2026-11-26", time: "15:00", user: { name: "Mariana" } },
    ]);

    await expect(getPendingReviewsAction()).resolves.toEqual([
      { appointmentId: "a-1", date: "2026-11-26", time: "15:00", professionalName: "Mariana" },
    ]);
    expect(mocks.appointmentFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        clientId: "client-1",
        status: "Concluído",
        userId: { not: null },
        OR: [{ review: null }, { review: { is: { rating: null, dismissedAt: null } } }],
      }),
      orderBy: [{ date: "desc" }, { time: "desc" }],
    }));
  });

  it.each([0, 6, 2.5, Number.NaN])("rejects invalid rating %s before database access", async (rating) => {
    const result = await submitAppointmentReviewAction("a-1", rating);
    expect(result).toEqual({ success: false, error: "Escolha uma nota de 1 a 5." });
    expect(mocks.appointmentFindFirst).not.toHaveBeenCalled();
  });

  it("saves a valid score with the owning client, attendant, and review timestamp", async () => {
    const result = await submitAppointmentReviewAction("a-1", 5);
    expect(result).toEqual({ success: true });
    expect(mocks.reviewCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        appointmentId: "a-1", clientId: "client-1", attendantId: "staff-1", rating: 5,
        reviewedAt: expect.any(Date),
      }),
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/cliente/painel");
  });

  it("does not expose or save another client's appointment", async () => {
    mocks.appointmentFindFirst.mockResolvedValue(null);
    const result = await submitAppointmentReviewAction("someone-elses", 4);
    expect(result.success).toBe(false);
    expect(mocks.reviewCreate).not.toHaveBeenCalled();
  });

  it("does not update a dismissed review belonging to another client", async () => {
    mocks.reviewFindUnique.mockResolvedValue({ id: "review-1", clientId: "client-2", rating: null, dismissedAt: new Date() });
    const result = await submitAppointmentReviewAction("a-1", 4);
    expect(result.success).toBe(false);
    expect(mocks.reviewUpdateMany).not.toHaveBeenCalled();
  });

  it("rejects an already rated appointment", async () => {
    mocks.reviewFindUnique.mockResolvedValue({ id: "review-1", clientId: "client-1", rating: 3 });
    const result = await submitAppointmentReviewAction("a-1", 4);
    expect(result.success).toBe(false);
    expect(mocks.reviewUpdateMany).not.toHaveBeenCalled();
  });

  it("allows the owner to answer a previously dismissed survey", async () => {
    mocks.reviewFindUnique.mockResolvedValue({ id: "review-1", clientId: "client-1", rating: null, dismissedAt: new Date() });
    const result = await submitAppointmentReviewAction("a-1", 4);
    expect(result).toEqual({ success: true });
    expect(mocks.reviewUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "review-1", clientId: "client-1", rating: null },
      data: expect.objectContaining({ rating: 4, dismissedAt: null, reviewedAt: expect.any(Date) }),
    }));
  });

  it("returns a duplicate response when an update races with another submission", async () => {
    mocks.reviewFindUnique.mockResolvedValue({ id: "review-1", clientId: "client-1", rating: null, dismissedAt: new Date() });
    mocks.reviewUpdateMany.mockResolvedValue({ count: 0 });
    const result = await submitAppointmentReviewAction("a-1", 4);
    expect(result).toEqual({ success: false, error: "Este atendimento já foi avaliado." });
  });

  it("returns a duplicate response when a concurrent insert loses the unique-key race", async () => {
    let inserted = false;
    mocks.reviewCreate.mockImplementation(async () => {
      if (inserted) throw Object.assign(new Error("unique"), { code: "P2002" });
      inserted = true;
      return {};
    });
    const results = await Promise.all([
      submitAppointmentReviewAction("a-1", 5),
      submitAppointmentReviewAction("a-1", 4),
    ]);
    expect(results.filter((result) => result.success)).toHaveLength(1);
    expect(results.filter((result) => !result.success)).toHaveLength(1);
  });
});
