import { failure, success, type Either } from "@core/application/query/common/either";
import type { ApiAppointment, CreateAppointmentRequest, RequestError, UpdateAppointmentRequest, HttpRequest } from "@core/application/query/contract/appointment.contract";
import { toClientAppointmentDTO, type ClientAppointmentDTO, type ClientAppointmentsView } from "@core/application/interfaces/appointments/client-appointment";

export const apiBaseUrl = () => process.env.CLIENT_AGENDA_API_URL ?? "https://agendamentos-codebase-server.vercel.app";

export type PendingAppointmentReview = { appointmentId: string; date: string; time: string; professionalName: string | null };

export async function getPendingReviewsGateway(clientId: string): Promise<Either<RequestError, PendingAppointmentReview[]>> {
  const token = await getApiToken(clientId);
  if (token.tag === "left") return token;
  return clientHttp<PendingAppointmentReview[]>({ url: `${apiBaseUrl()}/appointments/reviews/pending`, headers: { authorization: `Bearer ${token.value}` } });
}

export async function submitReviewGateway(clientId: string, appointmentId: string, rating: number): Promise<Either<RequestError, { success: true }>> {
  const token = await getApiToken(clientId);
  if (token.tag === "left") return token;
  return clientHttp<{ success: true }>({ url: `${apiBaseUrl()}/appointments/reviews/${encodeURIComponent(appointmentId)}`, method: "POST", headers: { authorization: `Bearer ${token.value}` }, body: { rating } });
}

export async function clientHttp<T>(request: HttpRequest, timeoutMs = 10_000): Promise<Either<RequestError, T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(request.url, { method: request.method ?? "GET", headers: { accept: "application/json", ...(request.body === undefined ? {} : { "content-type": "application/json" }), ...request.headers }, body: request.body === undefined ? undefined : JSON.stringify(request.body), signal: request.signal ?? controller.signal, cache: "no-store" });
    const text = await response.text();
    let data: unknown;
    try { data = text ? JSON.parse(text) : undefined; } catch { return failure({ message: "A API retornou uma resposta inválida.", statusCode: response.status, code: "INVALID_JSON" }); }
    if (!response.ok) {
      const message = typeof data === "object" && data !== null && "message" in data ? String((data as { message: unknown }).message) : "Não foi possível consultar a API.";
      return failure({ message, statusCode: response.status, code: "HTTP_ERROR" });
    }
    return success(data as T);
  } catch (error) {
    const timeoutError = error instanceof DOMException && error.name === "AbortError";
    return failure({ message: timeoutError ? "A consulta demorou demais. Tente novamente." : "Não foi possível conectar à API.", code: timeoutError ? "TIMEOUT" : "NETWORK_ERROR" });
  } finally { clearTimeout(timeout); }
}

export async function getApiToken(clientId: string): Promise<Either<RequestError, string>> {
  const secret = process.env.CLIENT_AGENDA_SECRET;
  if (!secret) return failure({ message: "CLIENT_AGENDA_SECRET não configurado.", code: "CONFIGURATION_ERROR" });
  const result = await clientHttp<{ accessToken: string }>({
    url: `${apiBaseUrl()}/auth/token`, method: "POST",
    headers: { "x-client-agenda-secret": secret, "x-client-id": clientId },
  });
  return result.tag === "left" ? result : success(result.value.accessToken);
}

export async function getMyAppointmentsGateway(clientId: string): Promise<Either<RequestError, ClientAppointmentsView>> {
  const token = await getApiToken(clientId);
  if (token.tag === "left") return token;
  const result = await clientHttp<ApiAppointment[]>({
    url: `${apiBaseUrl()}/appointments/client/${encodeURIComponent(clientId)}`,
    headers: { authorization: `Bearer ${token.value}` },
  });
  if (result.tag === "left") return result;
  const all = result.value.map((item) => toClientAppointmentDTO(item));
  const key = (a: ClientAppointmentDTO) => `${a.date}T${a.time}`;
  const now = new Date();
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const upcoming = all
    .filter((a) => key(a) >= nowKey)
    .sort((a, b) => key(a).localeCompare(key(b)));
  const past = all
    .filter((a) => key(a) < nowKey)
    .sort((a, b) => key(b).localeCompare(key(a)));
  return success({
    upcoming,
    past,
    next: upcoming.find((a) => a.status !== "Cancelado") ?? null,
  });
}


export async function getMyAppointmentGateway(clientId: string, id: string): Promise<Either<RequestError, ClientAppointmentDTO | null>> {
  const token = await getApiToken(clientId);
  if (token.tag === "left") return token;
  const result = await clientHttp<ApiAppointment[]>({
    url: `${apiBaseUrl()}/appointments/${encodeURIComponent(id)}`,
    headers: { authorization: `Bearer ${token.value}` },
  });
  if (result.tag === "left") {
    return result.value.statusCode === 404 ? success(null) : result;
  }
  return success(result.value[0] ? toClientAppointmentDTO(result.value[0]) : null);
}

export async function createAppointmentGateway(
  clientId: string,
  input: CreateAppointmentRequest,
): Promise<Either<RequestError, ClientAppointmentDTO>> {
  const token = await getApiToken(clientId);
  if (token.tag === "left") return token;
  const result = await clientHttp<ApiAppointment>({
    url: `${apiBaseUrl()}/appointments`,
    method: "POST",
    headers: { authorization: `Bearer ${token.value}` },
    body: { ...input, clientId },
  });
  if (result.tag === "left") return result;
  return success(toClientAppointmentDTO(result.value));
}

export async function updateAppointmentGateway(
  clientId: string,
  id: string,
  input: UpdateAppointmentRequest,
): Promise<Either<RequestError, ClientAppointmentDTO>> {
  const token = await getApiToken(clientId);
  if (token.tag === "left") return token;
  const result = await clientHttp<ApiAppointment>({
    url: `${apiBaseUrl()}/appointments/${encodeURIComponent(id)}`,
    method: "PATCH",
    headers: { authorization: `Bearer ${token.value}` },
    body: { ...input, clientId },
  });
  if (result.tag === "left") return result;
  return success(toClientAppointmentDTO(result.value));
}

export async function cancelMyAppointmentGateway(clientId: string, id: string): Promise<Either<RequestError, null>> {
  const token = await getApiToken(clientId);
  if (token.tag === "left") return token;
  const result = await clientHttp<unknown>({
    url: `${apiBaseUrl()}/appointments/${encodeURIComponent(id)}?clientId=${encodeURIComponent(clientId)}`,
    method: "DELETE",
    headers: { authorization: `Bearer ${token.value}` },
  });
  if (result.tag === "left") return result;
  return success(null);
}
