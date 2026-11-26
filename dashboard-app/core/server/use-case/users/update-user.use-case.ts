import { StaffRole, User } from "@core/application/query/interface/user.entity";
import { UserRepository } from "@core/server/db/repository/user.repository";
import { assertCanCreateRole } from "@core/server/rule/creatable-roles.business-rule";

export interface UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: StaffRole;
  actorRole?: StaffRole;
  status?: "Ativo" | "Inativo";
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
  last?: string | null;
  commissionPercent?: number;
}

export class UpdateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<User> {
    if (input.role !== undefined) {
      if (!input.actorRole) throw new Error("Operação não permitida");
      assertCanCreateRole(input.actorRole, input.role);
    }
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    const raw = user.toPersistenceJSON();
    const updated = new User({
      id: user.id,
      name: input.name ?? user.name,
      email: input.email ?? user.email,
      phone: input.phone ?? user.phone,
      password: input.password ?? user.password,
      role: input.role ?? user.role,
      status: input.status ?? user.status,
      last: input.last !== undefined ? input.last : user.last,
      initials: input.name ? User.generateInitials(input.name) : user.initials,
      permissions: user.permissions,
      failedLoginAttempts:
        input.failedLoginAttempts ?? raw.failedLoginAttempts ?? 0,
      lockedUntil:
        input.lockedUntil !== undefined ? input.lockedUntil : raw.lockedUntil,
      createdAt: user.createdAt,
      commissionPercent: input.commissionPercent ?? user.commissionPercent,
    });

    return await this.userRepository.update(updated);
  }
}
