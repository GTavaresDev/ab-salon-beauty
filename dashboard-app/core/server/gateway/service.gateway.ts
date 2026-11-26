import { PrismaServiceRepository } from "@core/server/db/repository/services/prisma-service.repository";
import { PrismaAppointmentRepository } from "@core/server/db/repository/appointments/prisma-appointment.repository";
import { CreateService } from "@core/server/use-case/services/create-service.use-case";
import { ListServices } from "@core/server/use-case/services/list-services.use-case";
import { UpdateService } from "@core/server/use-case/services/update-service.use-case";
import { DeleteService } from "@core/server/use-case/services/delete-service.use-case";

export function createServiceGateway() {
  const services = new PrismaServiceRepository();
  const appointments = new PrismaAppointmentRepository();
  return {
    services,
    appointments,
    create: new CreateService(services),
    list: new ListServices(services),
    update: new UpdateService(services),
    delete: new DeleteService(services, appointments),
  };
}
