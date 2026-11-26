import { durationLabelFromMinutes, minutesFromDuration } from "@core/server/rule/appointment-duration";
import { findAvailableStartTimes } from "@core/server/rule/availability.business-rule";
import { Appointment } from "@core/application/query/interface/appointment.entity";
import { AppointmentRepository } from "@core/server/db/repository/appointment.repository";
import {
  ClientScheduleConflictError,
  hasClientScheduleConflict,
} from "@core/server/rule/client-schedule-conflict.business-rule";

export interface CreateAppointmentInput {
  date: string;
  time: string;
  name: string;
  service: string;
  duration?: string;
  status?: "Confirmado" | "Pendente" | "Concluído" | "Cancelado";
  channelId?: string;
  notes?: string;
  userId: string;
  clientId?: string;
  serviceId?: string;
}

export class CreateAppointment {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(input: CreateAppointmentInput, now = new Date(), allowPastBooking = false): Promise<Appointment> {
    if (!input.userId?.trim()) throw new Error("Profissional obrigatório.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !Number.isFinite(Date.parse(input.date)) || new Date(input.date).toISOString().slice(0, 10) !== input.date) throw new Error("Data inválida.");
    const minutes = minutesFromDuration(input.duration ?? "30 min");
    const duration = durationLabelFromMinutes(minutes);
    const status = input.status || "Confirmado";
    const dayAppointments = await this.appointmentRepository.findByDate(
      input.date,
    );

    const hasConflict = hasClientScheduleConflict(
      dayAppointments.map((appointment) => appointment.toJSON()),
      {
        date: input.date,
        time: input.time,
        duration,
        name: input.name,
        clientId: input.clientId || null,
      },
    );

    if (hasConflict) {
      throw new ClientScheduleConflictError();
    }

    const available = findAvailableStartTimes(dayAppointments.map((item) => item.toJSON()), {
      date: input.date, serviceMinutes: minutes, clientId: input.clientId ?? "",
      clientName: input.name, now, allowPastBooking,
    });
    if (!available.includes(input.time)) throw new Error("Horário indisponível.");
    const initials = Appointment.generateInitials(input.name);
    const appointment = new Appointment({
      id: crypto.randomUUID(),
      date: input.date,
      time: input.time,
      name: input.name,
      service: input.service || "Consulta",
      duration,
      status,
      initials,
      channelId: input.channelId || "site",
      notes: input.notes || null,
      userId: input.userId || null,
      clientId: input.clientId || null,
      serviceId: input.serviceId || null,
    });

    return await this.appointmentRepository.save(appointment);
  }
}
