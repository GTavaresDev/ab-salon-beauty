"use client";

import { useActionState } from "react";
import { delegatePermissionByEmailAction } from "@core/application/query/controller/users/permission.controller";

export function useDelegation() {
  return useActionState(async (_message: string, form: FormData) => {
    try {
      const result = await delegatePermissionByEmailAction(String(form.get("email")), String(form.get("permission")));
      if (result.success) return "Permissão compartilhada.";
      return result.error ?? "Não foi possível compartilhar a permissão.";
    } catch {
      return "Não foi possível compartilhar a permissão.";
    }
  }, "");
}
