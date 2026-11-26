// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { PendingAppointmentsModal } from "./pending-appointments-modal.component";

const appointments: AppointmentProps[] = [
  {
    id: "a-1", date: "2026-11-26", time: "15:00", name: "Gabriel Tavares", service: "Consulta inicial",
    duration: "30 min", status: "Pendente", initials: "GT", channelId: "site", userName: "Mariana Costa",
    clientPhone: "(55) 62994-2791",
  },
  {
    id: "a-2", date: "2026-11-27", time: "10:00", name: "Ana Lima", service: "Corte",
    duration: "45 min", status: "Pendente", initials: "AL", channelId: "site",
  },
];

describe("PendingAppointmentsModal", () => {
  it("shows appointment details with the pending badge below the time and confirms the single row", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<PendingAppointmentsModal
      isOpen onClose={vi.fn()} onReview={vi.fn()} onConfirm={onConfirm}
      pendingAppointments={[appointments[0]]}
    />);

    expect(screen.getByText("Gabriel Tavares")).toBeInTheDocument();
    expect(screen.getByText("Consulta inicial")).toBeInTheDocument();
    expect(screen.getByText("Profissional: Mariana Costa")).toBeInTheDocument();
    expect(screen.getByText("(55) 62994-2791")).toBeInTheDocument();
    const time = screen.getByText(/15:00/);
    expect(time.parentElement?.textContent).toContain("Pendente");

    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(appointments[0]));
  });

  it("lists all pending requests and does not offer single-appointment confirmation", () => {
    render(<PendingAppointmentsModal
      isOpen onClose={vi.fn()} onReview={vi.fn()} onConfirm={vi.fn()}
      pendingAppointments={appointments}
    />);
    expect(screen.getByText("Gabriel Tavares")).toBeInTheDocument();
    expect(screen.getByText("Ana Lima")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirmar" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Revisar agendamentos/ })).toBeInTheDocument();
  });

  it("does not render when the modal is closed or has no pending appointments", () => {
    const props = { onClose: vi.fn(), onReview: vi.fn(), pendingAppointments: [] as AppointmentProps[] };
    const closed = render(<PendingAppointmentsModal {...props} isOpen={false} />);
    expect(closed.queryByRole("dialog")).not.toBeInTheDocument();
    closed.rerender(<PendingAppointmentsModal {...props} isOpen />);
    expect(closed.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
