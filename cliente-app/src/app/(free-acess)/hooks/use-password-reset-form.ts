"use client";

import { FormEvent, useState } from "react";
import { requestClientPasswordResetAction } from "@core/application/query/controller/login/login.controller";

export function usePasswordResetForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await requestClientPasswordResetAction({ email });
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Informe um e-mail válido.");
      return;
    }

    setSent(true);
  }
  return {
    email,
    setEmail,
    error,
    sent,
    loading,
    submit,
  };
}
