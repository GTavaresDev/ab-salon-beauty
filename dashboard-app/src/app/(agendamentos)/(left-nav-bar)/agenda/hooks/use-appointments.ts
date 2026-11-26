"use client";

import { type ReactNode, createElement } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  createAppointmentAction,
  deleteAppointmentAction,
  fetchAppointmentsAction,
  updateAppointmentStatusAction,
} from "@core/application/query/controller/appointments/appointment.controller";
import { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { openWhatsAppConfirmation } from "@/lib/whatsapp-helper";
import { useAppShell } from "@/stores/app-shell.store";

export interface AppointmentsContextType {
  appointmentList: AppointmentProps[];
  isLoading: boolean;
  handleAddAppointment: (appt: {
    date: string;
    time: string;
    name: string;
    service: string;
    serviceId?: string;
    allowPastBooking?: boolean;
    duration: string;
    channelId: string;
    notes?: string;
    clientId?: string;
  }) => Promise<void>;
  handleAppointmentStatusChange: (
    id: string,
    status: "Confirmado" | "Cancelado" | "Concluído" | "Pendente"
  ) => Promise<void>;
  handleDeleteAppointment: (id: string) => Promise<void>;
}

export const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export function useAppointmentsState(): AppointmentsContextType {
  const { currentUser, showToast } = useAppShell();
  const [appointmentList, setAppointmentList] = useState<AppointmentProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    fetchAppointmentsAction()
      .then((appointments) => {
        if (!cancelled && appointments) setAppointmentList(appointments);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  async function handleAddAppointment(appt: {
    date: string;
    time: string;
    name: string;
    service: string;
    serviceId?: string;
    allowPastBooking?: boolean;
    duration: string;
    channelId: string;
    notes?: string;
    clientId?: string;
  }) {
    const res = await createAppointmentAction(appt);
    if (res.success && res.data) {
      setAppointmentList((prev) => [res.data!, ...prev]);
    } else {
      throw new Error(res.error || "Erro ao agendar.");
    }
  }

  async function handleAppointmentStatusChange(
    id: string,
    status: "Confirmado" | "Cancelado" | "Concluído" | "Pendente"
  ) {
    const target = appointmentList.find((a) => a.id === id);
    const res = await updateAppointmentStatusAction(id, status);
    if (!res.success) { showToast(res.error || "Erro ao atualizar agendamento."); return; }
    setAppointmentList((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    if (status === "Confirmado") {
      showToast("Agendamento confirmado com sucesso!");
      const apptData = res.data || target;
      if (apptData) {
        openWhatsAppConfirmation({
          phone: apptData.clientPhone || target?.clientPhone,
          clientName: apptData.name,
          date: apptData.date,
          time: apptData.time,
          professionalName: apptData.userName || target?.userName,
          serviceName: apptData.service || target?.service,
        });
      }
    } else if (status === "Cancelado") {
      showToast("Agendamento cancelado no sistema.");
    } else {
      showToast(`Agendamento marcado como ${status}`);
    }
  }

  async function handleDeleteAppointment(id: string) {
    const result = await deleteAppointmentAction(id);
    if (!result.success) { showToast(result.error || "Erro ao excluir agendamento."); return; }
    setAppointmentList((prev) => prev.filter((a) => a.id !== id));
  }

  return {
    appointmentList,
    isLoading,
    handleAddAppointment,
    handleAppointmentStatusChange,
    handleDeleteAppointment,
  };
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error("useAppointments must be used within an AppointmentsProvider");
  }
  return context;
}

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const value = useAppointmentsState();
  return createElement(AppointmentsContext.Provider, { value }, children);
}
