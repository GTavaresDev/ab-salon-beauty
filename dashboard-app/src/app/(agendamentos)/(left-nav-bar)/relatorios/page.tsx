import type { Metadata } from "next";
import { getCurrentSessionAction } from "@core/application/query/controller/users/auth.controller";
import { redirect } from "next/navigation";
import { canAccessReports } from "@/lib/permissions";
import { ReportsDashboard } from "./_components/reports-dashboard.component";

export const metadata: Metadata = {
  title: "Relatórios — Agendamentos",
  description: "Indicadores e análises dos agendamentos.",
};

export default async function ReportsPage() {
  const session = await getCurrentSessionAction();
  const hasReportsPermission = canAccessReports(session);

  if (!hasReportsPermission) {
    redirect("/dashboard");
  }

  return <ReportsDashboard />;
}
