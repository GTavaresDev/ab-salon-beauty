"use client";

import { useState, useEffect } from "react";
import { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { ServiceProps } from "@core/application/query/interface/service.entity";

export interface PendingAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReview: () => void;
  onConfirm?: (item: AppointmentProps) => Promise<void> | void;
  pendingAppointments: AppointmentProps[];
  serviceList?: ServiceProps[];
}

export function useOpenPendingAppointmentsModal({
  isOpen,
  onClose,
  onReview,
  pendingAppointments,
  serviceList = [],
}: PendingAppointmentsModalProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!isOpen || isMinimized) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        // Pressing ESC minimizes to bottom right
        setIsMinimized(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isMinimized]);
  return {
    isMinimized,
    setIsMinimized,
  };
}
