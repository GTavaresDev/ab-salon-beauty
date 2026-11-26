import { getApiToken } from "@/lib/client-agenda-token";
import { failure, success, type Either } from "@core/application/query/common/either";
import type { RequestError } from "@core/application/query/contract/appointment.contract";
import type { BookableServiceDTO } from "@core/application/query/contract/service.contract";
import { clientHttp, apiBaseUrl } from "./appointment.gateway";

export async function getBookableServicesGateway(): Promise<Either<RequestError, BookableServiceDTO[]>> {
  const token = await getApiToken();
  if (token.tag === "left") return failure(token.value);
  return clientHttp<BookableServiceDTO[]>({
    url: `${apiBaseUrl()}/appointments/services`,
    headers: { authorization: `Bearer ${token.value.accessToken}` },
  });
}

export async function getBookableServiceGateway(serviceId: string) {
  const result = await getBookableServicesGateway();
  if (result.tag === "left") return null;
  const service = result.value.find((item) => item.id === serviceId);
  return service ? { duration: service.durationMinutes, status: "Ativo" as const } : null;
}

