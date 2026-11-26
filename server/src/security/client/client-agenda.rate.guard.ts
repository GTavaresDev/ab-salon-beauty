import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';

@Injectable()
export class ClientAgendaRateGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.path === '/auth/token') return true;
    const actor = request.clientAgendaActor;
    const endpoint = process.env.UPSTASH_REDIS_REST_URL;

    // O rate limit é uma proteção adicional; a autenticação JWT continua sendo
    // obrigatória no guard anterior. Sem Redis configurado, não devemos tornar
    // toda a API indisponível — apenas seguir sem o limite distribuído.
    if (!endpoint && process.env.NODE_ENV !== 'production') return true;
    if (!endpoint?.startsWith('https://') || !process.env.UPSTASH_REDIS_REST_TOKEN) return true;

    const identity = createHash('sha256').update(`${actor.issuer}:${actor.sub}`).digest('hex');
    const operation = `${request.method}:${context.getHandler().name}`;
    const key = `client-agenda:${operation}:${identity}`;
    const limit = request.method === 'GET' ? 120 : 20;
    const script = "local count=redis.call('INCR',KEYS[1]); if count==1 then redis.call('EXPIRE',KEYS[1],60) end; return {count,redis.call('TTL',KEYS[1])}";

    try {
      const response = await fetch(endpoint, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(2500),
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(['EVAL', script, 1, key]),
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.result) || data.result.length !== 2) throw Error();
      const [count, ttl] = data.result;
      if (!Number.isInteger(count) || !Number.isInteger(ttl)) throw Error();
      if (count > limit) {
        context.switchToHttp().getResponse().setHeader('Retry-After', String(Math.max(ttl, 1)));
        throw new HttpException('Muitas requisições.', 429);
      }
      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new ServiceUnavailableException('Rate limit indisponível.');
    }
  }
}
