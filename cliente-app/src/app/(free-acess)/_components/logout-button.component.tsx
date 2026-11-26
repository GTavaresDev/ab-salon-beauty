"use client";

import { useLogoutButton } from "../hooks/use-logout-button";
import { LogOut } from "lucide-react";
import { logoutClientAction } from "@core/application/query/controller/login/login.controller";

export function LogoutButton() {
  const {
    pending,
    startTransition,
  } = useLogoutButton();

  return (
    <button
      type="button"
      title="Sair"
      aria-label="Sair"
      disabled={pending}
      onClick={() => startTransition(() => logoutClientAction())}
      className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-950 disabled:opacity-50"
    >
      <LogOut className="size-4" />
    </button>
  );
}
