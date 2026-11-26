import { getCurrentSessionAction } from "@core/application/query/controller/users/auth.controller";
import { canAccessUsers } from "@/lib/permissions";
import { notFound } from "next/navigation";
import { UsersView } from "./_components/users-view.component";

export default async function UsersPage() {
  const session = await getCurrentSessionAction();
  const hasUsersPermission = canAccessUsers(session);

  if (!hasUsersPermission) {
    notFound();
  }

  return <UsersView />;
}
