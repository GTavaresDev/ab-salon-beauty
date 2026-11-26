"use server";

import { requireSessionAction } from "../users/auth.controller";
import { prisma } from "@core/server/db/prisma";
import { canApprovePortalAccess } from "@/lib/permissions";
import type { ActionResult } from "@core/application/query/interface/action.interface";

export async function pendingPortalClients() {
  const session = await requireSessionAction();
  if (!canApprovePortalAccess(session)) return [];
  return prisma.client.findMany({
    where: { status: "Ativo", portalAccess: "IN_REVIEW" },
    select: {
      id: true, name: true, email: true, phone: true, birthDate: true,
      status: true, createdAt: true, updatedAt: true,
    },
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
}

export async function approvePortalClient(id: string): Promise<ActionResult<void>> {
  const session = await requireSessionAction();
  if (!canApprovePortalAccess(session)) return { success: false, error: "Sem permissão para aprovar." };
  if (typeof id !== "string" || !id.trim()) return { success: false, error: "Cliente inválido." };
  const result = await prisma.client.updateMany({
    where: { id, status: "Ativo", portalAccess: "IN_REVIEW" },
    data: { portalAccess: "APPROVED", portalApprovedAt: new Date(), portalApprovedById: session.impersonator?.id ?? session.id },
  });
  if (!result.count) return { success: false, error: "Este cadastro não está disponível para aprovação." };
  return { success: true };
}

export async function rejectPortalClient(id: string): Promise<ActionResult<void>> {
  const session = await requireSessionAction();
  if (!canApprovePortalAccess(session)) return { success: false, error: "Sem permissão para recusar." };
  if (typeof id !== "string" || !id.trim()) return { success: false, error: "Cliente inválido." };
  return prisma.$transaction(async (tx) => {
    // Bloqueia o registro e confere o estado antes de excluir seus vínculos.
    const pending = await tx.client.updateMany({
      where: { id, status: "Ativo", portalAccess: "IN_REVIEW" },
      data: { portalAccess: "IN_REVIEW" },
    });
    if (!pending.count) return { success: false, error: "Este cadastro não está disponível para recusa." };
    await tx.appointment.deleteMany({ where: { clientId: id } });
    // Contas OAuth e tokens de recuperação são removidos pelo ON DELETE CASCADE.
    await tx.client.delete({ where: { id } });
    return { success: true };
  });
}
