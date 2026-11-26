import { failure, success, type Either } from "@core/application/query/common/either";
import type { RequestError } from "@core/application/query/contract/appointment.contract";
import type { BookableProfessionalDTO } from "@core/application/query/contract/professional.contract";
import { apiBaseUrl, clientHttp, getApiToken } from "./appointment.gateway";

export async function getBookableProfessionalsGateway(
  clientId: string,
  serviceId: string,
): Promise<Either<RequestError, BookableProfessionalDTO[]>> {
  const token = await getApiToken(clientId);
  if (token.tag === "left") return failure(token.value);
  const result = await clientHttp<BookableProfessionalDTO[]>({
    url: `${apiBaseUrl()}/appointments/professionals?serviceId=${encodeURIComponent(serviceId)}`,
    headers: { authorization: `Bearer ${token.value}` },
  });
  if (result.tag === "left") return result;
  return success(result.value.filter((professional) => professional.role !== "Administrador"));
}
