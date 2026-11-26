import { PrismaAppointmentRepository } from "@core/server/db/repository/appointments/prisma-appointment.repository";
import { PrismaUserRepository } from "@core/server/db/repository/users/prisma-user.repository";
import { PrismaClientRepository } from "@core/server/db/repository/clients/prisma-client.repository";
import { PrismaServiceRepository } from "@core/server/db/repository/services/prisma-service.repository";
import { PrismaSaleRepository } from "@core/server/db/repository/sales/prisma-sale.repository";
import { GetDashboardMetrics } from "@core/server/use-case/reports/get-dashboard-metrics.use-case";
import { GetReportMetrics } from "@core/server/use-case/reports/get-report-metrics.use-case";

export function createReportGateway() {
  const appointments = new PrismaAppointmentRepository();
  const users = new PrismaUserRepository();
  const clients = new PrismaClientRepository();
  const services = new PrismaServiceRepository();
  const sales = new PrismaSaleRepository();
  return {
    appointments,
    users,
    clients,
    services,
    sales,
    dashboard: new GetDashboardMetrics(appointments, users, clients),
    report: new GetReportMetrics(appointments, users, services, sales),
  };
}
