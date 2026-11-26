import { findAvailableStartTimes } from "@core/server/rule/availability.business-rule";
import { minutesFromDuration } from "@core/server/rule/appointment-duration";
import { canManageAppointment, type AgendaActor } from "@core/server/rule/appointment-access.business-rule";
import { Appointment } from "@core/application/query/interface/appointment.entity";
import { AppointmentRepository } from "@core/server/db/repository/appointment.repository";
import { UserRepository } from "@core/server/db/repository/user.repository";

export class UpdateAppointmentStatus {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(
    actor: AgendaActor,
    id: string,
    status: "Confirmado" | "Pendente" | "Concluído" | "Cancelado",
    paymentMethod?: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência" | "Outro",
  ): Promise<Appointment> {
    const existing = await this.appointmentRepository.findById(id);
    if (!existing || !canManageAppointment(actor, existing)) {
      throw new Error("Agendamento não encontrado.");
    }
    const paymentMethods = ["Pix", "Dinheiro", "Crédito", "Débito", "Transferência", "Outro"];
    if (status === "Concluído" && paymentMethod && !paymentMethods.includes(paymentMethod)) {
      throw new Error("Forma de pagamento inválida.");
    }
    if (status === "Concluído" && !paymentMethod && !existing.paymentMethod) {
      throw new Error("Informe a forma de pagamento para concluir o atendimento.");
    }

    if (!["Pendente", "Cancelado", "Concluído", "Confirmado"].includes(status)) throw new Error("Status inválido.");
    if (existing.status === "Cancelado" && status !== "Cancelado") {
      const day = await this.appointmentRepository.findByDate(existing.date);
      const available = findAvailableStartTimes(day.map((item) => item.toJSON()), {
        date: existing.date, serviceMinutes: minutesFromDuration(existing.duration),
        clientId: existing.clientId ?? "", clientName: existing.name,
      });
      if (!available.includes(existing.time)) throw new Error("Horário indisponível.");
    }
    let commissionPercent = existing.commissionPercent;
    if (status === "Concluído" && commissionPercent == null) {
      const professional = existing.userId ? await this.userRepository.findById(existing.userId) : null;
      commissionPercent = professional?.commissionPercent ?? 0;
    }
    const updated = new Appointment({
      ...existing.toJSON(),
      status,
      commissionPercent,
      paymentMethod: status === "Concluído" ? paymentMethod ?? existing.paymentMethod : existing.paymentMethod,
    });

    return await this.appointmentRepository.update(updated);
  }
}
