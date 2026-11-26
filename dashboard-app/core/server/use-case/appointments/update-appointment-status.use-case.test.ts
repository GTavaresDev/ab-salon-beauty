import { describe, expect, it } from "vitest";
import { UpdateAppointmentStatus } from "./update-appointment-status.use-case";
import { buildAppointment, mockAppointmentRepository } from "./test-helpers";
import { vi } from "vitest";
import type { UserRepository } from "@core/server/db/repository/user.repository";

const userRepository = { findById: vi.fn() } satisfies Pick<UserRepository, "findById">;

describe("UpdateAppointmentStatus", () => {
  it("throws when the appointment does not exist", async () => {
    const repo = mockAppointmentRepository();
    repo.findById.mockResolvedValue(null);
    const useCase = new UpdateAppointmentStatus(repo, userRepository);

    await expect(useCase.execute({ id: "admin", role: "Administrador" }, "missing", "Concluído")).rejects.toThrow(/não encontrado/i);
  });

  it("updates the status while preserving other fields", async () => {
    const repo = mockAppointmentRepository();
    repo.findById.mockResolvedValue(buildAppointment({ id: "a1", status: "Confirmado" }));
    repo.update.mockImplementation(async (a) => a);
    const useCase = new UpdateAppointmentStatus(repo, userRepository);

    const result = await useCase.execute({ id: "admin", role: "Administrador" }, "a1", "Concluído");

    expect(result.status).toBe("Concluído");
    expect(result.id).toBe("a1");
    expect(result.name).toBe("Maria Silva");
  });

  it("captures the professional commission percent when completing", async () => {
    const repo = mockAppointmentRepository();
    repo.findById.mockResolvedValue(buildAppointment({ id: "a1", userId: "u1", status: "Confirmado" }));
    repo.update.mockImplementation(async (a) => a);
    userRepository.findById.mockResolvedValue({ commissionPercent: 10 });
    const useCase = new UpdateAppointmentStatus(repo, userRepository);

    const result = await useCase.execute({ id: "admin", role: "Administrador" }, "a1", "Concluído");

    expect(result.commissionPercent).toBe(10);
  });

  it("preserves an existing historical commission percent", async () => {
    const repo = mockAppointmentRepository();
    repo.findById.mockResolvedValue(buildAppointment({ id: "a1", userId: "u1", status: "Confirmado", commissionPercent: 10 }));
    repo.update.mockImplementation(async (a) => a);
    userRepository.findById.mockResolvedValue({ commissionPercent: 12 });
    const useCase = new UpdateAppointmentStatus(repo, userRepository);

    const result = await useCase.execute({ id: "admin", role: "Administrador" }, "a1", "Concluído");

    expect(result.commissionPercent).toBe(10);
  });
});
