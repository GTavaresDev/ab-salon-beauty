"use client";

import { useState } from "react";
import { ClientProps } from "@core/application/query/interface/client.entity";

export function useEditClientDialog({
  client,
  onClose,
  onReplaceClient,
  showToast,
}: {
  client: ClientProps;
  onClose: () => void;
  onReplaceClient: (updated: ClientProps) => void;
  showToast: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [phoneValue, setPhoneValue] = useState(client.phone || "");
  const [birthDateValue, setBirthDateValue] = useState(client.birthDate || "");
  return {
    loading,
    setLoading,
    phoneValue,
    setPhoneValue,
    birthDateValue,
    setBirthDateValue,
  };
}
