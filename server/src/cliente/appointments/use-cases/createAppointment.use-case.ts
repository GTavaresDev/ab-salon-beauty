import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateAppointmentDto } from '../dto/create-appointment.dto.js';
import { Appointment } from '../entities/appointment.entity.js';
import { availableStarts, BOOKABLE_CATALOG, bookingDays, durationBlocks, readOccupancy } from './booking-availability.js';

@Injectable()
export class createAppointmentUseCase {
  constructor(
    @InjectRepository(Appointment) private readonly appointmentsRepository: Repository<Appointment>,
    private readonly dataSource: DataSource,
  ) {}

  async book(input: CreateAppointmentDto, clientId: string) {
    return this.dataSource.transaction('READ COMMITTED', async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1)::bigint)', [`appointments:${input.date}`]);
      const [selection] = await manager.query<Array<{
        service: string; duration: number; professionalName: string; clientName: string;
      }>>(
        `SELECT s.name AS service, s.duration, u.name AS "professionalName",
                (SELECT c.name FROM "Clients" c WHERE c.id = $3
                   AND c.status = 'Ativo' AND c."portalAccess" = 'APPROVED') AS "clientName"
         ${BOOKABLE_CATALOG}
         AND s.id = $1 AND u.id = $2
         FOR SHARE OF s, u`,
        [input.serviceId, input.userId, clientId],
      );
      if (!selection?.clientName) throw new BadRequestException('Serviço ou profissional indisponível.');

      const now = new Date();
      const blocks = durationBlocks(selection.duration);
      const occupied = await readOccupancy(manager, input.date, input.date);
      if (!bookingDays(now).includes(input.date)
        || !availableStarts(input.date, blocks, occupied.get(input.date), now).includes(input.time)) {
        throw new ConflictException('Este horário não está mais disponível. Escolha outro horário.');
      }

      const duration = ['30 min', '60 min (1h)', '90 min (1h30)'][blocks - 1];
      const appointment = this.build({
        ...input, name: selection.clientName, service: selection.service, duration,
        clientId, notes: null, statusName: 'Pendente', channelId: 'site',
      }, input.userId);
      await manager.insert(Appointment, appointment);
      return {
        id: appointment.id, date: appointment.date, time: appointment.time, duration,
        service: selection.service, professionalName: selection.professionalName, statusName: appointment.statusName,
      };
    });
  }

  async create(input: CreateAppointmentDto): Promise<Appointment> {
    const userId = input.userId ?? await this.findProfessionalId(input.professionalEmail, input.professionalName);
    return this.appointmentsRepository.save(this.build(input, userId));
  }

  private build(input: CreateAppointmentDto, userId?: string | null): Appointment {
    return this.appointmentsRepository.create({
      id: crypto.randomUUID(), date: input.date, time: input.time, name: input.name,
      service: input.service, duration: input.duration, statusName: input.statusName ?? 'Confirmado',
      initials: this.generateInitials(input.name), channelId: input.channelId ?? 'site', notes: input.notes ?? null,
      userId: userId ?? null, clientId: input.clientId ?? null, serviceId: input.serviceId ?? null,
      statusId: this.getStatusId(input.statusName), updatedAt: new Date(),
    });
  }

  private async findProfessionalId(email?: string, name?: string): Promise<string | null> {
    if (!email && !name) return null;
    const rows = await this.dataSource.query(
      'SELECT id FROM "Users" WHERE status = $1 AND (email = $2 OR name = $3) LIMIT 1',
      ['Ativo', email ?? '', name ?? ''],
    ) as Array<{ id: string }>;
    return rows[0]?.id ?? null;
  }

  private generateInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts.at(-1)?.[0]}`.toUpperCase();
  }

  private getStatusId(statusName?: string): string {
    if (statusName === 'Pendente' || statusName === 'Aguardando confirmação') return 'status-aguardando';
    if (statusName === 'Cancelado') return 'status-cancelado';
    if (statusName === 'Concluído') return 'status-concluido';
    return 'status-confirmado';
  }
}
