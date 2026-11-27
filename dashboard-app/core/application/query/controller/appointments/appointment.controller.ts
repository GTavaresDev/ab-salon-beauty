"use server";

import { createAppointmentGateway } from "@core/server/gateway/appointment.gateway";
import type { ActionResult } from "@core/application/query/interface/action.interface";
import { withDayLock } from "@core/server/shared/day-lock";
import { durationLabelFromMinutes } from "@core/server/rule/appointment-duration";
import { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { requireSessionAction } from "@core/application/query/controller/users/auth.controller";
import { formatActionError } from "@/lib/action-error-handler";
import { canManageAppointment } from "@core/server/rule/appointment-access.business-rule";
import { prisma } from "@core/server/db/prisma";

const { appointments: appointmentRepository, services: serviceRepository, list: listAppointments, create: createAppointment, updateStatus, delete: deleteAppointment, occupiedSlots } = createAppointmentGateway();

export async function fetchAppointmentsAction(filter?: {
  date?: string;
  search?: string;
  status?: string;
}): Promise<AppointmentProps[]> {
  const actor = await requireSessionAction();
  const useCase = listAppointments;
  const list = await useCase.execute(actor, filter);
  return list.map((a) => a.toJSON());
}

export async function createAppointmentAction(input: {
  date: string;
  time: string;
  name: string;
  service: string;
  duration?: string;
  allowPastBooking?: boolean;
  status?: "Confirmado" | "Pendente" | "Concluído" | "Cancelado";
  channelId?: string;
  notes?: string;
  clientId?: string;
  serviceId?: string;
}): Promise<ActionResult<AppointmentProps>> {
  try {
    const session = await requireSessionAction();
    let duration = input.duration;
    if (input.serviceId) {
      const service = await serviceRepository.findById(input.serviceId);
      if (!service || service.status !== "Ativo") throw new Error("Serviço indisponível.");
      duration = durationLabelFromMinutes(service.duration);
    }
    const created = await withDayLock(input.date, (appointments) => createAppointment(appointments).execute({
      ...input,
      duration,
      userId: session.id,
      status: "Confirmado",
    }, new Date(), process.env.NODE_ENV === "development" && session.role === "Administrador" && input.allowPastBooking === true));
    return { success: true, data: created.toJSON() };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao agendar.") };
  }
}

export async function updateAppointmentStatusAction(
  id: string,
  status: "Confirmado" | "Pendente" | "Concluído" | "Cancelado",
  paymentMethod?: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência" | "Outro",
): Promise<ActionResult<AppointmentProps>> {
  try {
    const actor = await requireSessionAction();
    const target = await appointmentRepository.findById(id);
    if (!target) throw new Error("Agendamento não encontrado.");
    const updated = await withDayLock(target.date, (appointments) =>
      updateStatus(appointments).execute(actor, id, status, paymentMethod));
    return { success: true, data: updated.toJSON() };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao atualizar agendamento.") };
  }
}

export async function dismissAppointmentReviewAction(id: string): Promise<ActionResult<void>> {
  try {
    const actor = await requireSessionAction();
    const appointment = await appointmentRepository.findById(id);
    if (!appointment || !canManageAppointment(actor, appointment)) {
      throw new Error("Agendamento não encontrado.");
    }
    if (appointment.status !== "Concluído" || !appointment.clientId || !appointment.userId) {
      throw new Error("Este atendimento não pode ser dispensado para pesquisa.");
    }

    await prisma.appointmentReview.upsert({
      where: { appointmentId: id },
      create: {
        appointmentId: id,
        clientId: appointment.clientId,
        attendantId: appointment.userId,
        dismissedAt: new Date(),
      },
      update: { dismissedAt: new Date() },
    });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Não foi possível dispensar a pesquisa.") };
  }
}

export async function deleteAppointmentAction(
  id: string,
): Promise<ActionResult<void>> {
  try {
    const actor = await requireSessionAction();
    const useCase = deleteAppointment;
    await useCase.execute(actor, id);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao excluir agendamento.") };
  }
}

export async function getOccupiedSlotsAction(date: string) {
  await requireSessionAction();
  return occupiedSlots.execute(date);
}
