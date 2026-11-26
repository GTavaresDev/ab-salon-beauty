import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller.js';
import {
  Appointment,
  AppointmentStatus,
  AppointmentChannel,
} from './entities/appointment.entity.js';
import { getAppointmentsByClientUseCase } from './use-cases/getAppointmentsByClient.use-case.js';
import { getAppointmentsByIdUseCase } from './use-cases/getAppointmentsById.use-case.js';
import { deleteAppointmentUseCase } from './use-cases/deleteAppointment.use-case.js';
import { createAppointmentUseCase } from './use-cases/createAppointment.use-case.js';
import { updateAppointmentUseCase } from './use-cases/updateAppointment.use-case.js';
import { getServicesUseCase } from './use-cases/getServices.use-case.js';
import { getProfessionalsUseCase } from './use-cases/getProfessionals.use-case.js';
import { getDateUseCase } from './use-cases/getDate.use-case.js';
import { AppointmentOwnershipUseCase } from '../../security/client/appointment-ownership.use-case.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      AppointmentStatus,
      AppointmentChannel,
    ]),
  ],
  controllers: [AppointmentsController],
  providers: [
    getAppointmentsByClientUseCase,
    getAppointmentsByIdUseCase,
    deleteAppointmentUseCase,
    createAppointmentUseCase,
    updateAppointmentUseCase,
    getServicesUseCase,
    getProfessionalsUseCase,
    getDateUseCase,
    AppointmentOwnershipUseCase,
  ],
  exports: [
    getAppointmentsByClientUseCase,
    getAppointmentsByIdUseCase,
    deleteAppointmentUseCase,
    createAppointmentUseCase,
    updateAppointmentUseCase,
    getServicesUseCase,
    getProfessionalsUseCase,
    getDateUseCase,
    AppointmentOwnershipUseCase,
  ],
})
export class AppointmentsModule {}
