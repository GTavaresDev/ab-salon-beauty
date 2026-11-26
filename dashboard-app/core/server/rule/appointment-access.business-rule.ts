import type { StaffRole } from "@core/application/query/interface/user.entity";
import type { Appointment } from "@core/application/query/interface/appointment.entity";

export interface AgendaActor { id: string; role: StaffRole }

export function canManageAppointment(actor: AgendaActor, item: Appointment): boolean {
  return actor.role === "Administrador" || actor.role === "Gestor" || item.userId === actor.id;
}

export function canViewAppointment(actor: AgendaActor, item: Appointment): boolean {
  return actor.role === "Dono" || canManageAppointment(actor, item);
}
