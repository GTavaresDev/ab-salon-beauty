"use server";

import type { BookableServiceDTO } from "@core/application/query/contract/service.contract";
import { getBookableServicesGateway } from "@core/application/query/gateway/service.gateway";
import { requireClientSession } from "@/lib/client-session";

export async function getServicesController(): Promise<BookableServiceDTO[]> {
  const session = await requireClientSession();
  const result = await getBookableServicesGateway(session.clientId);
  if (result.tag === "left") throw new Error(result.value.message);
  return result.value;
}
