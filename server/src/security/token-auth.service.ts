import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createPrivateKey, createSign, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { DataSource, Repository } from 'typeorm';
import { TokenAuth } from './token-auth.entity.js';

const scrypt = promisify(nodeScrypt);

@Injectable()
export class TokenAuthService {
  constructor(
    @InjectRepository(TokenAuth) private readonly tokens: Repository<TokenAuth>,
    private readonly dataSource: DataSource,
  ) {}

  async issue(secret: string, userId: string): Promise<{ accessToken: string; tokenType: 'Bearer'; expiresIn: number }> {
    const records = await this.tokens.find({ where: { active: true, issuer: 'client' } });
    const token = await this.findMatchingToken(records, secret);
    if (!token) throw new UnauthorizedException('Credencial inválida.');

    const [client] = await this.dataSource.query(
      'SELECT id FROM "Clients" WHERE id = $1 AND status = $2',
      [userId, 'Ativo'],
    );
    if (!client) throw new UnauthorizedException('Usuário inválido.');

    const privateKeyValue = process.env.CLIENT_AGENDA_JWT_PRIVATE_KEY;
    const keyId = process.env.CLIENT_AGENDA_JWT_KID;
    if (!privateKeyValue || !keyId) {
      throw new ServiceUnavailableException('Emissão de JWT não configurada.');
    }

    const now = Math.floor(Date.now() / 1000);
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const header = encode({ alg: 'RS256', typ: 'JWT', kid: keyId });
    const payload = encode({ iss: 'client', aud: 'client-agenda-api', sub: userId, iat: now, exp: now + 1200 });
    const data = `${header}.${payload}`;
    const signer = createSign('RSA-SHA256');
    signer.update(data);
    const signature = signer.sign(createPrivateKey(privateKeyValue.replace(/\\n/g, '\n'))).toString('base64url');
    return { accessToken: `${data}.${signature}`, tokenType: 'Bearer', expiresIn: 1200 };
  }

  private async findMatchingToken(records: TokenAuth[], secret: string) {
    for (const record of records) {
      const [algorithm, salt, expected] = record.passwordHash.split('$');
      if (algorithm !== 'scrypt' || !salt || !expected) continue;
      const derived = (await scrypt(secret, salt, 64)) as Buffer;
      const stored = Buffer.from(expected, 'hex');
      if (stored.length === derived.length && timingSafeEqual(stored, derived)) return record;
    }
    return null;
  }
}
