import { canViewAppointment, type AgendaActor } from "@core/server/rule/appointment-access.business-rule";
import { Appointment } from "@core/application/query/interface/appointment.entity";
import { AppointmentRepository } from "@core/server/db/repository/appointment.repository";
import { isBookingTimeExpired } from "@core/server/rule/booking-time.business-rule";

export interface ListAppointmentsFilter {
  date?: string;
  search?: string;
  status?: string;
}

export class ListAppointments {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(actor: AgendaActor, filter?: ListAppointmentsFilter, now: Date = new Date()): Promise<Appointment[]> {
    let list: Appointment[];
    if (filter?.date) {
      list = await this.appointmentRepository.findByDate(filter.date);
    } else {
      list = await this.appointmentRepository.findAll();
    }

    list = list.filter((item) => canViewAppointment(actor, item));

    // Agendamentos que estavam "Pendente" e cujo horário já passou são cancelados automaticamente
    const expiredPending = list.filter(
      (a) => a.status === "Pendente" && isBookingTimeExpired(a.date, a.time, now, 0),
    );

    if (expiredPending.length > 0) {
      await Promise.all(
        expiredPending.map((a) => {
          const cancelled = new Appointment({
            id: a.id,
            date: a.date,
            time: a.time,
            name: a.name,
            service: a.service,
            duration: a.duration,
            status: "Cancelado",
            initials: a.initials,
            channelId: a.channelId,
            notes: a.notes,
            userId: a.userId,
            clientId: a.clientId,
            serviceId: a.serviceId,
            userName: a.userName,
            userRole: a.userRole,
            createdAt: a.createdAt,
          });
          return this.appointmentRepository.update(cancelled);
        }),
      );

      list = list.map((a) => {
        if (a.status === "Pendente" && isBookingTimeExpired(a.date, a.time, now, 0)) {
          return new Appointment({
            id: a.id,
            date: a.date,
            time: a.time,
            name: a.name,
            service: a.service,
            duration: a.duration,
            status: "Cancelado",
            initials: a.initials,
            channelId: a.channelId,
            notes: a.notes,
            userId: a.userId,
            clientId: a.clientId,
            serviceId: a.serviceId,
            userName: a.userName,
            userRole: a.userRole,
            createdAt: a.createdAt,
          });
        }
        return a;
      });
    }

    if (filter?.search) {
      const term = filter.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.service?.toLowerCase().includes(term),
      );
    }

    if (filter?.status && filter.status !== "Todos") {
      list = list.filter((a) => a.status === filter.status);
    }

    return list;
  }
}

