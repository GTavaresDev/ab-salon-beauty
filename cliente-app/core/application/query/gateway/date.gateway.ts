import { getApiToken } from "@/lib/client-agenda-token";
import { failure, type Either } from "@core/application/query/common/either";
import type { RequestError } from "@core/application/query/contract/appointment.contract";
import { apiBaseUrl, clientHttp } from "@core/application/query/gateway/appointment.gateway";

export async function getAvailableDatesGateway(serviceId: string): Promise<Either<RequestError, string[]>> {
  const token = await getApiToken();
  if (token.tag === "left") return failure(token.value);
  return clientHttp<string[]>({ url: `${apiBaseUrl()}/appointments/dates?serviceId=${encodeURIComponent(serviceId)}`, headers: { authorization: `Bearer ${token.value.accessToken}` } });
}

export async function getAvailableTimesGateway(serviceId: string, date: string): Promise<Either<RequestError, string[]>> {
  const token = await getApiToken();
  if (token.tag === "left") return failure(token.value);
  return clientHttp<string[]>({ url: `${apiBaseUrl()}/appointments/times?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`, headers: { authorization: `Bearer ${token.value.accessToken}` } });
}
