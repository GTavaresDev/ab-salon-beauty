"use server";

import { createUserGateway } from "@core/server/gateway/user.gateway";
import type { ActionResult } from "@core/application/query/interface/action.interface";
import { canManageRole } from "@core/server/rule/permission-validation.business-rule";
import { roleFromPermissionLevel } from "@core/server/rule/resolve-permission-level.business-rule";
import { StaffRole, UserProps } from "@core/application/query/interface/user.entity";
import { hashPassword } from "@core/server/auth/password";
import { isValidUserPassword, userPasswordPolicyMessage } from "@core/shared/user-password-policy";
import { requireSessionAction } from "@core/application/query/controller/users/auth.controller";
import { formatActionError } from "@/lib/action-error-handler";
import { z } from "zod";
import { assertCanCreateRole, parseCreatablePermissionLevel } from "@core/server/rule/creatable-roles.business-rule";

const updateRoleSchema = z.enum(["Administrador", "Gestor", "Funcionario"]);

const { users: userRepository, create: createUser, list: listUsers, update: updateUser, delete: deleteUser } = createUserGateway();

function canEditUser(actorRole: StaffRole, targetRole: StaffRole): boolean {
  if (actorRole === "Administrador") return canManageRole(actorRole, targetRole);
  if (actorRole === "Gestor") return targetRole === "Funcionario";
  return false;
}

function canEditProfile(actorRole: StaffRole, targetRole: StaffRole): boolean {
  return canEditUser(actorRole, targetRole);
}

function toPublicUser(user: { toJSON(): UserProps }): UserProps {
  return user.toJSON();
}

export async function fetchUsersAction(filter?: {
  search?: string;
  role?: string;
  status?: string;
}): Promise<UserProps[]> {
  const session = await requireSessionAction();
  if (session.permissionLevel === 3 || session.role === "Funcionario") {
    return [];
  }
  const useCase = listUsers;
  const users = await useCase.execute(filter, {
    excludePrivileged: session.permissionLevel === 2 || session.role === "Gestor",
  });
  return users.map(toPublicUser);
}

export async function createUserAction(input: unknown): Promise<ActionResult<UserProps>> {
  try {
    if (!input || typeof input !== "object" || !Object.hasOwn(input, "permissionLevel")) {
      return { success: false, error: "Operação não permitida" };
    }
    const parsedInput = z.object({
      name: z.string(),
      email: z.string(),
      phone: z.string().optional(),
      password: z.string().optional(),
      permissionLevel: z.unknown(),
      status: z.enum(["Ativo", "Inativo"]).optional(),
      commissionPercent: z.number().optional(),
    }).safeParse(input);
    if (!parsedInput.success) return { success: false, error: "Operação não permitida" };
    const data = parsedInput.data;
    const permissionLevel = parseCreatablePermissionLevel(data.permissionLevel);
    if (permissionLevel === null) return { success: false, error: "Operação não permitida" };
    const session = await requireSessionAction();
    const mappedRole: StaffRole = roleFromPermissionLevel(permissionLevel);

    assertCanCreateRole(session.role, mappedRole);

    if (!data.password || !isValidUserPassword(data.password)) {
      return { success: false, error: userPasswordPolicyMessage };
    }
    const encryptedPassword = await hashPassword(data.password);
    const created = await createUser.execute({
      name: data.name,
      email: data.email.trim().toLowerCase(),
      phone: data.phone,
      password: encryptedPassword,
      role: mappedRole,
      actorRole: session.role,
      status: data.status,
      commissionPercent: Math.min(100, Math.max(0, data.commissionPercent ?? 0)),
    });
    return { success: true, data: toPublicUser(created) };
  } catch {
    return { success: false, error: "Operação não permitida" };
  }
}

export async function updateUserAction(input: {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  password?: string;
  confirmPassword?: string;
  role?: StaffRole;
  status?: "Ativo" | "Inativo";
  commissionPercent?: number;
}): Promise<ActionResult<UserProps>> {
  try {
    const session = await requireSessionAction();
    const targetUser = await userRepository.findById(input.id);
    if (!targetUser) {
      return { success: false, error: "Usuário não encontrado." };
    }

    if (session.permissionLevel === 3 || session.role === "Funcionario") {
      return { success: false, error: "Sem permissão para alterar usuários." };
    }

    if (!canEditUser(session.role, targetUser.role)) {
      return {
        success: false,
        error:
          session.role === "Gestor"
            ? "Gestores não possuem permissão para alterar este usuário."
            : "Sem permissão para alterar este usuário.",
      };
    }

    const targetCanEditProfile = canEditProfile(session.role, targetUser.role);

    const parsedRole = input.role === undefined ? undefined : updateRoleSchema.safeParse(input.role);
    if (input.role !== undefined && !parsedRole?.success) {
      return { success: false, error: "Operação não permitida" };
    }
    if (parsedRole?.success && (!targetCanEditProfile || !canManageRole(session.role, parsedRole.data))) {
      return {
        success: false,
        error: "Operação não permitida",
      };
    }

    if (parsedRole?.success) {
      try {
        assertCanCreateRole(session.role, parsedRole.data);
      } catch {
        return { success: false, error: "Operação não permitida" };
      }
    }

    let encryptedPassword: string | undefined;

    if (input.password || input.confirmPassword || input.currentPassword) {
      if (!input.currentPassword) {
        return {
          success: false,
          error: "Informe a senha atual para alterar a senha.",
        };
      }
      if (!input.password) {
        return { success: false, error: "Informe a nova senha." };
      }
      if (input.password !== input.confirmPassword) {
        return {
          success: false,
          error: "A nova senha e a confirmação de senha não coincidem.",
        };
      }
      if (!isValidUserPassword(input.password)) {
        return { success: false, error: userPasswordPolicyMessage };
      }

      // For password updates, strictly require the actual password stored in the database.
      if (!targetUser.password) {
        return {
          success: false,
          error: "Usuário não possui uma senha definida no banco de dados.",
        };
      }

      const { verifyPassword } = await import("@core/server/auth/password");
      const isCurrentValid = await verifyPassword(
        input.currentPassword,
        targetUser.password,
      );

      if (!isCurrentValid) {
        return {
          success: false,
          error: "A senha atual informada está incorreta.",
        };
      }

      encryptedPassword = await hashPassword(input.password);
    }

    const useCase = updateUser;
    const updated = await useCase.execute({
      id: input.id, name: input.name, phone: input.phone, role: parsedRole?.success ? parsedRole.data : undefined, actorRole: session.role, status: input.status,
      email: input.email?.trim().toLowerCase(),
      password: encryptedPassword,
      ...(input.status === "Ativo"
        ? { failedLoginAttempts: 0, lockedUntil: null }
        : {}),
      commissionPercent: input.commissionPercent === undefined ? undefined : Math.min(100, Math.max(0, input.commissionPercent)),
    });
    return { success: true, data: toPublicUser(updated) };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao atualizar usuário.") };
  }
}

export async function deleteUserAction(
  id: string,
): Promise<ActionResult<void>> {
  try {
    const session = await requireSessionAction();
    const targetUser = await userRepository.findById(id);
    if (!targetUser) {
      return { success: false, error: "Usuário não encontrado." };
    }

    if (session.role !== "Administrador") {
      return { success: false, error: "Sem permissão para excluir usuários." };
    }

    const useCase = deleteUser;
    await useCase.execute(id);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao excluir usuário.") };
  }
}
