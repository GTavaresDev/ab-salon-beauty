import { getApiToken } from "@/lib/client-agenda-token";
import { failure, success, type Either } from "@core/application/query/common/either";
import type { RequestError } from "@core/application/query/contract/appointment.contract";
import type { BookableProfessionalDTO } from "@core/application/query/contract/professional.contract";
import { apiBaseUrl, clientHttp } from "./appointment.gateway";

export function isPublicBookableProfessional(professional: BookableProfessionalDTO): boolean {
  if (professional.role === "Administrador" || professional.role === "Dono") return false;
  const normalizedName = professional.name.trim().toLowerCase();
  if (normalizedName === "product manegar" || normalizedName === "administrador") return false;
  return true;
}

export async function getBookableProfessionalsGateway(
  serviceId: string,
): Promise<Either<RequestError, BookableProfessionalDTO[]>> {
  const token = await getApiToken();
  if (token.tag === "left") return failure(token.value);
  const result = await clientHttp<BookableProfessionalDTO[]>({
    url: `${apiBaseUrl()}/appointments/professionals?serviceId=${encodeURIComponent(serviceId)}`,
    headers: { authorization: `Bearer ${token.value.accessToken}` },
  });
  if (result.tag === "left") return result;
  return success(result.value.filter(isPublicBookableProfessional));
}
