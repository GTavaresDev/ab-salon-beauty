import { generateKeyPairSync, sign } from 'node:crypto';
import { Controller, Get, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ClientAgendaGuard } from './client-agenda.guard.js';

@Controller('appointments')
class GuardRoutes {
  @Get() findAll() { return []; }
}

describe('ClientAgendaGuard', () => {
  let app: INestApplication;
  const pair = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const now = Math.floor(Date.now() / 1000);
  const token = (claims: Record<string, unknown> = {}) => {
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const data = `${encode({ alg: 'RS256', kid: 'test' })}.${encode({
      iss: 'staff', aud: 'client-agenda-api', sub: 'staff-id', iat: now,
      exp: now + 120, role: 'Administrador', ...claims,
    })}`;
    return `${data}.${sign('RSA-SHA256', Buffer.from(data), pair.privateKey).toString('base64url')}`;
  };

  beforeAll(async () => {
    vi.stubEnv('CLIENT_AGENDA_STAFF_PUBLIC_KEYS', JSON.stringify({
      test: pair.publicKey.export({ type: 'spki', format: 'pem' }),
    }));
    const module = await Test.createTestingModule({ controllers: [GuardRoutes] }).compile();
    app = module.createNestApplication();
    app.useGlobalGuards(new ClientAgendaGuard());
    await app.init();
  });

  afterAll(async () => { vi.unstubAllEnvs(); if (app) await app.close(); });

  it.each([undefined, token({ exp: now - 1 }), token({ aud: 'other' }), token().replace(/\.[^.]+$/, '.invalid')])('rejects invalid token', async (value) => {
    const call = request(app.getHttpServer()).get('/appointments');
    if (value) call.set('Authorization', `Bearer ${value}`);
    await call.expect(401);
  });

  it('accepts a valid staff token', async () => {
    await request(app.getHttpServer()).get('/appointments').set('Authorization', `Bearer ${token()}`).expect(200);
  });
});
