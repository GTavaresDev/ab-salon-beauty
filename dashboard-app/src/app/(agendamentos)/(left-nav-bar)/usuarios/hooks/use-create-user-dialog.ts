"use client";

import { FormEvent, useState } from "react";
import { UserProps } from "@core/application/query/interface/user.entity";
import type { StaffRole } from "@core/application/query/interface/user.entity";

export function useCreateUserDialog({
  onAddUser,
  onClose,
  showToast,
}: {
  userList: UserProps[];
  currentUserRole: StaffRole;
  onAddUser: (user: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    permissionLevel?: 0 | 1 | 2 | 3;
    commissionPercent?: number;
  }) => Promise<void>;
  onClose: () => void;
  showToast: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");

  async function addUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const phone = String(form.get("phone") || "");
    const password = String(form.get("password") || "");
    const permissionLevel = Number(form.get("permissionLevel") || 3) as 0 | 1 | 2 | 3;
    const commissionPercent = Math.min(100, Math.max(0, Number(form.get("commissionPercent") || 0)));

    try {
      await onAddUser({ name, email, phone, password, permissionLevel, commissionPercent });

      onClose();
      setPhoneValue("");
      showToast("Novo usuário adicionado com sucesso");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao adicionar usuário";
      showToast(message);
    } finally {
      setLoading(false);
    }
  }
  return {
    loading,
    phoneValue,
    setPhoneValue,
    addUser,
  };
}
