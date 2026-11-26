import { PrismaAppointmentRepository } from "@core/server/db/repository/appointments/prisma-appointment.repository";
import { PrismaServiceRepository } from "@core/server/db/repository/services/prisma-service.repository";
import { ListAppointments } from "@core/server/use-case/appointments/list-appointments.use-case";
import { CreateAppointment } from "@core/server/use-case/appointments/create-appointment.use-case";
import { UpdateAppointmentStatus } from "@core/server/use-case/appointments/update-appointment-status.use-case";
import { DeleteAppointment } from "@core/server/use-case/appointments/delete-appointment.use-case";
import { GetOccupiedSlots } from "@core/server/use-case/appointments/staff-availability.use-case";
import { PrismaUserRepository } from "@core/server/db/repository/users/prisma-user.repository";

export function createAppointmentGateway() {
  const appointments = new PrismaAppointmentRepository();
  const services = new PrismaServiceRepository();
  const users = new PrismaUserRepository();
  return {
    appointments,
    services,
    list: new ListAppointments(appointments),
    create: (repository = appointments) => new CreateAppointment(repository),
    updateStatus: (repository = appointments) => new UpdateAppointmentStatus(repository, users),
    delete: new DeleteAppointment(appointments),
    occupiedSlots: new GetOccupiedSlots(appointments),
  };
}
