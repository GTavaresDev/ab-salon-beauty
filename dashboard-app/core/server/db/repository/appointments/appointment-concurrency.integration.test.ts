import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";

describe("appointment day lock with PostgreSQL", () => {
  let prisma: typeof import("@core/server/db/prisma").prisma;
  let withDayLock: typeof import("@core/server/shared/day-lock").withDayLock;
  let CreateAppointment: typeof import("@core/server/use-case/appointments/create-appointment.use-case").CreateAppointment;
  let createdUserIds: string[] = [];
  let createdClientIds: string[] = [];
  const date = "2030-01-02";

  beforeAll(async () => {
    loadEnvConfig(process.cwd());
    if (!process.env.TEST_DATABASE_URL) {
      throw new Error("TEST_DATABASE_URL deve apontar para uma cópia local descartável do banco.");
    }
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    ({ prisma } = await import("@core/server/db/prisma"));
    ({ withDayLock } = await import("@core/server/shared/day-lock"));
    ({ CreateAppointment } = await import("@core/server/use-case/appointments/create-appointment.use-case"));
  });

  beforeEach(async () => {
    await prisma.appointment.deleteMany({
      where: {
        date,
        OR: [
          { userId: { in: createdUserIds } },
          { clientId: { in: createdClientIds } },
        ],
      },
    });
    await prisma.client.deleteMany({ where: { id: { in: createdClientIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    createdClientIds = [];
    createdUserIds = [];
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({
      where: {
        date,
        OR: [
          { userId: { in: createdUserIds } },
          { clientId: { in: createdClientIds } },
        ],
      },
    });
    await prisma.client.deleteMany({ where: { id: { in: createdClientIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  it("allows only one of two concurrent clients to reserve the same clinic slot", async () => {
    const professional = await prisma.user.create({
      data: {
        name: "Profissional teste",
        email: `professional-${randomUUID()}@example.test`,
        phone: "11999990000",
        initials: "PT",
        role: "Funcionario",
      },
    });
    createdUserIds.push(professional.id);
    const clients = await Promise.all(
      ["first", "second"].map((suffix) =>
        prisma.client.create({
          data: {
            name: `Cliente ${suffix}`,
            email: `${suffix}-${randomUUID()}@example.test`,
            phone: "11999990001",
            initials: "CT",
          },
        }),
      ),
    );
    createdClientIds.push(...clients.map((client) => client.id));

    const now = new Date(2030, 0, 1, 8, 0);
    const attempts = clients.map((client) =>
      withDayLock(date, (appointments) =>
        new CreateAppointment(appointments as unknown as import("@core/server/db/repository/appointment.repository").AppointmentRepository).execute(
          {
            date,
            time: "09:00",
            name: client.name,
            service: "Consulta",
            duration: "30 min",
            userId: professional.id,
            clientId: client.id,
          },
          now,
        ),
      ),
    );

    const results = await Promise.allSettled(attempts);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    await expect(prisma.appointment.count({ where: { date, time: "09:00" } })).resolves.toBe(1);
  });
});
