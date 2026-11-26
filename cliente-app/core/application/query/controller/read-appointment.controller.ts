"use server";

import type { ActionResult } from "@core/application/query/http/action";
import { revalidatePath } from "next/cache";
import { type ClientAppointmentDTO, type ClientAppointmentsView } from "@core/application/interfaces/appointments/client-appointment";
import { formatActionError } from "@/lib/action-error-handler";
import { ClientAuthRequiredError, requireClientSession } from "@/lib/client-session";
import { cancelMyAppointmentGateway, getMyAppointmentGateway, getMyAppointmentsGateway } from "@core/application/query/gateway/appointment.gateway";
import { prisma } from "@core/infrastructure/shared/client";

export type PendingAppointmentReview = { appointmentId: string; date: string; time: string; professionalName: string | null };

/** Só os agendamentos do cliente autenticado — o filtro é da consulta. */
export async function getClientAppointmentsAction(): Promise<ActionResult<ClientAppointmentsView>> {
  const result = await getMyAppointmentsGateway();
  if (result.tag === "left") {
    console.error("Falha na consulta de agendamentos do portal", {
      code: result.value.code,
      statusCode: result.value.statusCode,
    });
    return { success: false, error: "Não foi possível carregar seus agendamentos. Tente novamente em instantes." };
  }
  return { success: true, data: result.value };
}

export const getMyAppointmentsController = getClientAppointmentsAction;

export async function getPendingReviewsAction(): Promise<PendingAppointmentReview[]> {
  try {
    const session = await requireClientSession();
    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: session.clientId,
        status: "Concluído",
        userId: { not: null },
        // A dispensa da pesquisa no painel da equipe não encerra a avaliação no portal.
        OR: [{ review: null }, { review: { is: { rating: null } } }],
      },
      select: { id: true, date: true, time: true, user: { select: { name: true } } },
      orderBy: [{ date: "desc" }, { time: "desc" }],
    });
    return appointments.map((appointment) => ({
      appointmentId: appointment.id,
      date: appointment.date,
      time: appointment.time,
      professionalName: appointment.user?.name ?? null,
    }));
  } catch (error) {
    if (!(error instanceof ClientAuthRequiredError)) {
      const code = typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
        ? error.code
        : undefined;
      console.error("Falha na consulta de avaliações pendentes do portal", { code });
    }
    return [];
  }
}

export async function submitAppointmentReviewAction(appointmentId: string, rating: number): Promise<ActionResult<void>> {
  try {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { success: false, error: "Escolha uma nota de 1 a 5." };
    const session = await requireClientSession();
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, clientId: session.clientId, status: "Concluído", userId: { not: null } },
      select: { id: true, clientId: true, userId: true },
    });
    if (!appointment?.clientId || !appointment.userId) return { success: false, error: "Atendimento concluído não encontrado para este cliente." };
    try {
      const existingReview = await prisma.appointmentReview.findUnique({ where: { appointmentId } });
      if (existingReview) {
        if (existingReview.clientId !== session.clientId || existingReview.rating !== null) {
          return { success: false, error: "Este atendimento já foi avaliado." };
        }
        const saved = await prisma.appointmentReview.updateMany({
          where: { id: existingReview.id, clientId: session.clientId, rating: null },
          data: { attendantId: appointment.userId, rating, reviewedAt: new Date(), dismissedAt: null },
        });
        if (saved.count === 0) return { success: false, error: "Este atendimento já foi avaliado." };
      } else {
        await prisma.appointmentReview.create({
          data: { appointmentId: appointment.id, clientId: appointment.clientId, attendantId: appointment.userId, rating, reviewedAt: new Date() },
        });
      }
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        return { success: false, error: "Este atendimento já foi avaliado." };
      }
      throw error;
    }
    revalidatePath("/cliente/painel");
    revalidatePath("/cliente/painel/meus-agendamentos");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Não foi possível enviar sua avaliação." };
  }
}

export async function getClientAppointmentAction(
  id: string,
): Promise<ClientAppointmentDTO | null> {
  const result = await getMyAppointmentGateway(id);
  if (result.tag === "left") throw new Error(result.value.message);
  return result.value;
}

export async function cancelClientAppointmentAction(
  id: string,
): Promise<ActionResult<null>> {
  try {
    const result = await cancelMyAppointmentGateway(id);
    if (result.tag === "left") return { success: false, error: result.value.message };

    revalidatePath("/cliente/painel/meus-agendamentos");
    revalidatePath("/cliente/painel");
    return { success: true, data: result.value };
  } catch (error) {
    return { success: false, error: formatActionError(error, "Erro ao cancelar agendamento.") };
  }
}
