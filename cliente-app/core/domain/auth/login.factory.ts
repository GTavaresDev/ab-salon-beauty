import { PrismaClientRepository } from "@core/domain/auth/infrastructure/persistence/prisma/login/prisma-client.repository";
import { PrismaClientOAuthAccountRepository } from "@core/domain/auth/infrastructure/persistence/prisma/login/prisma-client-oauth-account.repository";
import { PrismaClientPasswordResetTokenRepository } from "@core/domain/auth/infrastructure/persistence/prisma/login/prisma-client-password-reset-token.repository";
import { AuthenticateClient } from "@core/application/use-cases/login/client-account.usecase";
import { RegisterClientAccount } from "@core/application/use-cases/login/client-account.usecase";
import { RequestClientPasswordReset } from "@core/application/use-cases/login/client-account.usecase";
import { ResetClientPassword } from "@core/application/use-cases/login/client-account.usecase";
import { SetClientPassword } from "@core/application/use-cases/login/client-account.usecase";
import { GetClientEmailByResetToken } from "@core/application/use-cases/login/client-account.usecase";
import { CompleteClientProfile } from "@core/application/use-cases/login/complete-client-profile.usecase";
import { GetClientProfileStatus } from "@core/application/use-cases/login/complete-client-profile.usecase";

export function createLoginFactory() {
  const clients = new PrismaClientRepository();
  const oauthAccounts = new PrismaClientOAuthAccountRepository();
  const resetTokens = new PrismaClientPasswordResetTokenRepository();
  return {
    clients,
    oauthAccounts,
    resetTokens,
    authenticateClient: new AuthenticateClient(clients),
    registerClient: new RegisterClientAccount(clients, oauthAccounts),
    requestPasswordReset: (sendEmail: (input: { to: string; resetUrl: string }) => Promise<void>) => new RequestClientPasswordReset(clients, resetTokens, sendEmail),
    resetPassword: new ResetClientPassword(clients, resetTokens),
    setPassword: new SetClientPassword(clients),
    getClientEmailByResetToken: new GetClientEmailByResetToken(clients, resetTokens),
    completeProfile: new CompleteClientProfile(clients),
    profileStatus: new GetClientProfileStatus(clients),
  };
}
