// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppointmentProps } from "@core/application/query/interface/appointment.entity";

const mocks = vi.hoisted(() => ({
  fetchAppointments: vi.fn(),
  createAppointment: vi.fn(),
  updateStatus: vi.fn(),
  deleteAppointment: vi.fn(),
  dismissReview: vi.fn(),
  showToast: vi.fn(),
  openCancellation: vi.fn(),
  openConfirmation: vi.fn(),
  currentUser: { id: "staff-1", role: "Funcionario" },
}));
vi.mock("@core/application/query/controller/appointments/appointment.controller", () => ({
  createAppointmentAction: mocks.createAppointment,
  deleteAppointmentAction: mocks.deleteAppointment,
  fetchAppointmentsAction: mocks.fetchAppointments,
  updateAppointmentStatusAction: mocks.updateStatus,
  dismissAppointmentReviewAction: mocks.dismissReview,
}));
vi.mock("@/stores/app-shell.store", () => ({
  useAppShell: () => ({ currentUser: mocks.currentUser, showToast: mocks.showToast }),
}));
vi.mock("@/lib/whatsapp-helper", () => ({ openWhatsAppCancellation: mocks.openCancellation, openWhatsAppConfirmation: mocks.openConfirmation }));

const { useAppointmentsState } = await import("./use-appointments");

const appointment: AppointmentProps = {
  id: "a-1", date: "2026-11-26", time: "15:00", name: "Gabriel Tavares", service: "Consulta",
  duration: "30 min", status: "Confirmado", initials: "GT", channelId: "site",
  clientId: "client-1", userId: "staff-1", userName: "Mariana Costa", clientPhone: "5562999999999",
};
const pendingAppointment: AppointmentProps = { ...appointment, id: "a-2", status: "Pendente" };

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("useAppointmentsState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("polls for new pending appointments and only notifies once per new request", async () => {
    vi.useFakeTimers();
    mocks.fetchAppointments
      .mockResolvedValueOnce([appointment])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([pendingAppointment])
      .mockResolvedValue([pendingAppointment]);
    const { result, unmount } = renderHook(() => useAppointmentsState());
    await flushPromises();

    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(mocks.fetchAppointments).toHaveBeenCalledWith({ status: "Pendente" });
    expect(result.current.appointmentList).toContainEqual(pendingAppointment);
    expect(mocks.showToast).toHaveBeenCalledWith("Novo agendamento solicitado por Gabriel Tavares.");

    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(mocks.showToast).toHaveBeenCalledTimes(1);
    unmount();
    vi.useRealTimers();
  });

  it("opens the payment dialog before persisting completion, then updates the appointment and suggests the survey", async () => {
    mocks.fetchAppointments.mockResolvedValueOnce([appointment]).mockResolvedValueOnce([]);
    mocks.updateStatus.mockResolvedValue({
      success: true,
      data: { ...appointment, status: "Concluído", paymentMethod: "Pix", commissionPercent: 25 },
    });
    mocks.dismissReview.mockResolvedValue({ success: true });
    const { result, unmount } = renderHook(() => useAppointmentsState());
    await flushPromises();

    await act(async () => { await result.current.handleAppointmentStatusChange("a-1", "Concluído"); });
    expect(result.current.paymentAppointment?.id).toBe("a-1");
    expect(mocks.updateStatus).not.toHaveBeenCalled();

    let saved = false;
    await act(async () => { saved = await result.current.submitAppointmentPaymentMethod("Pix"); });
    expect(saved).toBe(true);
    expect(mocks.updateStatus).toHaveBeenCalledWith("a-1", "Concluído", "Pix");
    expect(result.current.appointmentList[0]).toMatchObject({ status: "Concluído", paymentMethod: "Pix" });
    expect(result.current.surveySuggestion).toMatchObject({ id: "a-1", status: "Concluído" });
    let dismissed = false;
    await act(async () => { dismissed = await result.current.dismissSurveySuggestion(); });
    expect(dismissed).toBe(true);
    expect(mocks.dismissReview).toHaveBeenCalledWith("a-1");
    expect(result.current.surveySuggestion).toBeNull();
    unmount();
  });

  it("leaves the payment dialog open and status unchanged when completion fails", async () => {
    mocks.fetchAppointments.mockResolvedValueOnce([appointment]).mockResolvedValueOnce([]);
    mocks.updateStatus.mockResolvedValue({ success: false, error: "Erro temporário" });
    const { result, unmount } = renderHook(() => useAppointmentsState());
    await flushPromises();
    await act(async () => { await result.current.handleAppointmentStatusChange("a-1", "Concluído"); });

    let saved = true;
    await act(async () => { saved = await result.current.submitAppointmentPaymentMethod("Pix"); });
    expect(saved).toBe(false);
    expect(result.current.paymentAppointment?.id).toBe("a-1");
    expect(result.current.appointmentList[0].status).toBe("Confirmado");
    unmount();
  });

  it("opens a WhatsApp cancellation message when a completed appointment is cancelled", async () => {
    const completedAppointment = { ...appointment, status: "Concluído" as const };
    mocks.fetchAppointments.mockResolvedValueOnce([completedAppointment]).mockResolvedValueOnce([]);
    mocks.updateStatus.mockResolvedValue({ success: true, data: { ...completedAppointment, status: "Cancelado" } });
    const { result, unmount } = renderHook(() => useAppointmentsState());
    await flushPromises();

    await act(async () => { await result.current.handleAppointmentStatusChange("a-1", "Cancelado"); });

    expect(mocks.openCancellation).toHaveBeenCalledWith({
      phone: completedAppointment.clientPhone,
      clientName: completedAppointment.name,
      date: completedAppointment.date,
      time: completedAppointment.time,
      professionalName: completedAppointment.userName,
      serviceName: completedAppointment.service,
    });
    expect(result.current.appointmentList[0].status).toBe("Cancelado");
    unmount();
  });

  it("does not suggest a survey for a completed appointment without a linked client or attendant", async () => {
    const withoutClient = { ...appointment, clientId: undefined };
    mocks.fetchAppointments.mockResolvedValueOnce([withoutClient]).mockResolvedValueOnce([]);
    mocks.updateStatus.mockResolvedValue({ success: true, data: { ...withoutClient, status: "Concluído" } });
    const { result, unmount } = renderHook(() => useAppointmentsState());
    await flushPromises();
    await act(async () => { await result.current.handleAppointmentStatusChange("a-1", "Concluído"); });
    await act(async () => { await result.current.submitAppointmentPaymentMethod("Pix"); });

    expect(result.current.surveySuggestion).toBeNull();
    unmount();
  });
});
