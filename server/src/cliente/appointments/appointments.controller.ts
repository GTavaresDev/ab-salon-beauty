import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Optional } from '@nestjs/common';
import { CurrentClientAgendaActor, clientAgendaScope } from '../../security/client/client-agenda.guard.js';
import type { ClientAgendaActor } from '../../security/client/client-agenda.guard.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';
import { getAppointmentsByClientUseCase } from './use-cases/getAppointmentsByClient.use-case.js';
import { getAppointmentsByIdUseCase } from './use-cases/getAppointmentsById.use-case.js';
import { deleteAppointmentUseCase } from './use-cases/deleteAppointment.use-case.js';
import { createAppointmentUseCase } from './use-cases/createAppointment.use-case.js';
import { updateAppointmentUseCase } from './use-cases/updateAppointment.use-case.js';
import { getServicesUseCase } from './use-cases/getServices.use-case.js';
import { getProfessionalsUseCase } from './use-cases/getProfessionals.use-case.js';
import { getDateUseCase } from './use-cases/getDate.use-case.js';
import { AppointmentOwnershipUseCase, assertSubmittedClientId } from '../../security/client/appointment-ownership.use-case.js';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsByClientUseCase: getAppointmentsByClientUseCase,
    private readonly appointmentsByUserId: getAppointmentsByIdUseCase,
    private readonly deleteAppointment: deleteAppointmentUseCase,
    private readonly createAppointment: createAppointmentUseCase,
    private readonly updateAppointment: updateAppointmentUseCase,
    private readonly getServices: getServicesUseCase,
    private readonly getProfessionals: getProfessionalsUseCase,
    @Optional() private readonly getDates: getDateUseCase,
    private readonly appointmentOwnership: AppointmentOwnershipUseCase,
  ) {}

  @Post()
  create(@Body() input: CreateAppointmentDto, @CurrentClientAgendaActor() actor: ClientAgendaActor) {
    return this.createAppointment.create({
      ...input,
      userId: input.userId ?? actor.sub,
      clientId: actor.issuer === 'client' ? actor.sub : input.clientId,
    });
  }

  @Get('client/:clientId')
  findByClient(@Param('clientId') clientId: string, @CurrentClientAgendaActor() actor: ClientAgendaActor) {
    return this.appointmentsByClientUseCase.findByClient(clientId, clientAgendaScope(actor));
  }

  @Get('services')
  findServices() {
    return this.getServices.execute();
  }

  @Get('professionals')
  findProfessionals(@Query('serviceId') serviceId?: string) {
    return this.getProfessionals.execute(serviceId ?? '');
  }

  @Get('dates')
  findDates(@Query('serviceId') serviceId: string, @CurrentClientAgendaActor() actor: ClientAgendaActor) {
    return this.getDates.execute(serviceId, actor.sub);
  }

  @Get('times')
  findTimes(@Query('serviceId') serviceId: string, @Query('date') date: string, @CurrentClientAgendaActor() actor: ClientAgendaActor) {
    return this.getDates.executeTimes(serviceId, date, actor.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentClientAgendaActor() actor: ClientAgendaActor) {
    return this.appointmentsByUserId.findOne(id, clientAgendaScope(actor));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Query('clientId') clientId: string | undefined, @Body() input: UpdateAppointmentDto, @CurrentClientAgendaActor() actor: ClientAgendaActor) {
    assertSubmittedClientId(actor, input.clientId ?? clientId);
    const ownership = actor.issuer === 'client'
      ? this.appointmentOwnership.assertOwner(id, actor.sub)
      : Promise.resolve();
    return ownership.then(() => this.updateAppointment.update(id, input, clientAgendaScope(actor)));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('clientId') clientId: string | undefined, @CurrentClientAgendaActor() actor: ClientAgendaActor) {
    assertSubmittedClientId(actor, clientId);
    const ownership = actor.issuer === 'client'
      ? this.appointmentOwnership.assertOwner(id, actor.sub)
      : Promise.resolve();
    return ownership.then(() => this.deleteAppointment.remove(id, clientAgendaScope(actor)));
  }

}
