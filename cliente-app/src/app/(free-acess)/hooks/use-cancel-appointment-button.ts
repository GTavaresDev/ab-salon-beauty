"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelClientAppointmentAction } from "@core/application/query/controller/read-appointment.controller";

export function useCancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    setLoading(true);
    setError("");

    const result = await cancelClientAppointmentAction(appointmentId);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Não foi possível cancelar.");
      setConfirming(false);
      return;
    }

    router.refresh();
  }
  return {
    confirming,
    setConfirming,
    loading,
    error,
    cancel,
  };
}
