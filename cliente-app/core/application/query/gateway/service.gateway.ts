import { failure, success, type Either } from "@core/application/query/common/either";
import type { RequestError } from "@core/application/query/contract/appointment.contract";
import type { BookableServiceDTO } from "@core/application/query/contract/service.contract";
import { getApiToken, clientHttp, apiBaseUrl } from "./appointment.gateway";

export async function getBookableServicesGateway(
  clientId: string,
): Promise<Either<RequestError, BookableServiceDTO[]>> {
  const token = await getApiToken(clientId);
  if (token.tag === "left") return failure(token.value);
  return clientHttp<BookableServiceDTO[]>({
    url: `${apiBaseUrl()}/appointments/services`,
    headers: { authorization: `Bearer ${token.value}` },
  });
}

export async function getBookableServiceGateway(clientId: string, serviceId: string) {
  const result = await getBookableServicesGateway(clientId);
  if (result.tag === "left") return null;
  const service = result.value.find((item) => item.id === serviceId);
  return service ? { duration: service.durationMinutes, status: "Ativo" as const } : null;
}

