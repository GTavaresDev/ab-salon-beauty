import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { In, Raw } from 'typeorm';
import type { CreateAppointmentDto } from '../../cliente/appointments/dto/create-appointment.dto.js';
import type { UpdateAppointmentDto } from '../../cliente/appointments/dto/update-appointment.dto.js';

const pending = ['Pendente', 'Aguardando confirmação'];

function requireFutureSlot(date?: string, time?: string) {
  const now = new Date();
  const zone = { timeZone: 'America/Sao_Paulo' };
  const today = now.toLocaleDateString('sv-SE', zone);
  const currentTime = now.toLocaleTimeString('sv-SE', { ...zone, hour: '2-digit', minute: '2-digit' });
  if (!date || !time || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
      || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date
      || date + ' ' + time <= today + ' ' + currentTime) {
    throw new BadRequestException('Informe uma data e um horário futuros válidos.');
  }
}

export function clientBooking(input: CreateAppointmentDto, clientId: string): CreateAppointmentDto {
  if (input.statusName !== undefined && !pending.includes(input.statusName)) {
    throw new ForbiddenException('O cliente só pode criar um agendamento pendente.');
  }
  requireFutureSlot(input.date, input.time);
  return { ...input, clientId, statusName: 'Pendente', channelId: 'site' };
}

// O mesmo filtro vale na leitura e no UPDATE, inclusive se a equipe concluir em paralelo.
export function clientEditableScope(clientId: string) {
  return {
    clientId,
    statusName: In([...pending, 'Confirmado']),
    date: Raw(column => `(${column} || ' ' || "time") > to_char(statement_timestamp() AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD HH24:MI')`),
  };
}

export function clientReschedule(input: UpdateAppointmentDto): UpdateAppointmentDto {
  if (input.statusName === 'Cancelado') return { statusName: 'Cancelado' };
  if (input.statusName !== undefined && !pending.includes(input.statusName)) {
    throw new ForbiddenException('O cliente não pode aplicar este status.');
  }
  requireFutureSlot(input.date, input.time);
  const { date, time, name, service, duration, serviceId, professionalName, professionalEmail, userId } = input;
  return { date, time, name, service, duration, serviceId, professionalName, professionalEmail, userId, statusName: 'Pendente' };
}
