// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import type { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { dismissPendingNotification } from "../lib/pending-notification-storage";
import { useDashboardView } from "./use-dashboard-view";

const { useAppointments } = vi.hoisted(() => ({ useAppointments: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/stores/app-shell.store", () => ({ useAppShell: () => ({}) }));
vi.mock("@/app/(agendamentos)/(left-nav-bar)/agenda/hooks/use-appointments", () => ({ useAppointments }));
vi.mock("@/app/(agendamentos)/(left-nav-bar)/clientes/hooks/use-clients", () => ({
  useClients: () => ({ clientList: [] }),
}));
vi.mock("@/app/(agendamentos)/(left-nav-bar)/servicos/hooks/use-services", () => ({
  useServices: () => ({ serviceList: [] }),
}));

const pending: AppointmentProps = {
  id: "a-1", date: "2099-11-26", time: "15:00", name: "Cliente", service: "Consulta",
  duration: "30 min", status: "Pendente", initials: "C", channelId: "site",
};

beforeEach(() => {
  window.sessionStorage.clear();
  useAppointments.mockReturnValue({ appointmentList: [] });
});

it("abre ao receber um agendamento em espera, mesmo com alerta dispensado na sessão", () => {
  dismissPendingNotification();
  const dashboard = renderHook(useDashboardView);
  expect(dashboard.result.current.isPendingModalOpen).toBe(false);

  useAppointments.mockReturnValue({ appointmentList: [pending] });
  dashboard.rerender();

  expect(dashboard.result.current.isPendingModalOpen).toBe(true);
});

it.each(["handleClosePendingModal", "handleReviewPending"] as const)(
  "fecha durante a visita após %s e reabre ao voltar ao dashboard",
  (dismiss) => {
    useAppointments.mockReturnValue({ appointmentList: [pending] });
    const dashboard = renderHook(useDashboardView);

    act(() => dashboard.result.current[dismiss]());
    dashboard.rerender();
    expect(dashboard.result.current.isPendingModalOpen).toBe(false);
    expect(dashboard.result.current.onlyPending).toBe(dismiss === "handleReviewPending");
    dashboard.unmount();

    expect(renderHook(useDashboardView).result.current.isPendingModalOpen).toBe(true);
  },
);

it("mantém o alerta fechado quando o último agendamento sai da espera", () => {
  useAppointments.mockReturnValue({ appointmentList: [pending] });
  const dashboard = renderHook(useDashboardView);
  expect(dashboard.result.current.isPendingModalOpen).toBe(true);

  useAppointments.mockReturnValue({ appointmentList: [{ ...pending, status: "Confirmado" }] });
  dashboard.rerender();

  expect(dashboard.result.current.isPendingModalOpen).toBe(false);
});
