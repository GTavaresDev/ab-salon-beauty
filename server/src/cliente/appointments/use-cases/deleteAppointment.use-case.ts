import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { Appointment } from '../entities/appointment.entity.js';

@Injectable()
export class deleteAppointmentUseCase {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
  ) {}

  async remove(
    id: string,
    scope: FindOptionsWhere<Appointment>,
  ): Promise<DeleteResult> {
    const result = await this.appointmentsRepository.delete({ ...scope, id });
    if (!result.affected) throw new NotFoundException();
    return result;
  }
}
