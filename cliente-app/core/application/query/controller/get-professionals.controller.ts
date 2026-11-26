"use server";

import type { BookableProfessionalDTO } from "@core/application/query/contract/professional.contract";
import { getBookableProfessionalsGateway, isPublicBookableProfessional } from "@core/application/query/gateway/professional.gateway";

export async function getProfessionalsController(serviceId: string): Promise<BookableProfessionalDTO[]> {
  const result = await getBookableProfessionalsGateway(serviceId);
  if (result.tag === "left") return [];
  return result.value.filter(isPublicBookableProfessional);
}
