"use server";

import type { ActionError } from "@core/application/query/http/action";
import type { BookableServiceDTO } from "@core/application/query/contract/service.contract";
import { getBookableServicesGateway } from "@core/application/query/gateway/service.gateway";

export async function getServicesController(): Promise<{ success: true; data: BookableServiceDTO[] } | ActionError> {
  const result = await getBookableServicesGateway();
  if (result.tag === "left") {
    console.error("Falha na consulta de serviços do portal", {
      code: result.value.code,
      statusCode: result.value.statusCode,
    });
    return { success: false, error: "Não foi possível carregar os serviços. Tente novamente em instantes." };
  }
  return { success: true, data: result.value };
}
