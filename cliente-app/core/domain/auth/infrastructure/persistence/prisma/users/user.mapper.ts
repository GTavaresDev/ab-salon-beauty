import { User as PrismaUserModel } from "@prisma/client";
import { StaffRole, User } from "@core/domain/auth/entities/user.entity";

type PrismaUserWithPermissions = PrismaUserModel & {
  permissions?: Array<{ name: string; enabled?: boolean }>;
};

function roleFromPermissions(permissions: Array<{ name: string; enabled?: boolean }> = []): StaffRole {
  const names = new Set(permissions.filter((p) => p.enabled !== false).map((p) => p.name));
  if (names.has("Product Manegar") || names.has("Administrador")) return "Administrador";
  if (names.has("Gestor")) return "Gestor";
  return "Funcionario";
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
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toPersistence(user: User): {
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string | null;
    role: string;
    status: string;
    last: string | null;
    initials: string;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
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
    };
  }
}
