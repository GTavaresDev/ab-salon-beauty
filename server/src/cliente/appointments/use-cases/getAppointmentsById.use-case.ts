import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { Appointment } from '../entities/appointment.entity.js';

@Injectable()
export class getAppointmentsByIdUseCase {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
  ) {}

  async findOne(
    id: string,
    scope: FindOptionsWhere<Appointment>,
  ): Promise<Appointment[]> {
    const rows = await this.appointmentsRepository.find({
      where: { ...scope, id },
      relations: {
        status: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    if (!rows.length) throw new NotFoundException();
    return rows;
  }
}
