import { Appointment as PrismaAppointmentModel } from "@prisma/client";
import { Appointment } from "@core/application/query/interface/appointment.entity";
import { roleFromPermissions } from "@core/server/db/repository/users/user.mapper";

type AppointmentWithRelations = PrismaAppointmentModel & {
  user?: { name: string; permissions: Array<{ name: string; enabled: boolean }> } | null;
  serviceRecord?: { price: number | null; color: string | null } | null;
  client?: { phone: string } | null;
};

const DEFAULT_STATUS_IDS: Record<string, string> = {
  Confirmado: "status-confirmado",
  Pendente: "status-aguardando",
  "Aguardando confirmação": "status-aguardando",
  Concluído: "status-concluido",
  Cancelado: "status-cancelado",
};

export class AppointmentMapper {
  public static toDomain(raw: AppointmentWithRelations): Appointment {
    return new Appointment({
      id: raw.id,
      date: raw.date,
      time: raw.time,
      name: raw.name,
      service: raw.service,
      duration: raw.duration,
      status: raw.status as "Confirmado" | "Pendente" | "Concluído" | "Cancelado",
      statusId: raw.statusId || null,
      initials: raw.initials,
      channelId: raw.channelId,
      notes: raw.notes,
      userId: raw.userId,
      clientId: raw.clientId,
      serviceId: raw.serviceId,
      servicePrice: raw.serviceRecord?.price || null,
      serviceColor: raw.serviceRecord?.color || null,
      commissionPercent: raw.commissionPercent,
      paymentMethod: raw.paymentMethod as Appointment["paymentMethod"],
      userName: raw.user?.name || null,
      userRole: raw.user ? roleFromPermissions(raw.user.permissions) : null,
      clientPhone: raw.client?.phone || null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toPersistence(appointment: Appointment): {
    id: string;
    date: string;
    time: string;
    name: string;
    service: string | null;
    duration: string;
    status: string;
    statusId: string | null;
    initials: string;
    channelId: string;
    notes: string | null;
    userId: string | null;
    clientId: string | null;
    serviceId?: string | null;
    commissionPercent: number | null;
    paymentMethod: string | null;
  } {
    return {
      id: appointment.id,
      date: appointment.date,
      time: appointment.time,
      name: appointment.name,
      service: appointment.service,
      duration: appointment.duration,
      status: appointment.status,
      statusId: appointment.statusId || DEFAULT_STATUS_IDS[appointment.status] || null,
      initials: appointment.initials,
      channelId: appointment.channelId,
      notes: appointment.notes || null,
      userId: appointment.userId || null,
      clientId: appointment.clientId || null,
      serviceId: appointment.serviceId || null,
      commissionPercent: appointment.commissionPercent ?? null,
      paymentMethod: appointment.paymentMethod ?? null,
    };
  }
}
