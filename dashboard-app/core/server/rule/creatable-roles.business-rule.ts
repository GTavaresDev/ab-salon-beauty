import type { StaffRole } from "@core/application/query/interface/user.entity";
import { z } from "zod";

const permissionLevelSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export function parseCreatablePermissionLevel(value: unknown): 1 | 2 | 3 | null {
  const parsed = permissionLevelSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

// Dono is a legacy technical role and cannot be assigned through user flows.
const CREATABLE_ROLES: Record<StaffRole, readonly StaffRole[]> = {
  Dono: [],
  Administrador: ["Gestor", "Funcionario"],
  Gestor: ["Funcionario"],
  Funcionario: [],
};

export function canCreateRole(actorRole: StaffRole, targetRole: StaffRole): boolean {
  return CREATABLE_ROLES[actorRole].includes(targetRole);
}

export function assertCanCreateRole(actorRole: StaffRole, targetRole: StaffRole): void {
  if (!canCreateRole(actorRole, targetRole)) {
    throw new Error("Operação não permitida");
  }
}
