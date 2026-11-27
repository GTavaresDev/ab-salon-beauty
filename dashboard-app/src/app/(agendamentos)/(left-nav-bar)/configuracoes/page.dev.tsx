import type { Metadata } from "next";
import { getCurrentSessionAction } from "@core/application/query/controller/users/auth.controller";
import { redirect } from "next/navigation";
import { SettingsView } from "./_components/settings-view.component";

export const metadata: Metadata = {
  title: "Configurações — Agendamentos",
  description: "Gerencie preferências e recursos do sistema.",
};

export default async function SettingsPage() {
  const session = await getCurrentSessionAction();
  if (!session) redirect("/login");
  if (session.role !== "Administrador") {
    redirect("/dashboard");
  }

  return <SettingsView />;
}
