import crypto from "node:crypto";
import {
  GOOGLE_PROVIDER,
  type ClientOAuthAccountRepository,
} from "@core/domain/auth/repositories/client-oauth-account.repository";
import type { ClientPasswordResetTokenRepository } from "@core/domain/auth/repositories/client-password-reset-token.repository";
import { Client } from "@core/domain/auth/entities/client.entity";
import { ClientRepository } from "@core/domain/auth/repositories/client.repository";
import { hashPassword, verifyPassword } from "@core/domain/auth/infrastructure/auth/password";

export const MIN_CLIENT_PASSWORD_LENGTH = 8;
export const PASSWORD_RESET_TOKEN_TTL_MS = 5 * 60 * 1000;

function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export class ClientAccountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientAccountError";
  }
}

/** Dados do cliente autenticado. Nunca inclui senha, status interno ou notas. */
export interface ClientAccountDTO {
  id: string;
  name: string;
  email: string;
  initials: string;
}

/** Comparação de e-mail é sempre normalizada: sem espaços e em minúsculas. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function toClientAccountDTO(client: Client): ClientAccountDTO {
  return toDTO(client);
}

function toDTO(client: Client): ClientAccountDTO {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    initials: client.initials,
  };
}

export interface RegisterClientAccountInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

/** Cadastros preexistentes exigem confirmação pelo canal cadastrado. */
export class RegisterClientAccount {
  constructor(
    private clientRepository: ClientRepository,
    private oauthAccountRepository?: ClientOAuthAccountRepository,
  ) {}

  async execute(input: RegisterClientAccountInput): Promise<ClientAccountDTO> {
    const email = normalizeEmail(input.email);
    const name = input.name.trim();
    const phone = input.phone.trim();

    if (name.length < 3) {
      throw new ClientAccountError("Informe seu nome completo.");
    }
    if (!email.includes("@")) {
      throw new ClientAccountError("Informe um e-mail válido.");
    }
    if (onlyDigits(phone).length < 10) {
      throw new ClientAccountError("Informe um telefone válido com DDD.");
    }
    if (input.password.length < MIN_CLIENT_PASSWORD_LENGTH) {
      throw new ClientAccountError(
        `A senha deve ter pelo menos ${MIN_CLIENT_PASSWORD_LENGTH} caracteres.`,
      );
    }

    const existing = await this.clientRepository.findByEmail(email);

    if (existing) {
      if (existing.password) {
        throw new ClientAccountError(
          "Este e-mail já possui uma conta. Faça login ou recupere sua senha.",
        );
      }

      const linkedToGoogle = await this.oauthAccountRepository?.hasLink(
        existing.id,
        GOOGLE_PROVIDER,
      );
      if (linkedToGoogle) {
        throw new ClientAccountError(
          'Este e-mail já está cadastrado com o Google. Use "Continuar com Google" para entrar.',
        );
      }

      throw new ClientAccountError(
        "Use a opção de recuperar senha para confirmar o e-mail cadastrado e definir sua senha.",
      );
    }

    const client = new Client({
      name,
      email,
      phone,
      password: await hashPassword(input.password),
      status: "Ativo",
    });

    await this.clientRepository.save(client);
    return toDTO(client);
  }
}

/**
 * Define a senha de quem entrou primeiro pelo Google (ou foi cadastrado pela
 * clínica) e agora quer também o login por e-mail/senha.
 *
 * O clientId vem SEMPRE da sessão — nunca do navegador. Quem já tem senha usa
 * a recuperação de senha; aqui não se troca senha existente sem provar posse.
 */
export class SetClientPassword {
  constructor(private clientRepository: ClientRepository) {}

  async execute(clientId: string, password: string): Promise<void> {
    const client = await this.clientRepository.findById(clientId);

    if (!client || client.status !== "Ativo") {
      throw new ClientAccountError("Não foi possível definir sua senha.");
    }

    if (client.password) {
      throw new ClientAccountError(
        "Esta conta já tem senha. Use a recuperação de senha para trocá-la.",
      );
    }

    if (password.length < MIN_CLIENT_PASSWORD_LENGTH) {
      throw new ClientAccountError(
        `A senha deve ter pelo menos ${MIN_CLIENT_PASSWORD_LENGTH} caracteres.`,
      );
    }

    client.setPassword(await hashPassword(password));
    await this.clientRepository.update(client);
  }
}

/** Login do portal. Só autentica registros de Client — nunca usuários internos. */
export class AuthenticateClient {
  constructor(private clientRepository: ClientRepository) {}

  async execute(email: string, password: string): Promise<ClientAccountDTO> {
    const client = await this.clientRepository.findByEmail(normalizeEmail(email));

    if (!client || !client.password) {
      throw new ClientAccountError("E-mail ou senha inválidos.");
    }

    if (client.status !== "Ativo") {
      throw new ClientAccountError(
        "Sua conta está inativa. Entre em contato com a clínica.",
      );
    }

    const valid = await verifyPassword(password, client.password);
    if (!valid) {
      throw new ClientAccountError("E-mail ou senha inválidos.");
    }

    return toDTO(client);
  }
}

export class RequestClientPasswordReset {
  constructor(
    private clientRepository: ClientRepository,
    private resetTokenRepository: ClientPasswordResetTokenRepository,
    private sendEmail: (input: { to: string; resetUrl: string }) => Promise<void>,
  ) {}

  async execute(email: string, baseUrl: string, origin: string): Promise<void> {
    const client = await this.clientRepository.findByEmail(normalizeEmail(email));
    if (!client || client.status !== "Ativo") {
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const issued = await this.resetTokenRepository.issue({
      issuedEmail: client.email,
      originHash: crypto.createHash("sha256").update(origin).digest("hex"),
      clientId: client.id,
      tokenHash: hashResetToken(token),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
    });

    if (!issued) return;

    await this.sendEmail({
      to: client.email,
      resetUrl: `${baseUrl}/cliente/redefinir-senha?token=${token}`,
    });
  }
}

/** Confere o token de um link de redefinição e devolve o e-mail dono dele, para a tela mostrar antes de trocar a senha. */
export class GetClientEmailByResetToken {
  constructor(
    private clientRepository: ClientRepository,
    private resetTokenRepository: ClientPasswordResetTokenRepository,
  ) {}

  async execute(token: string): Promise<string | null> {
    const match = await this.resetTokenRepository.findValidByTokenHash(hashResetToken(token));
    if (!match) return null;

    const client = await this.clientRepository.findById(match.clientId);
    return client?.email ?? null;
  }
}

/** Troca a senha a partir de um token de redefinição válido (não requer sessão). */
export class ResetClientPassword {
  constructor(
    private resetTokenRepository: ClientPasswordResetTokenRepository,
  ) {}

  async execute(token: string, password: string): Promise<void> {
    const tokenHash = hashResetToken(token);
    const match = await this.resetTokenRepository.findValidByTokenHash(tokenHash);
    if (!match) {
      throw new ClientAccountError("Link inválido ou expirado. Solicite a recuperação novamente.");
    }

    if (password.length < MIN_CLIENT_PASSWORD_LENGTH) {
      throw new ClientAccountError(
        `A senha deve ter pelo menos ${MIN_CLIENT_PASSWORD_LENGTH} caracteres.`,
      );
    }

    const changed = await this.resetTokenRepository.consume(match.clientId, tokenHash, await hashPassword(password));
    if (!changed) {
      throw new ClientAccountError("Link inválido ou expirado. Solicite a recuperação novamente.");
    }
  }
}
