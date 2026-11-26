import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../../cliente/appointments/entities/appointment.entity.js';
import type { ClientAgendaActor } from './client-agenda.guard.js';

export function assertSubmittedClientId(
  actor: ClientAgendaActor,
  submittedClientId?: string | null,
): void {
  if (
    actor.issuer === 'client' &&
    submittedClientId !== undefined &&
    submittedClientId !== actor.sub
  ) {
    throw new ForbiddenException(
      'clientId inválido para o usuário autenticado.',
    );
  }
}

@Injectable()
export class AppointmentOwnershipUseCase {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
  ) {}

  async assertOwner(id: string, authenticatedClientId: string): Promise<void> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
    });
    if (!appointment)
      throw new NotFoundException('Agendamento não encontrado.');
    if (appointment.clientId !== authenticatedClientId) {
      throw new ForbiddenException('Você não pode alterar este agendamento.');
    }
  }
}
