import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AppointmentsController } from '../src/cliente/appointments/appointments.controller.js';
import { Appointment, AppointmentStatus } from '../src/cliente/appointments/entities/appointment.entity.js';
import { AppointmentOwnershipUseCase } from '../src/security/client/appointment-ownership.use-case.js';
import { createAppointmentUseCase } from '../src/cliente/appointments/use-cases/createAppointment.use-case.js';
import { updateAppointmentUseCase } from '../src/cliente/appointments/use-cases/updateAppointment.use-case.js';
import { deleteAppointmentUseCase } from '../src/cliente/appointments/use-cases/deleteAppointment.use-case.js';
import { getAppointmentsByClientUseCase } from '../src/cliente/appointments/use-cases/getAppointmentsByClient.use-case.js';
import { getAppointmentsByIdUseCase } from '../src/cliente/appointments/use-cases/getAppointmentsById.use-case.js';
import { getServicesUseCase } from '../src/cliente/appointments/use-cases/getServices.use-case.js';
import { getProfessionalsUseCase } from '../src/cliente/appointments/use-cases/getProfessionals.use-case.js';
import { getDateUseCase } from '../src/cliente/appointments/use-cases/getDate.use-case.js';

const url = new URL(process.env.TEST_DATABASE_URL ?? 'about:blank');
if (url.protocol !== 'postgresql:' || url.hostname !== '127.0.0.1' || url.pathname !== '/salon_fixture_test' || url.search || url.hash) {
  throw new Error('Banco local de teste obrigatório.');
}
const db = new DataSource({ type: 'postgres', url: url.href, entities: [Appointment, AppointmentStatus] });
const actor = { sub: randomUUID(), issuer: 'client' } as const;
const input = { date: '2099-09-10', time: '10:00', duration: '30 min', name: 'Cliente fictício', service: 'Teste' };
let api: AppointmentsController;
beforeAll(async () => {
  await db.initialize();
  const repo = db.getRepository(Appointment);
  await db.query('INSERT INTO "Clients" (id,name,email,phone,initials,"updatedAt") VALUES ($1,$2,$3,$4,$5,NOW())',
    [actor.sub, input.name, actor.sub + '@example.invalid', '00000000000', 'CF']);
  for (const [id, name] of [['status-aguardando','Aguardando confirmação'], ['status-cancelado','Cancelado']]) {
    await db.query('INSERT INTO "AppointmentStatuses" (id,name,"updatedAt") VALUES ($1,$2,NOW()) ON CONFLICT DO NOTHING', [id,name]);
  }
  api = new AppointmentsController(new getAppointmentsByClientUseCase(repo), new getAppointmentsByIdUseCase(repo),
    new deleteAppointmentUseCase(repo), new createAppointmentUseCase(repo, db), new updateAppointmentUseCase(repo, db),
    new getServicesUseCase(db), new getProfessionalsUseCase(db), new getDateUseCase(db), new AppointmentOwnershipUseCase(repo));
});
afterAll(async () => {
  if (!db.isInitialized) return;
  try {
    await db.getRepository(Appointment).delete({ clientId: actor.sub });
    await db.query('DELETE FROM "Clients" WHERE id=$1', [actor.sub]);
  } finally { await db.destroy(); }
});

it('cria pendente, reagenda aguardando confirmação e cancela preservando o histórico', async () => {
  expect(() => api.create({ ...input, statusName: 'Confirmado' }, actor)).toThrow(ForbiddenException);
  const row = await api.create(input, actor);
  expect(row.statusName).toBe('Pendente');
  await db.getRepository(Appointment).update(row.id, { statusName: 'Confirmado' });
  await expect(api.update(row.id, undefined, { statusName: 'Concluído' }, actor)).rejects.toThrow(ForbiddenException);
  await expect(api.update(row.id, undefined, { ...input, time: '11:00' }, actor)).resolves.toMatchObject({ statusName: 'Pendente' });
  await api.remove(row.id, undefined, actor);
  expect(await db.getRepository(Appointment).findOneByOrFail({ id: row.id })).toMatchObject({ statusName: 'Cancelado', statusId: 'status-cancelado' });
  await expect(api.update(row.id, undefined, input, actor)).rejects.toThrow(NotFoundException);
});

it('protege atendimentos concluídos, passados e de outro cliente', async () => {
  const row = await api.create(input, actor);
  await expect(api.remove(row.id, undefined, { ...actor, sub: randomUUID() })).rejects.toThrow(ForbiddenException);
  const repo = db.getRepository(Appointment);
  for (const state of [{ statusName: 'Concluído' }, { statusName: 'Confirmado', date: '2000-01-01' }]) {
    await repo.update(row.id, state);
    await expect(api.remove(row.id, undefined, actor)).rejects.toThrow(NotFoundException);
    await expect(api.update(row.id, undefined, input, actor)).rejects.toThrow(NotFoundException);
    expect(await repo.findOneByOrFail({ id: row.id })).toMatchObject(state);
  }
});
