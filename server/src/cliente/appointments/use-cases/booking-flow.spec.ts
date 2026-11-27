import { BadRequestException, ConflictException } from '@nestjs/common';
import type { DataSource, Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity.js';
import { createAppointmentUseCase } from './createAppointment.use-case.js';
import { getDateUseCase } from './getDate.use-case.js';
import { bookingDays } from './booking-availability.js';

const tomorrow = () => bookingDays(new Date())[1];

it('carrega catálogo e ocupação com duas leituras, independentemente do número de vínculos', async () => {
  const date = tomorrow();
  const catalog = [
    { serviceId: 's1', duration: 30, professionalId: 'p1' },
    { serviceId: 's1', duration: 30, professionalId: 'p2' },
    { serviceId: 's2', duration: 60, professionalId: 'p1' },
  ];
  const query = vi.fn().mockResolvedValueOnce(catalog)
    .mockResolvedValueOnce([{ date, time: '09:00', duration: '1h' }]);
  const flow = await new getDateUseCase({ query } as unknown as DataSource).prefetch();

  expect(query).toHaveBeenCalledTimes(2);
  expect(query.mock.calls[0][0]).toContain('ANY(u."serviceIds")');
  expect(query.mock.calls[1][0]).toContain("status <> 'Cancelado'");
  expect(query.mock.calls[1][1]).toEqual([bookingDays(new Date())[0], bookingDays(new Date())[13]]);
  expect(flow.catalog).toBe(catalog);
  expect(flow.availability[1][date]).toEqual(expect.arrayContaining(['08:30', '10:00']));
  expect(flow.availability[1][date]).not.toContain('09:30');
  expect(flow.availability[2][date]).not.toContain('08:30');
  expect(flow.availability[2][date]).not.toContain('11:30');
});

function setupBooking(occupied: Array<{ date: string; time: string; duration: string }> = []) {
  const date = tomorrow();
  const catalog = { service: 'Consulta', duration: 60, professionalName: 'Profissional', clientName: 'Cliente' };
  const query = vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([catalog]).mockResolvedValueOnce(occupied);
  const insert = vi.fn();
  const transaction = vi.fn(async (_isolation, run) => run({ query, insert }));
  const repository = { create: vi.fn((record) => record) };
  const booking = new createAppointmentUseCase(repository as unknown as Repository<Appointment>, { transaction } as unknown as DataSource);
  const input = { date, time: '09:00', name: 'Enviado', service: 'Enviado', duration: '30 min', serviceId: 's1', userId: 'p1' };
  return { booking, input, query, insert, transaction };
}

it('valida vínculo e disponibilidade após adquirir a trava e grava dados do banco', async () => {
  const { booking, input, query, insert, transaction } = setupBooking();
  const result = await booking.book(input, 'c1');

  expect(transaction).toHaveBeenCalledWith('READ COMMITTED', expect.any(Function));
  expect(query).toHaveBeenCalledTimes(3);
  expect(query.mock.calls[0]).toEqual(['SELECT pg_advisory_xact_lock(hashtext($1)::bigint)', [`appointments:${input.date}`]]);
  expect(query.mock.calls[1][1]).toEqual(['s1', 'p1', 'c1']);
  expect(query.mock.calls[2][1]).toEqual([input.date, input.date]);
  expect(insert).toHaveBeenCalledWith(Appointment, expect.objectContaining({
    clientId: 'c1', name: 'Cliente', service: 'Consulta', duration: '60 min (1h)', statusName: 'Pendente',
  }));
  expect(result).not.toHaveProperty('clientId');
  expect(result).not.toHaveProperty('userId');
});

it('rejeita sobreposição parcial com reserva gravada após o prefetch', async () => {
  const { booking, input, insert } = setupBooking([{ date: tomorrow(), time: '09:30', duration: '30 min' }]);
  await expect(booking.book(input, 'c1')).rejects.toBeInstanceOf(ConflictException);
  expect(insert).not.toHaveBeenCalled();
});

it('rejeita vínculo removido antes de confirmar', async () => {
  const { booking, input, query, insert } = setupBooking();
  query.mockReset().mockResolvedValue([]);
  await expect(booking.book(input, 'c1')).rejects.toBeInstanceOf(BadRequestException);
  expect(insert).not.toHaveBeenCalled();
});
