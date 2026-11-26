"use server";

import { createUserGateway } from "@core/server/gateway/user.gateway";
import type { ActionResult } from "@core/application/query/interface/action.interface";
import { withLoginLock } from "@core/server/db/repository/users/login-transaction";
import { allowLoginAttempt } from "@core/server/auth/login-rate-limit";
import { z } from "zod";
import { AuthenticationError } from "@core/server/use-case/users/authenticate-user.use-case";
import { resolvePermissionLevel } from "@core/server/rule/resolve-permission-level.business-rule";
import { auth, signOut } from "@/auth";
import {
  createAuthSession,
  restoreActorSession,
  writeImpersonationSession,
  type SessionActor,
} from "@/lib/create-auth-session";
import type { StaffRole } from "@core/application/query/interface/user.entity";
import { formatActionError } from "@/lib/action-error-handler";

const { users: staffUsers, permissions: staffPermissions, authenticate } = createUserGateway();

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe o e-mail")
    .refine((val) => val.includes("@"), {
      message: "Informe um e-mail válido com @",
    }),
  password: z.string().min(1, "Informe a senha"),
});

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  permissionLevel: 0 | 1 | 2 | 3;
  initials: string;
  permissions?: Array<{ name: string }>;
  impersonating?: boolean;
  impersonator?: SessionActor;
};

export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<ActionResult<void>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Credenciais inválidas" };
  }

  try {
    if (!await allowLoginAttempt(parsed.data.email)) throw new AuthenticationError("Muitas tentativas. Aguarde para tentar novamente.");
    const result = await withLoginLock(parsed.data.email, async (users) => {
      try {
        return await authenticate(users).execute(parsed.data.email, parsed.data.password);
      } catch (error) {
        // As falhas de senha também gravam o contador e precisam de commit.
        if (error instanceof AuthenticationError) return error;
        throw error;
      }
    });
    if (result instanceof AuthenticationError) throw result;
    await createAuthSession(result);
    return { success: true };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: formatActionError(error, "Erro ao autenticar.") };
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

export async function getCurrentSessionAction(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return null;
  }

  const users = staffUsers;
  const current = await users.findById(session.user.id);
  if (!current || current.status !== "Ativo") return null;
  let impersonator: SessionActor | undefined;
  if (session.user.impersonating) {
    if (!session.user.impersonator) return null;
    const actor = await users.findById(session.user.impersonator.id);
    if (!actor || actor.status !== "Ativo" || actor.role !== "Administrador") return null;
    impersonator = { id: actor.id, name: actor.name, role: actor.role, email: actor.email,
      permissionLevel: resolvePermissionLevel(actor), initials: actor.initials };
  }
  return {
    id: current.id, name: current.name, email: current.email, role: current.role,
    permissionLevel: resolvePermissionLevel(current), initials: current.initials,
    permissions: (current.permissions ?? []).filter((permission) => permission.enabled !== false),
    impersonating: Boolean(impersonator), impersonator,
  };
}

export async function requireSessionAction(): Promise<SessionUser> {
  const session = await getCurrentSessionAction();
  if (!session) {
    throw new Error("Não autenticado");
  }
  return session;
}

export async function startImpersonationAction(
  targetUserId: string,
): Promise<ActionResult<void>> {
  try {
    const session = await requireSessionAction();
    const actor = session.impersonator ?? session;

    if (!actor || actor.role !== "Administrador") {
      return {
        success: false,
        error: "Apenas Administradores podem usar impersonation.",
      };
    }

    if (actor.id === targetUserId) {
      return {
        success: false,
        error: "Você já está nesta conta.",
      };
    }

    const repository = staffUsers;
    const target = await repository.findById(targetUserId);
    if (!target || target.status !== "Ativo") {
      return { success: false, error: "Usuário não encontrado." };
    }

    await writeImpersonationSession({
      actor,
      target: {
        id: target.id,
        name: target.name,
        email: target.email,
        role: target.role,
        permissionLevel: resolvePermissionLevel(target),
        initials: target.initials,
        permissions: target.permissions,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao assumir usuário.") };
  }
}

export async function stopImpersonationAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await requireSessionAction();
    if (!session.impersonating) {
      return { success: false, error: "Nenhuma impersonation ativa." };
    }

    const actor = session.impersonator;
    if (!actor) {
      return { success: false, error: "Sessão inválida." };
    }

    await restoreActorSession(actor);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao sair da conta.") };
  }
}

