import { resolvePermissionLevel } from "@core/server/rule/resolve-permission-level.business-rule";
import { StaffRole } from "@core/application/query/interface/user.entity";
import { UserRepository } from "@core/server/db/repository/user.repository";
import {
  hashPassword,
  needsRehash,
  verifyPassword,
} from "@core/server/auth/password";
import { UpdateUser } from "./update-user.use-case";

const MAX_FAILED_ATTEMPTS = 5;

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export interface AuthenticatedUserDTO {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  permissionLevel: 0 | 1 | 2 | 3;
  initials: string;
  permissions?: Array<{ name: string }>;
}

export class AuthenticateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string, password: string): Promise<AuthenticatedUserDTO> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user?.password) throw new AuthenticationError("Credenciais inválidas");

    if (user.status !== "Ativo") {
      throw new AuthenticationError("Usuário inativo. Entre em contato com o suporte.");
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new AuthenticationError("Conta temporariamente bloqueada.");
    }
    const passwordValid = await verifyPassword(password, user.password);
    const updater = new UpdateUser(this.userRepository);

    if (!passwordValid) {
      const attempts = user.failedLoginAttempts + 1;
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        await updater.execute({
          id: user.id,
          failedLoginAttempts: attempts,
          status: "Inativo",
          lockedUntil: null,
        });

        throw new AuthenticationError(
          "Conta inativada por exceder o limite de 5 tentativas incorretas de senha.",
        );
      }

      await updater.execute({
        id: user.id,
        failedLoginAttempts: attempts,
      });

      throw new AuthenticationError("Credenciais inválidas");
    }

    let nextPassword = user.password;
    if (needsRehash(user.password)) {
      nextPassword = await hashPassword(password);
    }

    await updater.execute({
      id: user.id,
      password: nextPassword,
      failedLoginAttempts: 0,
      lockedUntil: null,
      last: "Online",
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissionLevel: resolvePermissionLevel(user),
      initials: user.initials,
      permissions: user.permissions,
    };
  }
}
