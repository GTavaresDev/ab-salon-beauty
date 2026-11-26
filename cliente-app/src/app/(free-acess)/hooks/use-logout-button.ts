"use client";

import { useTransition } from "react";

export function useLogoutButton() {
  const [pending, startTransition] = useTransition();
  return {
    pending,
    startTransition,
  };
}
