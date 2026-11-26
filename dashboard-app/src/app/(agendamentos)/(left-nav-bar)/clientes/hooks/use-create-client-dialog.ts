"use client";

import { FormEvent, useState } from "react";

export function useCreateClientDialog({
  onClose,
  onAddClient,
  showToast,
}: {
  onClose: () => void;
  onAddClient: (client: {
    name: string;
    email: string;
    phone: string;
    birthDate?: string;
  }) => Promise<void>;
  showToast: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [birthDateValue, setBirthDateValue] = useState("");

  async function addClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const phone = String(form.get("phone"));
    const birthDate = String(form.get("birthDate") || "");

    try {
      await onAddClient({ name, email, phone, birthDate });
      showToast("Novo cliente cadastrado com sucesso no PostgreSQL");
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar cliente";
      showToast(message);
    } finally {
      setLoading(false);
    }
  }
  return {
    loading,
    phoneValue,
    setPhoneValue,
    birthDateValue,
    setBirthDateValue,
    addClient,
  };
}
