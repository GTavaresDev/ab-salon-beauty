"use client";

import { FormEvent, useState } from "react";
import { resetClientPasswordAction } from "@core/application/query/controller/login/login.controller";

export function useResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await resetClientPasswordAction({ token, password, passwordConfirmation });
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Não foi possível redefinir sua senha.");
      return;
    }

    setDone(true);
  }
  return {
    password,
    setPassword,
    passwordConfirmation,
    setPasswordConfirmation,
    error,
    done,
    loading,
    submit,
  };
}
