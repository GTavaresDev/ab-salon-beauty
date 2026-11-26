"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientProfileStatusDTO } from "@core/application/use-cases/login/complete-client-profile.usecase";
import { formatPhoneBR } from "@/lib/input-masks";
import { completeClientProfileAction } from "@core/application/query/controller/login/login-profile.controller";

export function useCompleteProfileForm({ profile }: { profile: ClientProfileStatusDTO }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: profile.name,
    phone: formatPhoneBR(profile.phone),
    birthDate: profile.birthDate,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await completeClientProfileAction(form);
    if (!result.success) {
      setError(result.error || "Não foi possível salvar seu cadastro.");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  const today = new Date().toISOString().slice(0, 10);
  return {
    form,
    error,
    loading,
    update,
    submit,
    today,
  };
}
