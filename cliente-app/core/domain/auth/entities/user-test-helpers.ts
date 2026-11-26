import { vi, type Mocked } from "vitest";
import { User, type UserProps } from "@core/domain/auth/entities/user.entity";
import type { UserRepository } from "@core/domain/auth/repositories/user.repository";

export function buildUser(overrides: Partial<UserProps> = {}): User {
  return new User({
    id: "user-1",
    name: "Ana Profissional",
    email: "ana@example.com",
    phone: "11999999999",
    role: "Funcionario",
    status: "Ativo",
    initials: "AP",
    ...overrides,
  });
}

export function mockUserRepository(): Mocked<UserRepository> {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}
