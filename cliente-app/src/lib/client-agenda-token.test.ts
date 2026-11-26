import { generateKeyPairSync, verify } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateAppointmentGateway } from "@core/application/query/gateway/appointment.gateway";
import { hasPortalAccess } from "@/lib/portal-access";
import { clientSessionCookieName, encodeClientSessionToken } from "@/lib/client-session-token";
import { getApiToken } from "./client-agenda-token";

vi.mock("@/lib/portal-access", () => ({ hasPortalAccess: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => name === clientSessionCookieName() && cookie ? { value: cookie } : undefined,
  }),
}));

let cookie: string | undefined;
const keys = generateKeyPairSync("rsa", { modulusLength: 2048 });

beforeEach(async () => {
  vi.stubEnv("AUTH_SECRET", "agenda-test-secret-exclusivo-dos-testes");
  vi.stubEnv("CLIENT_AGENDA_API_URL", "https://agenda.example.test");
  vi.stubEnv("CLIENT_AGENDA_JWT_KID", "portal-test");
  vi.stubEnv("CLIENT_AGENDA_JWT_PRIVATE_KEY", keys.privateKey.export({ format: "pem", type: "pkcs8" }).replace(/\n/g, "\\n"));
  cookie = await encodeClientSessionToken({ clientId: "client-a", name: "Cliente A", email: "", initials: "CA" });
  vi.mocked(hasPortalAccess).mockResolvedValue(true);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("autenticação do portal na API de agenda", () => {
  it("usa a identidade da sessão no JWT e no corpo enviado à API", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({
      id: "appointment-a", date: "2099-01-01", time: "10:00", service: "Consulta", duration: "30",
    })));
    vi.stubGlobal("fetch", fetchMock);
    const suppliedInput = { clientId: "client-b", date: "2099-01-01" };

    expect((await updateAppointmentGateway("appointment-a", suppliedInput)).tag).toBe("right");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe("https://agenda.example.test/appointments/appointment-a");
    expect(JSON.parse(String(request?.body))).toEqual({ date: "2099-01-01", clientId: "client-a" });
    const bearer = new Headers(request?.headers).get("authorization") ?? "";
    const [header, payload, signature] = bearer.replace(/^Bearer /, "").split(".");
    expect(JSON.parse(Buffer.from(header, "base64url").toString())).toEqual({
      alg: "RS256", typ: "JWT", kid: "portal-test",
    });
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    expect(claims).toMatchObject({ sub: "client-a", iss: "client", aud: "client-agenda-api" });
    expect(claims.exp - claims.iat).toBe(1200);
    expect(verify("RSA-SHA256", Buffer.from(`${header}.${payload}`), keys.publicKey, Buffer.from(signature, "base64url"))).toBe(true);
  });

  it("recusa emissão quando a verificação da sessão falha", async () => {
    cookie = undefined;
    await expect(getApiToken()).rejects.toThrow("Faça login para continuar.");
  });

  it("recusa emissão com cookie válido quando o acesso ao portal foi revogado", async () => {
    vi.mocked(hasPortalAccess).mockResolvedValue(false);
    await expect(getApiToken()).rejects.toThrow("Faça login para continuar.");
    expect(hasPortalAccess).toHaveBeenCalledWith("client-a");
  });

  it("recusa emissão quando a chave privada é inválida", async () => {
    vi.stubEnv("CLIENT_AGENDA_JWT_PRIVATE_KEY", "invalid");
    expect(await getApiToken()).toMatchObject({ tag: "left", value: { code: "CONFIGURATION_ERROR" } });
  });
});
