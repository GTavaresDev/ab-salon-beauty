import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Optional, BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { CurrentClientAgendaActor, clientAgendaScope } from '../../security/client/client-agenda.guard.js';
import type { ClientAgendaActor } from '../../security/client/client-agenda.guard.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { Appointment, AppointmentReview } from './entities/appointment.entity.js';
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

import { clientBooking, clientEditableScope, clientReschedule } from '../../security/client/client-appointment-transitions.js';

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
    @InjectRepository(Appointment) private readonly appointmentRecords: Repository<Appointment>,
    @InjectRepository(AppointmentReview) private readonly reviews: Repository<AppointmentReview>,
  ) {}

  @Post()
  create(@Body() input: CreateAppointmentDto, @CurrentClientAgendaActor() actor: ClientAgendaActor) {
    if (actor.issuer === 'client') return this.createAppointment.create(clientBooking(input, actor.sub));
    return this.createAppointment.create({
      ...input,
      userId: input.userId ?? actor.sub,
    });
  }

  @Get('client/:clientId')
  findByClient(@Param('clientId') clientId: string, @CurrentClientAgendaActor() actor: ClientAgendaActor) {
    return this.appointmentsByClientUseCase.findByClient(clientId, clientAgendaScope(actor));
  }

  @Get('reviews/pending')
  async pendingReviews(@CurrentClientAgendaActor() actor: ClientAgendaActor) {
    if (actor.issuer !== 'client') throw new ForbiddenException('Acesso não permitido.');
    return this.appointmentRecords.query(
      'SELECT a."id" AS "appointmentId", a."date", a."time", u."name" AS "professionalName" FROM "Appointments" a LEFT JOIN "AppointmentReviews" r ON r."appointmentId" = a."id" LEFT JOIN "Users" u ON u."id" = a."userId" WHERE a."clientId" = $1 AND a."status" = $2 AND r."id" IS NULL ORDER BY a."date" DESC, a."time" DESC',
      [actor.sub, 'Concluído'],
    );
  }

  @Post('reviews/:appointmentId')
  async submitReview(@Param('appointmentId') appointmentId: string, @Body() body: { rating?: unknown }, @CurrentClientAgendaActor() actor: ClientAgendaActor) {
    if (actor.issuer !== 'client') throw new ForbiddenException('Acesso não permitido.');
    const rating = Number(body?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new BadRequestException('A nota deve ser de 1 a 5.');
    const appointment = await this.appointmentRecords.findOne({ where: { id: appointmentId, clientId: actor.sub } });
    if (!appointment) throw new NotFoundException('Atendimento não encontrado.');
    if (appointment.statusName !== 'Concluído' || !appointment.userId) throw new BadRequestException('Este atendimento não pode receber avaliação.');
    try {
      const review = this.reviews.create({ id: randomUUID(), appointmentId, clientId: actor.sub, attendantId: appointment.userId, rating, reviewedAt: new Date() });
      await this.reviews.save(review);
      return { success: true };
    } catch (error) {
      if ((error as { code?: string })?.code === '23505') throw new ConflictException('Este atendimento já foi avaliado.');
      throw error;
    }
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
  async update(@Param('id') id: string, @Query('clientId') clientId: string | undefined, @Body() input: UpdateAppointmentDto, @CurrentClientAgendaActor() actor: ClientAgendaActor) {
    assertSubmittedClientId(actor, input.clientId ?? clientId);
    if (actor.issuer === 'client') {
      await this.appointmentOwnership.assertOwner(id, actor.sub);
      const changes = clientReschedule(input);
      return this.updateAppointment.update(id, changes, clientEditableScope(actor.sub));
    }
    return this.updateAppointment.update(id, input, clientAgendaScope(actor));
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Query('clientId') clientId: string | undefined, @CurrentClientAgendaActor() actor: ClientAgendaActor) {
    assertSubmittedClientId(actor, clientId);
    if (actor.issuer === 'client') {
      await this.appointmentOwnership.assertOwner(id, actor.sub);
      return this.updateAppointment.update(id, { statusName: 'Cancelado' }, clientEditableScope(actor.sub));
    }
    return this.deleteAppointment.remove(id, clientAgendaScope(actor));
  }

}
