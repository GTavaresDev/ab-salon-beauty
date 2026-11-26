"use server";

import type { ActionResult } from "@core/application/query/http/action";
import type { ClientAppointmentDTO } from "@core/application/interfaces/appointments/client-appointment";
import { durationLabelFromMinutes } from "@core/application/query/appointment-duration";
import { getBookableServicesGateway } from "@core/application/query/gateway/service.gateway";
import { getBookableProfessionalsGateway } from "@core/application/query/gateway/professional.gateway";
import { updateAppointmentGateway } from "@core/application/query/gateway/appointment.gateway";
import { getAvailableTimesGateway } from "@core/application/query/gateway/date.gateway";
import { formatActionError } from "@/lib/action-error-handler";
import { requireClientSession } from "@/lib/client-session";
import { z } from "zod";

const idSchema = z.string().trim().min(1).max(64);
const updateSchema = z.object({
  appointmentId: idSchema,
  serviceId: idSchema,
  professionalId: idSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function updateClientAppointmentAction(input: z.infer<typeof updateSchema>): Promise<ActionResult<ClientAppointmentDTO>> {
  try {
    const session = await requireClientSession();
    const parsed = updateSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Dados do agendamento inválidos." };
    const [servicesResult, professionalsResult] = await Promise.all([
      getBookableServicesGateway(session.clientId),
      getBookableProfessionalsGateway(session.clientId, parsed.data.serviceId),
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
    const availableResult = await getAvailableTimesGateway(session.clientId, service.id, parsed.data.date);
    const available = availableResult.tag === "right" ? availableResult.value : [];
    if (!available.includes(parsed.data.time)) return { success: false, error: "Este horário não está disponível. Escolha outro horário." };
    const updated = await updateAppointmentGateway(session.clientId, parsed.data.appointmentId, {
      date: parsed.data.date, time: parsed.data.time, name: session.name, service: service.name,
      duration: durationLabelFromMinutes(service.durationMinutes), professionalName: professional.name,
      userId: professional.id, serviceId: service.id,
    });
    if (updated.tag === "left") return { success: false, error: updated.value.message };
    return { success: true, data: updated.value };
  } catch (error) {
    return { success: false, error: formatActionError(error, "Não foi possível alterar o agendamento.") };
  }
}
