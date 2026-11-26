import { expect, it, vi } from "vitest";
import * as actions from "@core/application/query/controller/login/login.controller";
import LegacyResetPage from "@/app/(free-acess)/cliente/redefinir-senha/page";
import { redirect } from "next/navigation";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@core/domain/auth/login.factory", () => ({ createLoginFactory: () => ({}) }));
vi.mock("@/portal-auth", () => ({}));
vi.mock("@/lib/client-session", () => ({}));

it("o portal não expõe ações para emitir links, consumir tokens ou definir senha", () => {
  expect(Object.keys(actions).sort()).toEqual([
    "getClientSessionAction", "loginClientAction", "logoutClientAction", "signInWithGoogleAction",
  ]);
});

it("links antigos levam ao pedido por WhatsApp sem transportar o token", () => {
  LegacyResetPage();
  expect(redirect).toHaveBeenCalledWith("/cliente/recuperar-senha");
});
