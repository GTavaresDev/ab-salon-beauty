import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { Appointment } from '../entities/appointment.entity.js';

export type ClientAppointmentResponse = {
  id: string;
  date: string;
  time: string;
  serviceName: string;
  duration: string;
  professionalName: string | null;
  statusName: string;
};

/**
 * Busca os agendamentos pertencentes a um cliente específico.
 *
 * O filtro deve usar `clientId`, que identifica o cliente dono do
 * agendamento. `userId` identifica o profissional responsável e não deve ser
 * usado nesta consulta.
 */
@Injectable()
export class getAppointmentsByClientUseCase {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
  ) {}

  async findByClient(
    clientId: string,
    scope: FindOptionsWhere<Appointment>,
  ): Promise<ClientAppointmentResponse[]> {
    const appointments = await this.appointmentsRepository.find({
      where: { ...scope, clientId },
      relations: {
        status: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return appointments.map((appointment) => ({
      id: appointment.id,
      date: appointment.date,
      time: appointment.time,
      serviceName: appointment.service ?? 'Atendimento',
      duration: appointment.duration,
      professionalName: null,
      statusName: appointment.statusName,
    }));
  }
}
