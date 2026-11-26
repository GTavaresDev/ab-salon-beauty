// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { PasswordResetForm } from "@/app/(free-acess)/_components/password-reset-form.component";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function generate() {
  render(<PasswordResetForm />);
  fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "  Ana Teste  " } });
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "ana@example.invalid" } });
  fireEvent.click(screen.getByRole("button", { name: "Gerar mensagem" }));
}

it("exige nome e e-mail válido antes de abrir o modal", () => {
  render(<PasswordResetForm />);
  fireEvent.click(screen.getByText("Gerar mensagem"));
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "  " } });
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "endereco-invalido" } });
  expect(screen.getByLabelText("Nome")).toBeInvalid();
  expect(screen.getByLabelText("E-mail")).toBeInvalid();
});

it("gera e copia a mensagem completa e permite fechar o modal", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal("navigator", Object.create(navigator, { clipboard: { value: { writeText } } }));
  generate();
  expect(screen.getByRole("dialog", { name: "Envie essa mensagem para o WhatsApp da clínica" })).toBeVisible();
  const message = "Olá, gostaria de recuperar minha senha.\nNome: Ana Teste\nE-mail: ana@example.invalid";
  const modal = within(screen.getByRole("dialog"));
  expect(modal.queryByRole("textbox")).toBeNull();
  expect(modal.getByText(/Olá, gostaria/).textContent).toBe(message);
  fireEvent.click(screen.getByRole("button", { name: "Copiar mensagem" }));
  expect(await screen.findByText("Mensagem copiada.")).toBeVisible();
  expect(writeText).toHaveBeenCalledWith(message);
  fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("permite copiar manualmente se o dispositivo bloquear a área de transferência", async () => {
  vi.stubGlobal("navigator", Object.create(navigator, { clipboard: { value: undefined } }));
  generate();
  fireEvent.click(screen.getByText("Copiar mensagem"));
  expect(await screen.findByText("Selecione a opção Copiar do seu dispositivo.")).toBeVisible();
  expect(window.getSelection()?.toString()).toBe("Olá, gostaria de recuperar minha senha.\nNome: Ana Teste\nE-mail: ana@example.invalid");
});
