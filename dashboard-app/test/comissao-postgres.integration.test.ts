import { randomUUID } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, expect, it, vi } from "vitest";
import { PrismaAppointmentRepository } from "@core/server/db/repository/appointments/prisma-appointment.repository";
import { PrismaUserRepository } from "@core/server/db/repository/users/prisma-user.repository";
import { UpdateAppointmentStatus } from "@core/server/use-case/appointments/update-appointment-status.use-case";
import { CommissionView } from "@/app/(agendamentos)/(left-nav-bar)/comissao/_components/commission-view.component";
import type { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { prisma } from "./postgres-local";

vi.mock("@core/server/db/prisma", () => import("./postgres-local"));
vi.mock("@core/server/cache/redis", () => ({ redis: null, isCacheEnabled: false }));
vi.mock("@core/application/query/controller/users/user.controller", () => ({ fetchUsersAction: async () => [] }));
vi.mock("@/app/(agendamentos)/(left-nav-bar)/agenda/hooks/use-appointments", () => ({
  useAppointments: () => ({ appointmentList: rows, isLoading: false }),
}));
let rows: AppointmentProps[] = [];
const id = randomUUID();
const professionalId = randomUUID();
const serviceId = randomUUID();
const appointments = new PrismaAppointmentRepository();
const updateStatus = new UpdateAppointmentStatus(appointments, new PrismaUserRepository());

async function report() {
  const item = await appointments.findById(id);
  expect(item).toBeTruthy();
  rows = [item!.toJSON()];
  return renderToStaticMarkup(createElement(CommissionView));
}

afterAll(async () => {
  try {
    await prisma.appointment.deleteMany({ where: { id } });
    await prisma.service.deleteMany({ where: { id: serviceId } });
    await prisma.user.deleteMany({ where: { id: professionalId } });
  } finally {
    await prisma.$disconnect();
  }
});

it("contabiliza a comissão apenas ao concluir e preserva o percentual original na repetição", async () => {
  await prisma.appointmentStatus.createMany({ data: [
    { id: "status-confirmado", name: "Confirmado" },
    { id: "status-concluido", name: "Concluído" },
  ], skipDuplicates: true });
  await prisma.user.create({ data: { id: professionalId, name: "Profissional fictício", initials: "PF",
    phone: "0000000000", email: professionalId + "@example.invalid", commissionPercent: 20 } });
  await prisma.service.create({ data: { id: serviceId, name: "Serviço fictício", duration: 30, price: 150 } });
  await prisma.appointment.create({ data: { id, name: "Cliente fictício", date: "2099-01-05", time: "10:00",
    duration: "30 min", initials: "CF", channelId: "teste", userId: professionalId, serviceId, status: "Pendente" } });
  const actor = { id: professionalId, role: "Funcionario" } as const;

  expect(await report()).toContain("Nenhum atendimento concluído");
  await updateStatus.execute(actor, id, "Confirmado");
  expect(await report()).toContain("Nenhum atendimento concluído");
  expect(rows[0].commissionPercent).toBeNull();

  await updateStatus.execute(actor, id, "Concluído");
  expect(await report()).toMatch(/R\$\s*30,00/);
  expect(rows[0].commissionPercent).toBe(20);

  await prisma.user.update({ where: { id: professionalId }, data: { commissionPercent: 50 } });
  await updateStatus.execute(actor, id, "Concluído");
  expect(await report()).toMatch(/R\$\s*30,00/);
  expect(rows[0].commissionPercent).toBe(20);
});
