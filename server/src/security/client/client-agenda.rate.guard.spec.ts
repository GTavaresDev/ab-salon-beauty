import { ExecutionContext } from '@nestjs/common';
import { ClientAgendaRateGuard } from './client-agenda.rate.guard.js';

describe('ClientAgendaRateGuard', () => {
  const response = { setHeader: vi.fn() };
  const context = (method = 'POST') => ({
    switchToHttp: () => ({ getRequest: () => ({ method, clientAgendaActor: { issuer: 'staff', sub: 'staff-id' } }), getResponse: () => response }),
    getHandler: () => ({ name: 'create' }),
  }) as unknown as ExecutionContext;

  beforeEach(() => { vi.restoreAllMocks(); vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.test'); vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token'); });
  afterEach(() => vi.unstubAllEnvs());

  it('allows requests under the limit', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ result: [1, 59] }), { status: 200 }));
    await expect(new ClientAgendaRateGuard().canActivate(context())).resolves.toBe(true);
  });

  it('returns 429 and Retry-After after the limit', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ result: [21, 42] }), { status: 200 }));
    await expect(new ClientAgendaRateGuard().canActivate(context())).rejects.toMatchObject({ status: 429 });
    expect(response.setHeader).toHaveBeenCalledWith('Retry-After', '42');
  });

  it('allows requests when Redis rate limiting is not configured', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    await expect(new ClientAgendaRateGuard().canActivate(context())).resolves.toBe(true);
  });
});
