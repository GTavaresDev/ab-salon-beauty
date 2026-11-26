// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ClientAppointmentDTO } from "@core/application/interfaces/appointments/client-appointment";
import { AppointmentCard } from "./appointment-card.component";

describe("AppointmentCard portal privacy", () => {
  it("shows only client-safe appointment fields and links to that appointment", () => {
    const appointment: ClientAppointmentDTO = {
      id: "appointment-safe-id",
      date: "2030-01-02",
      time: "09:00",
      serviceName: "Consulta inicial",
      duration: "30 min",
      professionalName: "Dra. Ana",
      status: "Confirmado",
      canCancel: true,
    };

    render(<AppointmentCard appointment={appointment} />);

    expect(screen.getByText("Consulta inicial")).toBeInTheDocument();
    expect(screen.getByText("Dra. Ana")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/cliente/painel/meus-agendamentos/appointment-safe-id",
    );
    expect(screen.queryByText(/R\$|anotações internas|clientId/i)).not.toBeInTheDocument();
  });
});
