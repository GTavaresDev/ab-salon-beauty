"use client";

import { useEffect } from "react";
import { logoutClientAction } from "@core/application/query/controller/login/login.controller";

export function ForcedSessionLogout({ expiresAt }: { expiresAt?: number }) {
  useEffect(() => {
    if (!expiresAt) return;

    let loggingOut = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const forceLogout = () => {
      if (loggingOut || Date.now() < expiresAt) return;
      loggingOut = true;
      void logoutClientAction().catch(() => {
        // O cookie é httpOnly; se a action falhar, a navegação força o proxy
        // a revalidar a sessão na próxima requisição.
        window.location.replace("/cliente");
      });
    };

    const schedule = () => {
      if (timeout) clearTimeout(timeout);
      const delay = Math.max(0, expiresAt - Date.now());
      timeout = setTimeout(forceLogout, delay);
    };

    schedule();
    window.addEventListener("focus", forceLogout);
    document.addEventListener("visibilitychange", forceLogout);

    return () => {
      if (timeout) clearTimeout(timeout);
      window.removeEventListener("focus", forceLogout);
      document.removeEventListener("visibilitychange", forceLogout);
    };
  }, [expiresAt]);

  return null;
}
