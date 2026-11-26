"use server";

import type { ActionResult } from "@core/application/query/http/action";
import { z } from "zod";
import type { ClientAppointmentDTO } from "@core/application/interfaces/appointments/client-appointment";
import { durationLabelFromMinutes } from "@core/application/query/appointment-duration";
import { createAppointmentGateway } from "@core/application/query/gateway/appointment.gateway";
import { getAvailableTimesGateway } from "@core/application/query/gateway/date.gateway";
import { getBookableServicesGateway } from "@core/application/query/gateway/service.gateway";
import { getBookableProfessionalsGateway } from "@core/application/query/gateway/professional.gateway";
import { formatActionError } from "@/lib/action-error-handler";
import { requireClientSession } from "@/lib/client-session";


// Ids do banco não são só uuid (o seed usa "srv-1"), então valida formato genérico.
const idSchema = z.string().trim().min(1).max(64);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/);

const bookingSchema = z.object({
  serviceId: idSchema,
  professionalId: idSchema,
  date: dateSchema,
  time: timeSchema,
});

/**
 * Cria o agendamento do cliente autenticado.
 *
 * O cliente vem SEMPRE da sessão: um clientId enviado pelo formulário é
 * ignorado. A disponibilidade é revalidada dentro da trava do dia.
 */
export async function createClientAppointmentAction(input: {
  serviceId: string;
  professionalId: string;
  date: string;
  time: string;
}): Promise<ActionResult<ClientAppointmentDTO>> {
  try {
    const session = await requireClientSession();
    const parsed = bookingSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Dados do agendamento inválidos." };
    }

    const [servicesResult, professionalsResult] = await Promise.all([
      getBookableServicesGateway(),
      getBookableProfessionalsGateway(parsed.data.serviceId),
    ]);
    if (servicesResult.tag === "left") return { success: false, error: servicesResult.value.message };
    const service = servicesResult.value.find((item) => item.id === parsed.data.serviceId);
    const professional = professionalsResult.tag === "right"
      ? professionalsResult.value.find((item) => item.id === parsed.data.professionalId)
      : undefined;
    if (!service) return { success: false, error: "Serviço indisponível." };
    if (!professional || professional.role === "Administrador") {
      return { success: false, error: "Profissional indisponível." };
    }

    const availableResult = await getAvailableTimesGateway(service.id, parsed.data.date);
    const available = availableResult.tag === "right" ? availableResult.value : [];
    if (!available.includes(parsed.data.time)) {
      return { success: false, error: "Este horário não está mais disponível. Escolha outro horário." };
    }

    const created = await createAppointmentGateway({
      date: parsed.data.date,
      time: parsed.data.time,
      name: session.name,
      service: service.name,
      duration: durationLabelFromMinutes(service.durationMinutes),
      professionalName: professional.name,
      userId: professional.id,
      serviceId: service.id,
      statusName: "Pendente",
      channelId: "site",
    });
    if (created.tag === "left") return { success: false, error: created.value.message };

    return { success: true, data: created.value };
  } catch (error) {
    return { success: false, error: formatActionError(error, "Não foi possível agendar.") };
  }
}

