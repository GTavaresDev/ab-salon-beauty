import { UserPermissionProps } from "@core/application/query/interface/user-permission.entity";
import { StaffRole, User } from "@core/application/query/interface/user.entity";

export function resolvePermissionLevel(
  user: Pick<User, "role" | "permissions"> | {
    role: StaffRole;
    permissions?: UserPermissionProps[];
  },
): 0 | 1 | 2 | 3 {
  if (user.role === "Dono") return 0;
  if (user.role === "Administrador") {
    return 1;
  }
  if (user.role === "Gestor") {
    return 2;
  }
  return 3;
}

export function roleFromPermissionLevel(level: number): StaffRole {
  if (level === 1) return "Administrador";
  if (level === 2) return "Gestor";
  if (level === 3) return "Funcionario";
  throw new Error("Operação não permitida");
}
