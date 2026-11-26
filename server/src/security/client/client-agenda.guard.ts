import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { createPublicKey, verify } from 'node:crypto';
import { InjectDataSource } from '@nestjs/typeorm';
import { hasPortalAccess } from './portal-access.js';
import { DataSource, Raw } from 'typeorm';

export type ClientAgendaActor = {
  sub: string;
  issuer: 'client' | 'staff';
  role?: string;
};

export const CurrentClientAgendaActor = createParamDecorator(
  (_, context) => context.switchToHttp().getRequest().clientAgendaActor as ClientAgendaActor,
);

export function clientAgendaScope(actor: ClientAgendaActor) {
  if (actor.issuer === 'client') return { clientId: actor.sub };
  if (actor.role === 'Administrador') return {};
  if (actor.role === 'Gestor') {
    return {
      userId: Raw(
        (column) =>
          `(${column} = :actor OR ${column} IN (SELECT id FROM "Users" WHERE role = 'Funcionario'))`,
        { actor: actor.sub },
      ),
    };
  }
  return { userId: actor.sub };
}

@Injectable()
export class ClientAgendaGuard implements CanActivate {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.path === '/auth/token') return true;

    try {
      const token = request.headers.authorization?.match(
        /^Bearer ([\w-]+\.[\w-]+\.[\w-]+)$/,
      )?.[1];
      if (!token || token.length > 8192) throw new Error();

      const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
      const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString());
      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
      if (!['client', 'staff'].includes(payload.iss) || header.alg !== 'RS256') throw new Error();

      const keys = JSON.parse(process.env[`CLIENT_AGENDA_${payload.iss.toUpperCase()}_PUBLIC_KEYS`] ?? '{}');
      if (!keys[header.kid]) throw new Error();

      const valid = verify(
        'RSA-SHA256',
        Buffer.from(`${encodedHeader}.${encodedPayload}`),
        createPublicKey(keys[header.kid]),
        Buffer.from(encodedSignature, 'base64url'),
      );
      const now = Math.floor(Date.now() / 1000);
      if (
        !valid || payload.aud !== 'client-agenda-api' ||
        typeof payload.sub !== 'string' || !Number.isSafeInteger(payload.iat) ||
        !Number.isSafeInteger(payload.exp) || payload.iat > now ||
        payload.exp <= now || payload.exp - payload.iat > 1200
      ) throw new Error();

      if (payload.iss === 'client' && !await hasPortalAccess(this.db, payload.sub)) throw new Error();
      request.clientAgendaActor = {
        sub: payload.sub,
        issuer: payload.iss === 'client' ? 'client' : 'staff',
        role: payload.iss === 'staff' ? payload.role : undefined,
      } satisfies ClientAgendaActor;
      return true;
    } catch {
      throw new UnauthorizedException('Token de agenda inválido ou ausente.');
    }
  }
}
