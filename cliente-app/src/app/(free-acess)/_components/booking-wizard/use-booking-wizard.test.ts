// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { confirmBooking, loadBookingFlow } from "@core/application/query/controller/booking-flow.controller";
import { useBookingWizard } from "./use-booking-wizard";
import { describe, expect, it, vi } from "vitest";
import { STEP_ORDER, STEP_TITLE } from "./booking-wizard.types";

vi.mock("@core/application/query/controller/booking-flow.controller", () => ({
  confirmBooking: vi.fn(),
  loadBookingFlow: vi.fn(),
}));

describe("booking-wizard types & config", () => {
  it("defines the correct order of steps", () => {
    expect(STEP_ORDER).toEqual([
      "servico",
      "profissional",
      "data",
      "horario",
      "confirmacao",
    ]);
  });

  it("defines titles and subtitles for each step", () => {
    expect(STEP_TITLE.servico.title).toBe("Escolha o serviço");
    expect(STEP_TITLE.profissional.title).toBe("Escolha o profissional");
    expect(STEP_TITLE.data.title).toBe("Escolha a data");
    expect(STEP_TITLE.horario.title).toBe("Escolha o horário");
    expect(STEP_TITLE.confirmacao.title).toBe("Confirme seu agendamento");
    expect(STEP_TITLE.sucesso.title).toBe("Solicitação enviada!");
  });
});

it("navega entre as etapas sem requisitar a disponibilidade novamente", () => {
  const professional = { id: "opaque-selection", name: "Maria", initials: "MA" };
  const service = { id: "0", name: "Consulta", description: "", durationMinutes: 60, professionals: [professional] };
  const date = "2026-08-20";
  const { result } = renderHook(() => useBookingWizard({
    services: [service],
    availability: { 2: { [date]: ["09:00"] } },
  }));

  act(() => result.current.selectService(service));
  expect(result.current.professionals).toEqual([professional]);
  act(() => result.current.selectProfessional(professional));
  expect(result.current.dates).toEqual([date]);
  act(() => result.current.selectDate(date));
  expect(result.current.times).toEqual(["09:00"]);
  act(() => result.current.goBack());
  act(() => result.current.selectDate(date));
  expect(result.current.times).toEqual(["09:00"]);
  expect(loadBookingFlow).not.toHaveBeenCalled();
  expect(confirmBooking).not.toHaveBeenCalled();
});

it("recarrega a disponibilidade uma vez após conflito na confirmação", async () => {
  const professional = { id: "opaque-selection", name: "Maria", initials: "MA" };
  const service = { id: "0", name: "Consulta", description: "", durationMinutes: 30, professionals: [professional] };
  const date = "2026-08-20";
  const { result } = renderHook(() => useBookingWizard({
    services: [service],
    availability: { 1: { [date]: ["09:00"] } },
  }));
  vi.mocked(confirmBooking).mockResolvedValueOnce({ success: false, error: "Horário indisponível", refresh: true });
  vi.mocked(loadBookingFlow).mockResolvedValueOnce({
    success: true, data: { services: [service], availability: { 1: { [date]: ["09:30"] } } },
  });

  act(() => result.current.selectService(service));
  act(() => result.current.selectProfessional(professional));
  act(() => result.current.selectDate(date));
  act(() => result.current.selectTime("09:00"));
  await act(() => result.current.confirm());

  expect(confirmBooking).toHaveBeenCalledWith({ selection: professional.id, date, time: "09:00" });
  expect(loadBookingFlow).toHaveBeenCalledTimes(1);
  expect(result.current.error).toBe("Horário indisponível");
  act(() => result.current.selectService(service));
  act(() => result.current.selectProfessional(professional));
  act(() => result.current.selectDate(date));
  expect(result.current.times).toEqual(["09:30"]);
});
