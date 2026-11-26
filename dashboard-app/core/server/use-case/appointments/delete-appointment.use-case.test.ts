import { describe, expect, it } from "vitest";
import { DeleteAppointment } from "./delete-appointment.use-case";
import { buildAppointment, mockAppointmentRepository } from "./test-helpers";

describe("DeleteAppointment", () => {
  it("throws when the appointment does not exist", async () => {
    const repo = mockAppointmentRepository();
    repo.findById.mockResolvedValue(null);
    const useCase = new DeleteAppointment(repo);

    await expect(useCase.execute({ id: "admin", role: "Administrador" }, "missing")).rejects.toThrow(/não encontrado/i);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("deletes an existing appointment", async () => {
    const repo = mockAppointmentRepository();
    repo.findById.mockResolvedValue(buildAppointment({ id: "a1" }));
    const useCase = new DeleteAppointment(repo);

    await useCase.execute({ id: "admin", role: "Administrador" }, "a1");

    expect(repo.delete).toHaveBeenCalledWith("a1");
  });
});
