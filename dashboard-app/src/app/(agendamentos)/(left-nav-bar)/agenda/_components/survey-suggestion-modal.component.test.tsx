// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { SurveySuggestionModal } from "./survey-suggestion-modal.component";

const appointment: AppointmentProps = {
  id: "appointment-1", date: "2026-11-26", time: "15:00", name: "Gabriel Tavares",
  service: "Consulta", duration: "30 min", status: "Concluído", initials: "GT",
  channelId: "site", clientId: "client-1", userId: "staff-1", userName: "Mariana Costa",
  clientPhone: "+55 (62) 99999-9999",
};

describe("SurveySuggestionModal", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("shows a fixed message and sends the survey link by WhatsApp", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const onClose = vi.fn();
    const onDismiss = vi.fn().mockResolvedValue(true);
    render(<SurveySuggestionModal appointment={appointment} onClose={onClose} onDismiss={onDismiss} />);

    const message = screen.getByRole("textbox", { name: "Texto da pesquisa" });
    expect(message).toHaveAttribute("aria-readonly", "true");
    expect(message.textContent).toContain("Olá, Gabriel Tavares!");
    expect(message.textContent).toContain("Mariana Costa em 26/11/2026");
    expect(message.textContent).toContain("https://cliente.absalonbeauty.com.br");

    fireEvent.click(screen.getByRole("button", { name: "Enviar pesquisa" }));
    expect(open).toHaveBeenCalledWith(expect.stringContaining("https://wa.me/5562999999999?text="), "_blank", "noopener,noreferrer");
    expect(onClose).toHaveBeenCalledOnce();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("persists 'Agora não' and keeps the dialog open when dismissal fails so it can be retried", async () => {
    const onClose = vi.fn();
    const onDismiss = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    render(<SurveySuggestionModal appointment={appointment} onClose={onClose} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole("button", { name: "Agora não" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Tente novamente");
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Agora não" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it("disables sending when the appointment has no client phone", () => {
    render(<SurveySuggestionModal appointment={{ ...appointment, clientPhone: null }} onClose={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Enviar pesquisa" })).toBeDisabled();
  });
});
