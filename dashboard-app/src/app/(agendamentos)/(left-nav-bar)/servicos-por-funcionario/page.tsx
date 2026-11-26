import { notFound } from "next/navigation";
import { getCurrentSessionAction } from "@core/application/query/controller/users/auth.controller";
import { fetchUsersAction } from "@core/application/query/controller/users/user.controller";
import { fetchServicesAction } from "@core/application/query/controller/services/service.controller";
import { StaffServicesView } from "./staff-services-view";
import { listStaffUsers } from "@core/shared/staff-services-users";

export default async function StaffServicesPage() {
  const session = await getCurrentSessionAction();
  if (session?.role !== "Gestor" && session?.role !== "Administrador") notFound();

  const [users, services] = await Promise.all([fetchUsersAction(), fetchServicesAction()]);
  return <StaffServicesView
    users={listStaffUsers(users)}
    services={services}
  />;
}
