import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { createPrivateKey, createSign, generateKeyPairSync, randomUUID } from 'node:crypto';
import { AppModule } from '../src/app.module.js';

type TestClient = { id: string; email: string };

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) {
  throw new Error('TEST_DATABASE_URL é obrigatório para os testes e2e de segurança.');
}
process.env.DATABASE_URL = databaseUrl;
process.env.NODE_ENV = 'test';

const keyId = process.env.CLIENT_AGENDA_JWT_KID ?? 'client-agenda-e2e';
const configuredPrivateKey = process.env.CLIENT_AGENDA_JWT_PRIVATE_KEY?.replace(/\\n/g, '\n');
const generatedKeys = configuredPrivateKey
  ? undefined
  : generateKeyPairSync('rsa', { modulusLength: 2048 });
const privateKey = configuredPrivateKey ?? generatedKeys!.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const publicKey = generatedKeys?.publicKey.export({ type: 'spki', format: 'pem' }).toString();

function tokenFor(sub: string, options: { secret?: string; expired?: boolean; malformed?: boolean } = {}) {
  if (options.malformed) return 'isto-nao-e-um-jwt';
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const header = encode({ alg: 'RS256', typ: 'JWT', kid: options.secret ? 'other-key' : keyId });
  const payload = encode({
    iss: 'client', aud: 'client-agenda-api', sub,
    iat: options.expired ? now - 120 : now,
    exp: options.expired ? now - 60 : now + 600,
  });
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  const signingKey = options.secret
    ? generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey
    : createPrivateKey(privateKey);
  return `${header}.${payload}.${signer.sign(signingKey).toString('base64url')}`;
}

describe('Segurança e2e de agendamentos', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let clientA: TestClient;
  let clientB: TestClient;
  let appointmentA: string;
  let appointmentB: string;

  const auth = (client: TestClient) => ({ Authorization: `Bearer ${tokenFor(client.id)}` });

  beforeAll(async () => {
    process.env.CLIENT_AGENDA_CLIENT_PUBLIC_KEYS = JSON.stringify({
      ...(process.env.CLIENT_AGENDA_CLIENT_PUBLIC_KEYS ? JSON.parse(process.env.CLIENT_AGENDA_CLIENT_PUBLIC_KEYS) : {}),
      ...(publicKey ? { [keyId]: publicKey } : {}),
    });
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);

    clientA = { id: `e2e-client-a-${randomUUID()}`, email: `e2e-a-${randomUUID()}@example.test` };
    clientB = { id: `e2e-client-b-${randomUUID()}`, email: `e2e-b-${randomUUID()}@example.test` };
    await dataSource.query(
      `INSERT INTO "Clients" (id, name, email, phone, status, "portalAccess", initials, "createdAt", "updatedAt")
       VALUES ($1, 'Cliente E2E A', $2, '000000000', 'Ativo', 'APPROVED', 'EA', NOW(), NOW()),
              ($3, 'Cliente E2E B', $4, '000000001', 'Ativo', 'APPROVED', 'EB', NOW(), NOW())`,
      [clientA.id, clientA.email, clientB.id, clientB.email],
    );
    appointmentA = randomUUID();
    appointmentB = randomUUID();
    await dataSource.query(
      `INSERT INTO "Appointments" (id, date, time, name, service, duration, status, initials, "channelId", notes, "clientId", "createdAt", "updatedAt")
       VALUES ($1, '2099-01-01', '10:00', 'Agendamento A', 'Consulta', '30', 'Confirmado', 'AA', 'site', 'e2e', $2, NOW(), NOW()),
              ($3, '2099-01-02', '11:00', 'Agendamento B', 'Consulta', '30', 'Confirmado', 'AB', 'site', 'e2e', $4, NOW(), NOW())`,
      [appointmentA, clientA.id, appointmentB, clientB.id],
    );
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query('DELETE FROM "Appointments" WHERE id IN ($1, $2)', [appointmentA, appointmentB]);
      await dataSource.query('DELETE FROM "Clients" WHERE id IN ($1, $2)', [clientA.id, clientB.id]);
    }
    await app?.close();
  });

  it('retorna 401 sem token', async () => request(app.getHttpServer()).get(`/appointments/${appointmentA}`).expect(401));
  it('retorna 401 para token assinado por outra chave', async () => request(app.getHttpServer()).get(`/appointments/${appointmentA}`).set('Authorization', `Bearer ${tokenFor(clientA.id, { secret: 'outro-segredo' })}`).expect(401));
  it('retorna 401 para token expirado', async () => request(app.getHttpServer()).get(`/appointments/${appointmentA}`).set(auth(clientA)).set('Authorization', `Bearer ${tokenFor(clientA.id, { expired: true })}`).expect(401));
  it('retorna 401 para token malformado', async () => request(app.getHttpServer()).get(`/appointments/${appointmentA}`).set('Authorization', `Bearer ${tokenFor(clientA.id, { malformed: true })}`).expect(401));
  it('permite acesso com token válido de cliente existente', async () => request(app.getHttpServer()).get(`/appointments/${appointmentA}`).set(auth(clientA)).expect(200));

  it('lista somente os agendamentos do próprio cliente', async () => {
    const response = await request(app.getHttpServer()).get(`/appointments/client/${clientA.id}`).set(auth(clientA)).expect(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(appointmentA);
  });

  it('retorna 404 ao consultar agendamento de outro cliente', async () => request(app.getHttpServer()).get(`/appointments/${appointmentB}`).set(auth(clientA)).expect(404));

  it('retorna 403 ao editar agendamento de outro cliente e preserva o registro', async () => {
    await request(app.getHttpServer()).patch(`/appointments/${appointmentB}`).set(auth(clientA)).send({ name: 'Ataque' }).expect(403);
    const row = await dataSource.query('SELECT name FROM "Appointments" WHERE id = $1', [appointmentB]);
    expect(row[0].name).toBe('Agendamento B');
  });

  it('retorna 403 ao remover agendamento de outro cliente e preserva o registro', async () => {
    await request(app.getHttpServer()).delete(`/appointments/${appointmentB}`).set(auth(clientA)).expect(403);
    const row = await dataSource.query('SELECT id FROM "Appointments" WHERE id = $1', [appointmentB]);
    expect(row).toHaveLength(1);
  });

  it('ignora clientId de outro cliente no POST e usa o cliente do token', async () => {
    const response = await request(app.getHttpServer()).post('/appointments').set(auth(clientA)).send({
      date: '2099-01-03', time: '12:00', name: 'Criado E2E', service: 'Consulta', duration: '30', clientId: clientB.id,
    }).expect(201);
    const createdId = response.body.id;
    const row = await dataSource.query('SELECT "clientId" FROM "Appointments" WHERE id = $1', [createdId]);
    expect(row[0].clientId).toBe(clientA.id);
    await dataSource.query('DELETE FROM "Appointments" WHERE id = $1', [createdId]);
  });

  it('retorna 404 para IDs inexistentes sem revelar existência', async () => {
    const id = randomUUID();
    await request(app.getHttpServer()).get(`/appointments/${id}`).set(auth(clientA)).expect(404);
    await request(app.getHttpServer()).patch(`/appointments/${id}`).set(auth(clientA)).send({ name: 'x' }).expect(404);
    await request(app.getHttpServer()).delete(`/appointments/${id}`).set(auth(clientA)).expect(404);
  });
});
