"use server";

import type { BookableProfessionalDTO } from "@core/application/query/contract/professional.contract";
import { getBookableProfessionalsGateway } from "@core/application/query/gateway/professional.gateway";
import { requireClientSession } from "@/lib/client-session";

export async function getProfessionalsController(serviceId: string): Promise<BookableProfessionalDTO[]> {
  const session = await requireClientSession();
  const result = await getBookableProfessionalsGateway(session.clientId, serviceId);
  if (result.tag === "left") return [];
  return result.value.filter((professional) => professional.role !== "Administrador");
}
