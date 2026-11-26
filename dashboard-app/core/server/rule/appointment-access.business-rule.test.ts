import { describe, expect, it } from "vitest";
import { canManageAppointment, canViewAppointment } from "./appointment-access.business-rule";
import type { Appointment } from "@core/application/query/interface/appointment.entity";

const otherUsersAppointment = {
  id: "appointment-1",
  userId: "other-user",
  userRole: "Funcionario",
} as Appointment;

describe("appointment access", () => {
  it("allows a Gestor to view and manage every appointment", () => {
    const actor = { id: "gestor", role: "Gestor" as const };

    expect(canViewAppointment(actor, otherUsersAppointment)).toBe(true);
    expect(canManageAppointment(actor, otherUsersAppointment)).toBe(true);
  });

  it("keeps a Usuario restricted to their own appointments", () => {
    const actor = { id: "usuario", role: "Funcionario" as const };

    expect(canViewAppointment(actor, otherUsersAppointment)).toBe(false);
  });
});
