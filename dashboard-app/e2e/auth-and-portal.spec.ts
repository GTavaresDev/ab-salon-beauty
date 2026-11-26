import { expect, test } from "@playwright/test";

const namespace = process.env.E2E_TEST_NAMESPACE;
if (!namespace) throw new Error("E2E_TEST_NAMESPACE não foi definido pelo runner.");
const adminEmail = `admin-${namespace}@agendamentos.test`;
const clientEmail = `client-${namespace}@agendamentos.test`;
const serviceName = `Consulta E2E ${namespace}`;

test("internal login rejects invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail ou Usuário").fill("unknown@agendamentos.test");
  await page.getByLabel("Senha").fill("incorrect-password");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("staff can sign in with a seeded administrator account", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail ou Usuário").fill(adminEmail);
  await page.getByLabel("Senha").fill("E2e-Admin-Password-934!");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).not.toHaveURL(/\/login$/);
  await expect(page.getByText("Administrador E2E").first()).toBeVisible();
});

test("portal protects appointment details and lets the client book", async ({ page }) => {
  await page.goto("/cliente");
  await page.getByPlaceholder("seuemail@exemplo.com").fill(clientEmail);
  await page.getByPlaceholder("Digite sua senha").fill("E2e-Client-Password-934!");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/cliente\/painel$/);

  await page.goto("/cliente/painel/meus-agendamentos");
  await expect(page.getByText("PRIVATE_E2E_NOTE")).toHaveCount(0);
  await expect(page.getByText("Nenhum atendimento anterior por aqui.")).toBeVisible();

  await page.goto("/cliente/painel/agendar");
  await page.getByRole("button", { name: new RegExp(serviceName) }).click();
  await page.getByRole("button", { name: "Profissional E2E" }).click();
  await expect(page.getByRole("button").filter({ hasText: /^\d+$/ }).first()).toBeVisible();
  await page.getByRole("button").filter({ hasText: /^\d+$/ }).first().click();
  await page.getByRole("button", { name: "09:00" }).click();
  await page.getByRole("button", { name: "Confirmar agendamento" }).click();

  await expect(page.getByRole("heading", { name: "Agendamento realizado!" })).toBeVisible();
  await expect(page.getByText(serviceName)).toBeVisible();
});
