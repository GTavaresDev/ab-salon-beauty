import { createSign, generateKeyPairSync, randomUUID } from 'node:crypto';
import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ClientAgendaGuard } from '../src/security/client/client-agenda.guard.js';

const url = new URL(process.env.TEST_DATABASE_URL ?? 'about:blank');
if (url.protocol !== 'postgresql:' || url.hostname !== '127.0.0.1' || url.pathname !== '/salon_fixture_test' || url.search || url.hash) {
  throw new Error('Banco local de teste obrigatório.');
}

const db = new DataSource({ type: 'postgres', url: url.href });
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
const keyId = 'portal-e2e-key';

const createdClientIds: string[] = [];

function signClientJwt(sub: string) {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const header = encode({ alg: 'RS256', typ: 'JWT', kid: keyId });
  const payload = encode({ iss: 'client', aud: 'client-agenda-api', sub, iat: now, exp: now + 600 });
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  return `${header}.${payload}.${signer.sign(privateKey).toString('base64url')}`;
}

function makeContext(headers: Record<string, string>, path = '/cliente/appointments') {
  const request: { path: string; headers: Record<string, string>; clientAgendaActor?: unknown } = { path, headers };
  return {
    request,
    ctx: { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext,
  };
}

let guard: ClientAgendaGuard;

beforeAll(async () => {
  process.env.CLIENT_AGENDA_CLIENT_PUBLIC_KEYS = JSON.stringify({ [keyId]: publicPem });

  await db.initialize();
  guard = new ClientAgendaGuard(db);
});

afterAll(async () => {
  try {
    if (createdClientIds.length) {
      await db.query('DELETE FROM "Clients" WHERE id = ANY($1)', [createdClientIds]);
    }
  } finally {
    await db.destroy();
  }
});

async function insertClient(status: 'Ativo' | 'Inativo', portalAccess: 'WAITING' | 'IN_REVIEW' | 'APPROVED') {
  const id = randomUUID();
  await db.query(
    'INSERT INTO "Clients" (id, name, email, phone, initials, status, "portalAccess", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
    [id, 'Cliente API', `${id}@example.invalid`, '11999990000', 'CA', status, portalAccess],
  );
  createdClientIds.push(id);
  return id;
}

it('recusa tokens da API de agenda para clientes sem aprovação ou inativos', async () => {
  const waitingId = await insertClient('Ativo', 'WAITING');
  const inReviewId = await insertClient('Ativo', 'IN_REVIEW');
  const inactiveApprovedId = await insertClient('Inativo', 'APPROVED');
  const approvedId = await insertClient('Ativo', 'APPROVED');

  await expect(guard.canActivate(makeContext({}).ctx)).rejects.toThrow(UnauthorizedException);
  await expect(guard.canActivate(makeContext({ authorization: `Bearer ${signClientJwt(waitingId)}` }).ctx)).rejects.toThrow(UnauthorizedException);
  await expect(guard.canActivate(makeContext({ authorization: `Bearer ${signClientJwt(inReviewId)}` }).ctx)).rejects.toThrow(UnauthorizedException);
  await expect(guard.canActivate(makeContext({ authorization: `Bearer ${signClientJwt(inactiveApprovedId)}` }).ctx)).rejects.toThrow(UnauthorizedException);

  const ok = makeContext({ authorization: `Bearer ${signClientJwt(approvedId)}` });
  expect(await guard.canActivate(ok.ctx)).toBe(true);
  expect(ok.request.clientAgendaActor).toEqual({ sub: approvedId, issuer: 'client', role: undefined });
});
