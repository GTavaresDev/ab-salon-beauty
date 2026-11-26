import { Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { TokenAuthService } from './token-auth.service.js';

@Controller('auth')
export class TokenAuthController {
  constructor(private readonly tokenAuth: TokenAuthService) {}

  @Post('token')
  issue(
    @Headers('x-client-agenda-secret') secret?: string,
    @Headers('x-client-id') clientId?: string,
  ) {
    if (
      typeof secret !== 'string' ||
      !secret.trim() ||
      typeof clientId !== 'string' ||
      !clientId.trim()
    ) {
      throw new UnauthorizedException('Credencial inválida.');
    }
    return this.tokenAuth.issue(secret, clientId);
  }
}
