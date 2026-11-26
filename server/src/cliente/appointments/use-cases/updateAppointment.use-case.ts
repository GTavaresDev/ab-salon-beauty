import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto.js';
import { Appointment } from '../entities/appointment.entity.js';

@Injectable()
export class updateAppointmentUseCase {
  constructor(
    @InjectRepository(Appointment) private readonly appointmentsRepository: Repository<Appointment>,
    private readonly dataSource: DataSource,
  ) {}

  async update(id: string, input: UpdateAppointmentDto, scope: FindOptionsWhere<Appointment>): Promise<Appointment> {
    const current = await this.appointmentsRepository.findOne({ where: { ...scope, id } });
    if (!current) throw new NotFoundException('Agendamento não encontrado.');
    const data: Partial<Appointment> = {};
    for (const field of ['date', 'time', 'name', 'service', 'duration', 'statusName', 'channelId', 'notes', 'serviceId', 'userId'] as const) {
      if (input[field] !== undefined) Object.assign(data, { [field]: input[field] });
    }
    if (input.name !== undefined) data.initials = this.generateInitials(input.name);
    if (input.professionalName !== undefined || input.professionalEmail !== undefined) {
      data.userId = await this.findProfessionalId(input.professionalEmail, input.professionalName);
    }
    if (input.statusName !== undefined) data.statusId = this.getStatusId(input.statusName);
    const result = await this.appointmentsRepository.update({ ...scope, id }, data);
    if (!result.affected) throw new NotFoundException('Agendamento não encontrado.');
    return Object.assign(current, data);
  }

  private async findProfessionalId(email?: string, name?: string): Promise<string | null> {
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

  private getStatusId(statusName: string): string {
    if (statusName === 'Pendente' || statusName === 'Aguardando confirmação') return 'status-aguardando';
    if (statusName === 'Cancelado') return 'status-cancelado';
    if (statusName === 'Concluído') return 'status-concluido';
    return 'status-confirmado';
  }
}
