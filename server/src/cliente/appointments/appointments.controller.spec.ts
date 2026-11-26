import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppointmentsController } from './appointments.controller.js';
import { Appointment, AppointmentReview } from './entities/appointment.entity.js';
import { getAppointmentsByClientUseCase } from './use-cases/getAppointmentsByClient.use-case.js';
import { getAppointmentsByIdUseCase } from './use-cases/getAppointmentsById.use-case.js';
import { deleteAppointmentUseCase } from './use-cases/deleteAppointment.use-case.js';
import { createAppointmentUseCase } from './use-cases/createAppointment.use-case.js';
import { updateAppointmentUseCase } from './use-cases/updateAppointment.use-case.js';
import { getServicesUseCase } from './use-cases/getServices.use-case.js';
import { getProfessionalsUseCase } from './use-cases/getProfessionals.use-case.js';
import { AppointmentOwnershipUseCase } from '../../security/client/appointment-ownership.use-case.js';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        getAppointmentsByClientUseCase,
        getAppointmentsByIdUseCase,
        deleteAppointmentUseCase,
        createAppointmentUseCase,
        updateAppointmentUseCase,
        getServicesUseCase,
        getProfessionalsUseCase,
        AppointmentOwnershipUseCase,
        {
          provide: getRepositoryToken(Appointment),
          useValue: {
            find: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(AppointmentReview),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: { query: vi.fn() },
        },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
