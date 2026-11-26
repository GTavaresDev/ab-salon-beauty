"use client";

import { useDelegation } from "./use-delegation";

export function useDelegatePermission({ permissions }: { permissions: string[] }) {
  const [message, submit, pending] = useDelegation();
  return {
    message,
    submit,
    pending,
  };
}
