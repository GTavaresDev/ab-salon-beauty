import { User as PrismaUserModel, UserPermission as PrismaUserPermissionModel } from "@prisma/client";
import { StaffRole, User } from "@core/application/query/interface/user.entity";

type PrismaUserWithPermissions = PrismaUserModel & {
  permissions?: PrismaUserPermissionModel[];
};

export function roleFromPermissions(
  permissions: Array<Pick<PrismaUserPermissionModel, "name" | "enabled">> = [],
): StaffRole {
  const names = new Set(permissions.filter((permission) => permission.enabled).map((permission) => permission.name));
  if (names.has("Dono")) return "Dono";
  if (names.has("Product Manegar") || names.has("Administrador")) return "Administrador";
  if (names.has("Gestor")) return "Gestor";
  return "Funcionario";
}

export function permissionNameFromRole(role: StaffRole): string {
  if (role === "Administrador") return "Product Manegar";
  if (role === "Funcionario") return "Usuario";
  return role;
}

export class UserMapper {
  public static toDomain(raw: PrismaUserWithPermissions): User {
    return new User({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      phone: raw.phone,
      password: raw.password,
      role: roleFromPermissions(raw.permissions),
      status: raw.status as "Ativo" | "Inativo",
      last: raw.last,
      initials: raw.initials,
      failedLoginAttempts: raw.failedLoginAttempts,
      lockedUntil: raw.lockedUntil,
      permissions: raw.permissions
        ? raw.permissions
            .map((p) => ({
              id: p.id,
              name: p.name,
              userId: p.userId,
              description: p.description,
              enabled: p.enabled,
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
            }))
        : [],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      commissionPercent: raw.commissionPercent,
      serviceIds: raw.serviceIds,
    });
  }

  public static toPersistence(user: User): {
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string | null;
    role: StaffRole;
    status: string;
    last: string | null;
    initials: string;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
    commissionPercent: number;
  } {
    const raw = user.toPersistenceJSON();
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      phone: raw.phone,
      password: raw.password || null,
      role: raw.role,
      status: raw.status,
      last: raw.last || null,
      initials: raw.initials,
      failedLoginAttempts: raw.failedLoginAttempts ?? 0,
      lockedUntil: raw.lockedUntil ?? null,
      commissionPercent: raw.commissionPercent ?? 0,
    };
  }
}
