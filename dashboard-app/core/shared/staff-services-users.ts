import type { UserProps } from "@core/application/query/interface/user.entity";

export interface StaffServicesEmployee {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: "Funcionario" | "Gestor";
  serviceIds: string[];
}

export function listStaffUsers(users: UserProps[]): StaffServicesEmployee[] {
  const byId = new Map<string, StaffServicesEmployee>();
  for (const user of users) {
    if ((user.role !== "Funcionario" && user.role !== "Gestor") || byId.has(user.id)) continue;
    byId.set(user.id, {
      id: user.id,
      name: user.name,
      email: user.email,
      initials: user.initials,
      role: user.role,
      serviceIds: [...new Set(user.serviceIds ?? [])],
    });
  }
  return [...byId.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR") || a.email.localeCompare(b.email, "pt-BR"),
  );
}
