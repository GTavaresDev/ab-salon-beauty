"use server";

import { createLoginFactory } from "@core/domain/auth/login.factory";
import { z } from "zod";
import { ClientAccountError } from "@core/application/use-cases/login/client-account.usecase";
import {
  type ClientProfileStatusDTO,
} from "@core/application/use-cases/login/complete-client-profile.usecase";
import { formatActionError } from "@/lib/action-error-handler";
import { requireClientSession } from "@/lib/client-session";
import type { LoginActionResult } from "./login.controller";

const { completeProfile, profileStatus } = createLoginFactory();

/** Estado do cadastro do cliente autenticado. Só dados dele mesmo. */
export async function getClientProfileStatusAction(): Promise<ClientProfileStatusDTO> {
  const session = await requireClientSession();
  return profileStatus.execute(session.clientId);
}

const profileSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo"),
  phone: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length >= 10, {
      message: "Informe um telefone válido com DDD",
    }),
  birthDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data de nascimento válida"),
});

export async function completeClientProfileAction(input: {
  name: string;
  phone: string;
  birthDate: string;
}): Promise<LoginActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const session = await requireClientSession();
    await completeProfile.execute({
      clientId: session.clientId,
      ...parsed.data,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof ClientAccountError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: formatActionError(error, "Não foi possível salvar seu cadastro."),
    };
  }
}
