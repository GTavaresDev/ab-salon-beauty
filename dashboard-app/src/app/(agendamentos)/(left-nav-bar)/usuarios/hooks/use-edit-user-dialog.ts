"use client";

import { useRef, useState } from "react";
import { StaffRole, UserProps } from "@core/application/query/interface/user.entity";

export function useEditUserDialog({
  user,
  currentUserRole,
  onClose,
}: {
  user: UserProps;
  currentUserRole: StaffRole;
  canEditUser: boolean;
  canEditProfile: boolean;
  canEditPermissions: boolean;
  onUserUpdated: (updated: UserProps) => void;
  onClose: () => void;
  showToast: (message: string) => void;
}) {
  const [userError, setUserError] = useState("");
  const editModalRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneValue, setPhoneValue] = useState(user.phone || "");

  function handleClose() {
    onClose();
    setPhoneValue("");
  }

  const profileOptions =
    currentUserRole === "Administrador"
      ? [
          { value: "2", label: "Nível 2 — Gestor (Intermediário)" },
          { value: "3", label: "Nível 3 — Funcionário (Operacional)" },
        ]
      : currentUserRole === "Gestor"
        ? [{ value: "3", label: "Nível 3 — Funcionário (Operacional)" }]
        : [];
  return {
    userError,
    setUserError,
    editModalRef,
    loading,
    setLoading,
    phoneValue,
    setPhoneValue,
    handleClose,
    profileOptions,
  };
}
