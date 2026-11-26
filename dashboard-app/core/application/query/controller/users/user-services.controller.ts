"use server";

import { z } from "zod";
import type { ActionResult } from "@core/application/query/interface/action.interface";
import { requireSessionAction } from "./auth.controller";
import { prisma } from "@core/server/db/prisma";
import { roleFromPermissions } from "@core/server/db/repository/users/user.mapper";
import { formatActionError } from "@/lib/action-error-handler";

// Os IDs persistidos são TEXT e incluem valores legados como "srv-1".
const entityIdSchema = z.string().min(1).max(255);

const assignmentSchema = z.object({
  userId: entityIdSchema,
  serviceId: entityIdSchema,
  assigned: z.boolean(),
});

export async function setUserServiceAction(input: {
  userId: string;
  serviceId: string;
  assigned: boolean;
}): Promise<ActionResult<string[]>> {
  try {
    const session = await requireSessionAction();
    if (session.role !== "Gestor" && session.role !== "Administrador") {
      return { success: false, error: "Sem permissão para atribuir serviços." };
    }

    const parsed = assignmentSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Dados inválidos." };

    const { userId, serviceId, assigned } = parsed.data;
    const [user, service] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, include: { permissions: { where: { enabled: true } } } }),
      prisma.service.findUnique({ where: { id: serviceId }, select: { id: true } }),
    ]);
    const targetRole = user ? roleFromPermissions(user.permissions) : null;
    if (!user || (targetRole !== "Funcionario" && targetRole !== "Gestor")) {
      return { success: false, error: "Profissional não encontrado." };
    }
    if (!service) return { success: false, error: "Serviço não encontrado." };

    // A atualização atômica conserva alterações simultâneas em outros serviços.
    const rows = assigned
      ? await prisma.$queryRaw<Array<{ serviceIds: string[] }>>`
          UPDATE "Users"
          SET "serviceIds" = array_append("serviceIds", ${serviceId}), "updatedAt" = NOW()
          WHERE "id" = ${userId} AND NOT (${serviceId} = ANY("serviceIds"))
          RETURNING "serviceIds"`
      : await prisma.$queryRaw<Array<{ serviceIds: string[] }>>`
          UPDATE "Users"
          SET "serviceIds" = array_remove("serviceIds", ${serviceId}), "updatedAt" = NOW()
          WHERE "id" = ${userId} AND ${serviceId} = ANY("serviceIds")
          RETURNING "serviceIds"`;

    if (rows[0]) return { success: true, data: rows[0].serviceIds };
    const current = await prisma.user.findUnique({ where: { id: userId }, select: { serviceIds: true } });
    return { success: true, data: current?.serviceIds ?? [] };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao atualizar os serviços do funcionário.") };
  }
}

const assignmentsSchema = z.object({
  userId: entityIdSchema,
  serviceIds: z.array(entityIdSchema).max(500),
});

export async function replaceUserServicesAction(input: {
  userId: string;
  serviceIds: string[];
}): Promise<ActionResult<string[]>> {
  try {
    const session = await requireSessionAction();
    if (session.role !== "Gestor" && session.role !== "Administrador") {
      return { success: false, error: "Sem permissão para atribuir serviços." };
    }
    const parsed = assignmentsSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Dados inválidos." };

    const serviceIds = [...new Set(parsed.data.serviceIds)];
    const [user, services] = await Promise.all([
      prisma.user.findUnique({
        where: { id: parsed.data.userId },
        select: { id: true, permissions: { where: { enabled: true }, select: { name: true, enabled: true } } },
      }),
      prisma.service.findMany({ where: { id: { in: serviceIds } }, select: { id: true } }),
    ]);
    const targetRole = user ? roleFromPermissions(user.permissions) : null;
    if (!user || (targetRole !== "Funcionario" && targetRole !== "Gestor")) {
      return { success: false, error: "Profissional não encontrado." };
    }
    if (services.length !== serviceIds.length) {
      return { success: false, error: "Um ou mais serviços não foram encontrados." };
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { serviceIds },
      select: { serviceIds: true },
    });
    return { success: true, data: updated.serviceIds };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao atualizar os serviços do funcionário.") };
  }
}

