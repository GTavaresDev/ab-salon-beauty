import { StaffRole, User } from "@core/application/query/interface/user.entity";
import { UserRepository } from "@core/server/db/repository/user.repository";
import { assertCanCreateRole } from "@core/server/rule/creatable-roles.business-rule";

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role?: StaffRole;
  actorRole?: StaffRole;
  status?: "Ativo" | "Inativo";
  commissionPercent?: number;
}

export class CreateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    const role = input.role ?? "Funcionario";
    if (!input.actorRole) throw new Error("Operação não permitida");
    assertCanCreateRole(input.actorRole, role);

    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error("Já existe um usuário cadastrado com este e-mail.");
    }

    const initials = User.generateInitials(input.name);
    const user = new User({
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email.trim().toLowerCase(),
      phone: input.phone || "",
      password: input.password || null,
      role,
      status: input.status || "Ativo",
      last: "Recém criado",
      initials,
      failedLoginAttempts: 0,
      lockedUntil: null,
      commissionPercent: input.commissionPercent ?? 0,
    });

    return await this.userRepository.save(user);
  }
}
