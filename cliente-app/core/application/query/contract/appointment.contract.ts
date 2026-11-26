import type { ClientAppointmentDTO } from "@core/application/interfaces/appointments/client-appointment";

export type RequestError = { message: string; statusCode?: number; code?: string };
export type HttpRequest = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
};
export type ApiAppointment = {
  id: string; date: string; time: string; service?: string | null; serviceName?: string;
  duration: string; statusName?: string; userName?: string | null; professionalName?: string | null;
};
export type CreateAppointmentRequest = {
  date: string; time: string; name: string; service: string; duration: string;
  userId?: string; professionalName?: string; professionalEmail?: string;
  serviceId: string; statusName: string; channelId: string;
};
export type UpdateAppointmentRequest = Partial<CreateAppointmentRequest>;
export type AppointmentResult = ClientAppointmentDTO;
