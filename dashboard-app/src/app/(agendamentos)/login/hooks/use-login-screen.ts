"use client";

import { FormEvent, useState } from "react";
import { loginAction } from "@core/application/query/controller/users/auth.controller";
import { resetPendingNotificationDismissed } from "@/app/(agendamentos)/(left-nav-bar)/dashboard/lib/pending-notification-storage";

export function useLoginScreen({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginAction({ email, password });
      if (!result.success) {
        setError(result.error || "Credenciais inválidas");
        setLoading(false);
        return;
      }
      resetPendingNotificationDismissed();
      onLogin();
    } catch {
      setError("Credenciais inválidas");
      setLoading(false);
    }
  }
  return {
    showPassword,
    setShowPassword,
    loading,
    email,
    setEmail,
    password,
    setPassword,
    error,
    submit,
  };
}
