import { describe, expect, it } from "vitest";
import { ListAppointments } from "./list-appointments.use-case";
import { buildAppointment, mockAppointmentRepository } from "./test-helpers";

describe("ListAppointments", () => {
  it("uses findAll when no date filter is given", async () => {
    const repo = mockAppointmentRepository();
    repo.findAll.mockResolvedValue([buildAppointment()]);
    const useCase = new ListAppointments(repo);

    await useCase.execute({ id: "admin", role: "Administrador" });

    expect(repo.findAll).toHaveBeenCalled();
    expect(repo.findByDate).not.toHaveBeenCalled();
  });

  it("uses findByDate when a date filter is given", async () => {
    const repo = mockAppointmentRepository();
    repo.findByDate.mockResolvedValue([buildAppointment()]);
    const useCase = new ListAppointments(repo);

    await useCase.execute({ id: "admin", role: "Administrador" }, { date: "2026-08-06" });

    expect(repo.findByDate).toHaveBeenCalledWith("2026-08-06");
    expect(repo.findAll).not.toHaveBeenCalled();
  });

  it("filters by search across name and service", async () => {
    const repo = mockAppointmentRepository();
    repo.findAll.mockResolvedValue([
      buildAppointment({ id: "a1", name: "Maria Silva", service: "Corte" }),
      buildAppointment({ id: "a2", name: "João Souza", service: "Manicure" }),
    ]);
    const useCase = new ListAppointments(repo);

    const result = await useCase.execute({ id: "admin", role: "Administrador" }, { search: "corte" });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a1");
  });

  it("filters by status, ignoring the 'Todos' sentinel", async () => {
    const repo = mockAppointmentRepository();
    repo.findAll.mockResolvedValue([
      buildAppointment({ id: "a1", status: "Confirmado" }),
      buildAppointment({ id: "a2", status: "Cancelado" }),
    ]);
    const useCase = new ListAppointments(repo);

    expect(await useCase.execute({ id: "admin", role: "Administrador" }, { status: "Cancelado" })).toHaveLength(1);
    expect(await useCase.execute({ id: "admin", role: "Administrador" }, { status: "Todos" })).toHaveLength(2);
  });

  it("automatically transitions expired pending appointments to Cancelado", async () => {
    const repo = mockAppointmentRepository();
    repo.findAll.mockResolvedValue([
      buildAppointment({ id: "a1", date: "2026-08-01", time: "10:00", status: "Pendente" }),
      buildAppointment({ id: "a2", date: "2026-08-20", time: "18:00", status: "Pendente" }),
    ]);
    const useCase = new ListAppointments(repo);

    const now = new Date("2026-08-10T12:00:00");
    const result = await useCase.execute({ id: "admin", role: "Administrador" }, undefined, now);

    expect(repo.update).toHaveBeenCalled();
    const a1 = result.find((a) => a.id === "a1");
    const a2 = result.find((a) => a.id === "a2");
    expect(a1?.status).toBe("Cancelado");
    expect(a2?.status).toBe("Pendente");
  });

  it("keeps same-day bookings pending until their start time in São Paulo", async () => {
    const repo = mockAppointmentRepository();
    repo.findByDate.mockResolvedValue([
      buildAppointment({ date: "2026-11-27", time: "16:30", status: "Pendente" }),
    ]);
    const useCase = new ListAppointments(repo);
    const actor = { id: "admin", role: "Administrador" } as const;
    const filter = { date: "2026-11-27" };

    const before = await useCase.execute(actor, filter, new Date("2026-11-27T19:21:33Z"));

    expect(before[0].status).toBe("Pendente");
    expect(repo.update).not.toHaveBeenCalled();

    const after = await useCase.execute(actor, filter, new Date("2026-11-27T19:30:01Z"));

    expect(after[0].status).toBe("Cancelado");
    expect(repo.update).toHaveBeenCalledOnce();
  });
});
