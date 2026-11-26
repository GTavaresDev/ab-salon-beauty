"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginClientAction } from "@core/application/query/controller/login/login.controller";
import { resetPasswordNudge } from "../_components/password-nudge/password-nudge";

export function useLoginForm() {
  const router = useRouter();

  // Estar nesta tela significa que não há sessão: o próximo login recomeça do
  // zero, inclusive o convite de criar senha que tenha sido dispensado antes.
  useEffect(resetPasswordNudge, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await loginClientAction({ email, password });
    if (!result.success) {
      setError(result.error || "E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    router.replace("/cliente/painel");
    router.refresh();
  }
  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    loading,
    submit,
  };
}
