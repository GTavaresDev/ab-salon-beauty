"use server";

import { createUserGateway } from "@core/server/gateway/user.gateway";
import type { ActionResult } from "@core/application/query/interface/action.interface";
import { roleFromPermissionLevel } from "@core/server/rule/resolve-permission-level.business-rule";
import { StaffRole, UserProps } from "@core/application/query/interface/user.entity";
import { hashPassword } from "@core/server/auth/password";
import { requireSessionAction } from "@core/application/query/controller/users/auth.controller";
import { formatActionError } from "@/lib/action-error-handler";

const { users: userRepository, create: createUser, list: listUsers, update: updateUser, delete: deleteUser } = createUserGateway();

function canEditUser(actorRole: StaffRole, targetRole: StaffRole): boolean {
  if (actorRole === "Administrador") return true;
  if (actorRole === "Gestor") return targetRole === "Funcionario";
  return false;
}

function canEditProfile(actorRole: StaffRole, targetRole: StaffRole): boolean {
  return canEditUser(actorRole, targetRole);
}

function canEditPermissions(
  actorRole: StaffRole,
  targetRole: StaffRole,
): boolean {
  return actorRole === "Administrador" && canEditUser(actorRole, targetRole);
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

export async function createUserAction(input: {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  permissionLevel?: 0 | 1 | 2 | 3;
  status?: "Ativo" | "Inativo";
  commissionPercent?: number;
}): Promise<ActionResult<UserProps>> {
  try {
    const session = await requireSessionAction();

    if (session.permissionLevel === 3 || session.role === "Funcionario") {
      return { success: false, error: "Sem permissão para criar usuários." };
    }

    const level = input.permissionLevel || 3;
    if (session.role === "Gestor" && level === 1) {
      return {
        success: false,
        error:
          "Gestores só podem criar usuários do nível Gestor ou Funcionário.",
      };
    }

    const mappedRole: StaffRole = roleFromPermissionLevel(level);
    const encryptedPassword = input.password
      ? await hashPassword(input.password)
      : undefined;
    const useCase = createUser;

    const created = await useCase.execute({
      name: input.name,
      email: input.email.trim().toLowerCase(),
      phone: input.phone,
      password: encryptedPassword,
      role: mappedRole,
      status: input.status,
      commissionPercent: Math.min(100, Math.max(0, input.commissionPercent ?? 0)),
    });
    return { success: true, data: toPublicUser(created) };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao criar usuário.") };
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

    if (input.role && !targetCanEditProfile) {
      return {
        success: false,
        error: "Sem permissão para alterar o perfil deste usuário.",
      };
    }

    if (input.role && session.role === "Gestor" && input.role !== "Gestor") {
      return {
        success: false,
        error: "Gestores só podem promover usuários Funcionário para Gestor.",
      };
    }

    if (
      input.role &&
      session.role === "Gestor" &&
      targetUser.role !== "Funcionario"
    ) {
      return {
        success: false,
        error: "Gestores só podem alterar o perfil de usuários Funcionário.",
      };
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
      id: input.id, name: input.name, phone: input.phone, role: input.role, status: input.status,
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
