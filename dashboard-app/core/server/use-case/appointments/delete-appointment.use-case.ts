import { canManageAppointment, type AgendaActor } from "@core/server/rule/appointment-access.business-rule";
import { AppointmentRepository } from "@core/server/db/repository/appointment.repository";

export class DeleteAppointment {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(actor: AgendaActor, id: string): Promise<void> {
    const existing = await this.appointmentRepository.findById(id);
    if (!existing || !canManageAppointment(actor, existing)) {
      throw new Error("Agendamento não encontrado.");
    }
    await this.appointmentRepository.delete(id);
  }
}
