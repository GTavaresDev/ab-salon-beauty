import { describe, expect, it } from "vitest";
import { CreateUser } from "./create-user.use-case";
import { buildUser, mockUserRepository } from "./test-helpers";

describe("CreateUser", () => {
  it("rejects a duplicate email", async () => {
    const repo = mockUserRepository();
    repo.findByEmail.mockResolvedValue(buildUser());
    const useCase = new CreateUser(repo);

    await expect(
      useCase.execute({ name: "Novo", email: "maria@example.com", actorRole: "Administrador" }),
    ).rejects.toThrow(/já existe/i);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("normalizes email and applies defaults", async () => {
    const repo = mockUserRepository();
    repo.findByEmail.mockResolvedValue(null);
    repo.save.mockImplementation(async (u) => u);
    const useCase = new CreateUser(repo);

    const result = await useCase.execute({ name: "João Souza", email: "  Joao@Example.com  ", actorRole: "Administrador" });

    expect(result.email).toBe("joao@example.com");
    expect(result.role).toBe("Funcionario");
    expect(result.status).toBe("Ativo");
    expect(result.initials).toBe("JS");
    expect(result.failedLoginAttempts).toBe(0);
  });

  it("passes through an explicit role, status, and password", async () => {
    const repo = mockUserRepository();
    repo.findByEmail.mockResolvedValue(null);
    repo.save.mockImplementation(async (u) => u);
    const useCase = new CreateUser(repo);

    const result = await useCase.execute({
      name: "Admin",
      email: "admin@example.com",
      role: "Gestor",
      actorRole: "Administrador",
      status: "Inativo",
      password: "hashedvalue",
    });

    expect(result.role).toBe("Gestor");
    expect(result.status).toBe("Inativo");
    expect(result.password).toBe("hashedvalue");
    expect(result.toJSON().password).toBeUndefined();
  });

  it("allows a Gestor to create only a Usuario and rejects before saving other roles", async () => {
    const repo = mockUserRepository();
    repo.findByEmail.mockResolvedValue(null);
    repo.save.mockImplementation(async (u) => u);
    const useCase = new CreateUser(repo);

    await expect(useCase.execute({
      name: "Gestor novo", email: "gestor@example.com", role: "Gestor", actorRole: "Gestor",
    })).rejects.toThrow("Operação não permitida");
    expect(repo.save).not.toHaveBeenCalled();

    const created = await useCase.execute({
      name: "Usuario novo", email: "usuario@example.com", role: "Funcionario", actorRole: "Gestor",
    });
    expect(created.role).toBe("Funcionario");
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it("requires a server supplied actor role", async () => {
    const repo = mockUserRepository();
    const useCase = new CreateUser(repo);

    await expect(useCase.execute({ name: "Novo", email: "novo@example.com" }))
      .rejects.toThrow("Operação não permitida");
    expect(repo.findByEmail).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });
});
