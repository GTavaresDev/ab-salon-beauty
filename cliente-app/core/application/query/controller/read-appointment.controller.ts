"use server";

import type { ActionResult } from "@core/application/query/http/action";
import { revalidatePath } from "next/cache";
import { type ClientAppointmentDTO, type ClientAppointmentsView } from "@core/application/interfaces/appointments/client-appointment";
import { formatActionError } from "@/lib/action-error-handler";
import { requireClientSession } from "@/lib/client-session";
import { cancelMyAppointmentGateway, getMyAppointmentGateway, getMyAppointmentsGateway } from "@core/application/query/gateway/appointment.gateway";

/** Só os agendamentos do cliente autenticado — o filtro é da consulta. */
export async function getClientAppointmentsAction(): Promise<ClientAppointmentsView> {
  const session = await requireClientSession();
  const result = await getMyAppointmentsGateway(session.clientId);
  if (result.tag === "left") throw new Error(result.value.message);
  return result.value;
}

export const getMyAppointmentsController = getClientAppointmentsAction;

export async function getClientAppointmentAction(
  id: string,
): Promise<ClientAppointmentDTO | null> {
  const session = await requireClientSession();
  const result = await getMyAppointmentGateway(session.clientId, id);
  if (result.tag === "left") throw new Error(result.value.message);
  return result.value;
}

export async function cancelClientAppointmentAction(
  id: string,
): Promise<ActionResult<null>> {
  try {
    const session = await requireClientSession();
    const result = await cancelMyAppointmentGateway(session.clientId, id);
    if (result.tag === "left") return { success: false, error: result.value.message };

    revalidatePath("/cliente/painel/meus-agendamentos");
    revalidatePath("/cliente/painel");
    return { success: true, data: result.value };
  } catch (error) {
    return { success: false, error: formatActionError(error, "Erro ao cancelar agendamento.") };
  }
}
