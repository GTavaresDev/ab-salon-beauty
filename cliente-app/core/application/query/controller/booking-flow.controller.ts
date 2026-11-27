"use server";

import { decode, encode } from "@auth/core/jwt";
import { z } from "zod";
import { getApiToken } from "@/lib/client-agenda-token";
import { formatActionError } from "@/lib/action-error-handler";
import { toClientAppointmentDTO } from "@core/application/interfaces/appointments/client-appointment";
import type { ApiAppointment } from "../contract/appointment.contract";
import type { BookingFlow, BookingFlowResponse, BookingService } from "../contract/booking-flow.contract";
import { apiBaseUrl, clientHttp } from "../gateway/appointment.gateway";

const salt = "client-booking-selection";
const selectionSchema = z.object({ clientId: z.string(), serviceId: z.string(), userId: z.string() });
const bookingSchema = z.object({
  selection: z.string().min(1).max(4096),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function loadBookingFlow() {
  try {
    const token = await getApiToken();
    if (token.tag === "left") return { success: false as const, error: token.value.message };
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error("AUTH_SECRET não configurado");

    const result = await clientHttp<BookingFlowResponse>({
      url: `${apiBaseUrl()}/appointments/booking-flow`,
      headers: { authorization: `Bearer ${token.value.accessToken}` },
    });
    if (result.tag === "left") return { success: false as const, error: result.value.message };

    const services = new Map<string, BookingService>();
    for (const row of result.value.catalog) {
      let service = services.get(row.serviceId);
      if (!service) {
        service = {
          id: String(services.size), name: row.serviceName, description: row.description ?? "",
          durationMinutes: row.duration, professionals: [],
        };
        services.set(row.serviceId, service);
      }
      service.professionals.push({
        id: await encode({
          secret, salt, maxAge: 30 * 60,
          token: { clientId: token.value.clientId, serviceId: row.serviceId, userId: row.professionalId },
        }),
        name: row.professionalName, initials: row.initials,
      });
    }
    const data: BookingFlow = { services: [...services.values()], availability: result.value.availability };
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: formatActionError(error, "Não foi possível carregar a agenda.") };
  }
}

export async function confirmBooking(input: z.input<typeof bookingSchema>) {
  try {
    const parsed = bookingSchema.safeParse(input);
    if (!parsed.success) return { success: false as const, error: "Dados do agendamento inválidos." };
    const token = await getApiToken();
    if (token.tag === "left") return { success: false as const, error: token.value.message };
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error("AUTH_SECRET não configurado");

    const { selection, date, time } = parsed.data;
    const claims = selectionSchema.safeParse(
      await decode({ token: selection, secret, salt }).catch(() => null),
    );
    if (!claims.success || claims.data.clientId !== token.value.clientId) {
      return { success: false as const, refresh: true, error: "A seleção expirou. Escolha novamente." };
    }

    const result = await clientHttp<ApiAppointment>({
      url: `${apiBaseUrl()}/appointments`,
      method: "POST",
      headers: { authorization: `Bearer ${token.value.accessToken}` },
      body: { date, time, serviceId: claims.data.serviceId, userId: claims.data.userId },
    });
    if (result.tag === "left") {
      return {
        success: false as const, error: result.value.message,
        refresh: result.value.statusCode === 409 || result.value.statusCode === 400,
      };
    }
    return { success: true as const, data: toClientAppointmentDTO(result.value) };
  } catch (error) {
    return { success: false as const, error: formatActionError(error, "Não foi possível agendar.") };
  }
}
