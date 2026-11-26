"use server";

import { createUserGateway } from "@core/server/gateway/user.gateway";
import type { ActionResult } from "@core/application/query/interface/action.interface";
import type { UserPermissionProps } from "@core/application/query/interface/user-permission.entity";
import { requireSessionAction } from "@core/application/query/controller/users/auth.controller";
import { canManageRole, canSharePermissions, rolePermissionNames, validatePermissionGrant } from "@core/server/rule/permission-validation.business-rule";
import { formatActionError } from "@/lib/action-error-handler";

const { users: userRepository, permissions: permissionRepository, grantPermission, revokePermission } = createUserGateway();

async function assertCanManagePermissions(targetUserId: string) {
  const session = await requireSessionAction();
  const granter = await userRepository.findById(session.id);
  const target = await userRepository.findById(targetUserId);

  if (!granter || !target) throw new Error("Usuário não encontrado.");
  if (session.id === targetUserId) throw new Error("Você não pode modificar suas próprias permissões.");
  if (!canSharePermissions({ role: granter.role, permissions: granter.permissions })) {
    throw new Error("Você não possui permissão para atribuir permissões.");
  }
  if (!canManageRole(granter.role, target.role)) throw new Error("Sem permissão para alterar este usuário.");
  return { session, granter, target };
}

export async function grantPermissionAction(input: {
  targetUserId: string;
  permissionName: string;
}): Promise<ActionResult<UserPermissionProps>> {
  try {
    const { session } = await assertCanManagePermissions(input.targetUserId);
    const result = await grantPermission.execute({
      granterId: session.id,
      targetUserId: input.targetUserId,
      permissionName: input.permissionName.trim(),
    });
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao conceder permissão.") };
  }
}

export async function revokePermissionAction(input: {
  targetUserId: string;
  permissionName: string;
}): Promise<ActionResult<void>> {
  try {
    const { session } = await assertCanManagePermissions(input.targetUserId);
    await revokePermission.execute({
      granterId: session.id,
      targetUserId: input.targetUserId,
      permissionName: input.permissionName,
    });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao revogar permissão.") };
  }
}

export async function getUserPermissionsAction(userId: string): Promise<ActionResult<UserPermissionProps[]>> {
  try {
    const session = await requireSessionAction();
    const user = await userRepository.findById(userId);
    if (!user) return { success: false, error: "Usuário não encontrado." };
    if (session.id !== userId && !canManageRole(session.role, user.role)) {
      return { success: false, error: "Sem permissão para consultar este usuário." };
    }
    return { success: true, data: user.permissions };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao buscar permissões.") };
  }
}

export async function updateUserPermissionsAction(input: {
  userId: string;
  permissionNames: string[];
}): Promise<ActionResult<UserPermissionProps[]>> {
  try {
    const { granter, target } = await assertCanManagePermissions(input.userId);
    const requestedNames = [...new Set(input.permissionNames.map((name) => name.trim()).filter(Boolean))];
    const currentPermissions = await permissionRepository.findUserPermissions(input.userId);
    const currentNames = currentPermissions.map((permission) => permission.name);

    const additions = requestedNames.filter((name) => !currentNames.includes(name));
    const removals = currentNames.filter((name) => !rolePermissionNames.includes(name) && !requestedNames.includes(name));
    for (const name of [...additions, ...removals]) {
      validatePermissionGrant(granter, target.role, name);
    }
    for (const name of additions) {
      await permissionRepository.grantPermission(input.userId, name);
    }
    for (const name of removals) {
      await permissionRepository.revokePermission(input.userId, name);
    }

    const refreshed = await permissionRepository.findUserPermissions(input.userId);
    return { success: true, data: refreshed.map((permission) => permission.toJSON()) };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao atualizar permissões.") };
  }
}

export async function delegatePermissionByEmailAction(email: string, permissionName: string) {
  try {
    const target = await userRepository.findByEmail(email.trim().toLowerCase());
    if (!target || target.status !== "Ativo") return { success: false, error: "Destinatário indisponível." };
    return grantPermissionAction({ targetUserId: target.id, permissionName });
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao delegar permissão.") };
  }
}
