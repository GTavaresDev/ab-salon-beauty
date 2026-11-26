import "server-only";
import { createPrivateKey, sign } from "node:crypto";
import { requireClientSession } from "@/lib/client-session";
import { failure, success, type Either } from "@core/application/query/common/either";
import type { RequestError } from "@core/application/query/contract/appointment.contract";

type ClientAgendaToken = {
  accessToken: string;
  clientId: string;
};

function encode(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export async function getApiToken(): Promise<Either<RequestError, ClientAgendaToken>> {
  const { clientId } = await requireClientSession();
  const privateKeyPem = process.env.CLIENT_AGENDA_JWT_PRIVATE_KEY;
  const kid = process.env.CLIENT_AGENDA_JWT_KID;
  const configurationError = {
    message: "Emissão de JWT da agenda não configurada.",
    code: "CONFIGURATION_ERROR",
  };
  if (!privateKeyPem || !kid?.trim()) return failure(configurationError);

  try {
    const key = createPrivateKey(privateKeyPem.replace(/\\n/g, "\n"));
    if (key.asymmetricKeyType !== "rsa") return failure(configurationError);

    const now = Math.floor(Date.now() / 1000);
    const header = encode({ alg: "RS256", typ: "JWT", kid });
    const payload = encode({
      iss: "client",
      aud: "client-agenda-api",
      sub: clientId,
      iat: now,
      exp: now + 1200,
    });
    const data = `${header}.${payload}`;
    const signature = sign("RSA-SHA256", Buffer.from(data), key).toString("base64url");
    return success({ accessToken: `${data}.${signature}`, clientId });
  } catch {
    return failure(configurationError);
  }
}
