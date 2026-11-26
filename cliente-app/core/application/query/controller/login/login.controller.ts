"use server";

import type { ActionResult } from "@core/application/query/http/action";
import { createLoginFactory } from "@core/domain/auth/login.factory";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ClientAccountError } from "@core/application/use-cases/login/client-account.usecase";
import { formatActionError } from "@/lib/action-error-handler";
import {
  createClientSession,
  destroyClientSession,
  getClientSession,
  type ClientSession,
} from "@/lib/client-session";
import { admitVerifiedClient, pendingMessage } from "@/lib/portal-access";
import { PORTAL_HOME_PATH, signIn as portalSignIn } from "../../../../../src/portal-auth";

const { authenticateClient } = createLoginFactory();

export type LoginActionResult = ActionResult<void>;

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Informe o e-mail"),
  password: z.string().min(1, "Informe a senha"),
});

export async function loginClientAction(input: {
  email: string;
  password: string;
}): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "E-mail ou senha inválidos." };
  }

  try {
    const account = await authenticateClient.execute(
      parsed.data.email,
      parsed.data.password,
    );
    if (!await admitVerifiedClient(account.id)) return { success: false, error: pendingMessage };
    await createClientSession(account);
    return { success: true };
  } catch (error) {
    if (error instanceof ClientAccountError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: formatActionError(error, "Erro ao entrar.") };
  }
}

/**
 * Inicia o login com Google. Redireciona para o consentimento do Google; a
 * conta é resolvida no callback (src/portal-auth.ts) e a sessão do portal é
 * gravada lá. Nenhum segredo passa por aqui.
 */
export async function signInWithGoogleAction(): Promise<void> {
  await portalSignIn("google", { redirectTo: PORTAL_HOME_PATH });
}

export async function logoutClientAction(): Promise<void> {
  await destroyClientSession();
  redirect("/cliente");
}

export async function getClientSessionAction(): Promise<ClientSession | null> {
  return getClientSession();
}
