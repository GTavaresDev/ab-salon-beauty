// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppointmentReviewModal } from "./appointment-review-modal.component";

const mocks = vi.hoisted(() => ({ submit: vi.fn() }));
vi.mock("@core/application/query/controller/read-appointment.controller", () => ({ submitAppointmentReviewAction: mocks.submit }));

const review1 = { appointmentId: "a-1", date: "2026-11-26", time: "15:00", professionalName: "Mariana Costa" };
const review2 = { appointmentId: "a-2", date: "2026-11-25", time: "14:30", professionalName: "Ana Lima" };

describe("AppointmentReviewModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    window.history.replaceState({}, "", "/cliente/painel");
  });

  it("requires a score, confirms success, and advances to the next pending appointment", async () => {
    mocks.submit.mockResolvedValue({ success: true });
    vi.useFakeTimers();
    render(<AppointmentReviewModal reviews={[review1, review2]} clientName="Gabriel" />);
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByRole("heading", { name: /Mariana Costa às 15:00/ })).toBeInTheDocument();
    const submit = screen.getByRole("button", { name: "Enviar avaliação" });
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "5 de 5" }));
    fireEvent.click(submit);
    await act(async () => { await Promise.resolve(); });
    expect(mocks.submit).toHaveBeenCalledWith("a-1", 5);
    expect(screen.getByRole("status")).toHaveTextContent("Obrigada pela sua avaliação");

    await act(async () => { await vi.advanceTimersByTimeAsync(1600); });
    expect(screen.getByRole("heading", { name: /Ana Lima às 14:30/ })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("keeps the rating available and allows retry after a server error", async () => {
    mocks.submit.mockResolvedValueOnce({ success: false, error: "Erro temporário" }).mockResolvedValueOnce({ success: true });
    render(<AppointmentReviewModal reviews={[review1]} clientName="Gabriel" />);
    await screen.findByRole("button", { name: "Enviar avaliação" });
    fireEvent.click(screen.getByRole("button", { name: "4 de 5" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar avaliação" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Erro temporário");
    expect(screen.getByRole("button", { name: "4 de 5" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Enviar avaliação" }));
    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());
    expect(mocks.submit).toHaveBeenCalledTimes(2);
  });

  it("honors a survey link targeting an appointment and shows no modal for an empty queue", async () => {
    window.history.replaceState({}, "", "/cliente/painel?avaliar=a-2");
    const view = render(<AppointmentReviewModal reviews={[review1, review2]} clientName="Gabriel" />);
    expect(await screen.findByRole("heading", { name: /Ana Lima às 14:30/ })).toBeInTheDocument();
    view.rerender(<AppointmentReviewModal reviews={[]} clientName="Gabriel" />);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
