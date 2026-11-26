"use client";

import { FormEvent, useState } from "react";

export function useLogin({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginNotice, setLoginNotice] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(onLogin, 500);
  }
  return {
    showPassword,
    setShowPassword,
    loading,
    loginNotice,
    setLoginNotice,
    submit,
  };
}
