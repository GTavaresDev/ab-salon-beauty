import type { AppointmentRepository } from "@core/server/db/repository/appointment.repository";
import { occupiedSlots } from "@core/server/rule/appointment-duration";

export class GetOccupiedSlots {
  constructor(private readonly appointments: AppointmentRepository) {}

  async execute(date: string): Promise<string[]> {
    const items = await this.appointments.findByDate(date);
    return [...new Set(items.filter((item) => item.status !== "Cancelado")
      .flatMap((item) => occupiedSlots(item.time, item.duration)))];
  }
}
