import { pendingPortalClients } from "@core/application/query/controller/clients/portal-approval.controller";
import { PortalApproval } from "./_components/portal-approval.component";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ClientsView } from "./_components/clients-view.component";

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const pending = await pendingPortalClients();
  return <><PortalApproval clients={pending} /><ClientsView /></>;
}
