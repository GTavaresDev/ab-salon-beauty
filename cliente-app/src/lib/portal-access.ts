import { prisma } from "@core/infrastructure/shared/client";

export const pendingMessage = "Seu cadastro foi concluído com sucesso e está em análise! Assim que ele for aprovado, seu acesso ao sistema será liberado.";

export async function hasPortalAccess(clientId: string): Promise<boolean> {
  return Boolean(await prisma.client.findFirst({
    where: { id: clientId, status: "Ativo", portalAccess: "APPROVED" }, select: { id: true },
  }));
}

// Invocado somente após validar a senha ou resolver a identidade Google verificada.
export async function admitVerifiedClient(clientId: string): Promise<boolean> {
  await prisma.client.updateMany({
    where: { id: clientId, status: "Ativo", portalAccess: "WAITING" },
    data: { portalAccess: "IN_REVIEW" },
  });
  return hasPortalAccess(clientId);
}
