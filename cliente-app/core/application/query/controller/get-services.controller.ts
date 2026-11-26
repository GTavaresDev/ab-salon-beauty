"use server";

import type { BookableServiceDTO } from "@core/application/query/contract/service.contract";
import { getBookableServicesGateway } from "@core/application/query/gateway/service.gateway";

export async function getServicesController(): Promise<BookableServiceDTO[]> {
  const result = await getBookableServicesGateway();
  if (result.tag === "left") throw new Error(result.value.message);
  return result.value;
}
