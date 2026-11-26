export interface ResetTokenIssue {
  clientId: string;
  tokenHash: string;
  expiresAt: Date;
  issuedEmail: string;
  originHash: string;
}

export interface ClientPasswordResetTokenRepository {
  issue(input: ResetTokenIssue): Promise<boolean>;
  findValidByTokenHash(tokenHash: string): Promise<{ clientId: string } | null>;
  consume(clientId: string, tokenHash: string, passwordHash: string): Promise<boolean>;
}
