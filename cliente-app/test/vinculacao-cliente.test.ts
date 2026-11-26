import { expect, it } from "vitest";
import { buildClient, mockClientRepository } from "@core/domain/auth/entities/test-helpers";
import { RegisterClientAccount } from "@core/application/use-cases/login/client-account.usecase";

it("conhecer o e-mail e telefone do cadastro não autoriza definir senha nem autenticar", async () => {
  const clients = mockClientRepository();
  const existing = buildClient({ password: null });
  clients.findByEmail.mockResolvedValue(existing);
  await expect(new RegisterClientAccount(clients).execute({
    name: existing.name, email: existing.email, phone: existing.phone, password: "senha-ficticia",
  })).rejects.toThrow(/confirmar o e-mail/);
  expect(existing.password).toBeNull();
  expect(clients.update).not.toHaveBeenCalled();
  expect(clients.save).not.toHaveBeenCalled();
});
