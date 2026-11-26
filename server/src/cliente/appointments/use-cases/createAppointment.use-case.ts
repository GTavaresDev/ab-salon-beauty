import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateAppointmentDto } from '../dto/create-appointment.dto.js';
import { Appointment } from '../entities/appointment.entity.js';

@Injectable()
export class createAppointmentUseCase {
  constructor(
    @InjectRepository(Appointment) private readonly appointmentsRepository: Repository<Appointment>,
    private readonly dataSource: DataSource,
  ) {}

  async create(input: CreateAppointmentDto): Promise<Appointment> {
    const userId = input.userId ?? await this.findProfessionalId(input.professionalEmail, input.professionalName);
    const appointment = this.appointmentsRepository.create({
      id: crypto.randomUUID(), date: input.date, time: input.time, name: input.name,
      service: input.service, duration: input.duration, statusName: input.statusName ?? 'Confirmado',
      initials: this.generateInitials(input.name), channelId: input.channelId ?? 'site', notes: input.notes ?? null,
      userId: userId ?? null, clientId: input.clientId ?? null, serviceId: input.serviceId ?? null,
      statusId: this.getStatusId(input.statusName), updatedAt: new Date(),
    });
    return this.appointmentsRepository.save(appointment);
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
