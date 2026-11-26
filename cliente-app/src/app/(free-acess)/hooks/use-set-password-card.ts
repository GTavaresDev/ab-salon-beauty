"use client";

import { FormEvent, useState } from "react";
import { setClientPasswordAction } from "@core/application/query/controller/login/login.controller";
import { dismissPasswordNudge } from "../_components/password-nudge/password-nudge";

export function useSetPasswordCard() {
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await setClientPasswordAction({ password, passwordConfirmation });
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Não foi possível definir sua senha.");
      return;
    }

    setDone(true);
  }

  function dismiss() {
    setDismissed(true);
    dismissPasswordNudge();
  }
  return {
    dismissed,
    open,
    setOpen,
    password,
    setPassword,
    passwordConfirmation,
    setPasswordConfirmation,
    error,
    done,
    loading,
    submit,
    dismiss,
  };
}
