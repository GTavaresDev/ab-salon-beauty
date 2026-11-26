"use client";

import { type ReactNode, createElement } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  createAppointmentAction,
  deleteAppointmentAction,
  fetchAppointmentsAction,
  dismissAppointmentReviewAction,
  updateAppointmentStatusAction,
} from "@core/application/query/controller/appointments/appointment.controller";
import { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { openWhatsAppCancellation, openWhatsAppConfirmation } from "@/lib/whatsapp-helper";
import { useAppShell } from "@/stores/app-shell.store";
import { SurveySuggestionModal } from "@/app/(agendamentos)/(left-nav-bar)/agenda/_components/survey-suggestion-modal.component";
import { PaymentMethodModal, type AppointmentPaymentMethod } from "@/app/(agendamentos)/(left-nav-bar)/agenda/_components/payment-method-modal.component";

export interface AppointmentsContextType {
  appointmentList: AppointmentProps[];
  surveySuggestion: AppointmentProps | null;
  paymentAppointment: AppointmentProps | null;
  closeSurveySuggestion: () => void;
  dismissSurveySuggestion: () => Promise<boolean>;
  closePaymentModal: () => void;
  submitAppointmentPaymentMethod: (method: AppointmentPaymentMethod) => Promise<boolean>;
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
  const [surveySuggestion, setSurveySuggestion] = useState<AppointmentProps | null>(null);
  const [paymentAppointment, setPaymentAppointment] = useState<AppointmentProps | null>(null);
  const knownPendingIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    let refreshing = false;
    let initialLoadComplete = false;

    async function loadInitialAppointments() {
      try {
        const appointments = await fetchAppointmentsAction();
        if (cancelled) return;
        setAppointmentList(appointments);
        knownPendingIds.current = new Set(
          appointments.filter((appointment) => appointment.status === "Pendente").map((appointment) => appointment.id),
        );
      } catch {
        if (!cancelled) setAppointmentList([]);
      } finally {
        initialLoadComplete = true;
        if (!cancelled) setIsLoading(false);
      }
    }

    async function refreshPendingAppointments() {
      if (cancelled || refreshing || !initialLoadComplete || document.visibilityState === "hidden") return;
      refreshing = true;
      try {
        const pending = await fetchAppointmentsAction({ status: "Pendente" });
        if (cancelled) return;
        const previousIds = knownPendingIds.current;
        const newAppointments = pending.filter((appointment) => !previousIds.has(appointment.id));
        knownPendingIds.current = new Set(pending.map((appointment) => appointment.id));
        setAppointmentList((previous) => {
          const next = new Map(previous.filter((appointment) => appointment.status !== "Pendente").map((appointment) => [appointment.id, appointment]));
          for (const appointment of pending) next.set(appointment.id, appointment);
          return Array.from(next.values());
        });
        if (newAppointments.length > 0) {
          const firstName = newAppointments[0].name;
          showToast(newAppointments.length === 1
            ? `Novo agendamento solicitado por ${firstName}.`
            : `${newAppointments.length} novos agendamentos foram solicitados por clientes.`);
        }
      } catch {
        // Uma falha transitória não interrompe a atualização seguinte.
      } finally {
        refreshing = false;
      }
    }

    void loadInitialAppointments().then(() => {
      if (!cancelled) void refreshPendingAppointments();
    });
    const intervalId = window.setInterval(() => void refreshPendingAppointments(), 10_000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshPendingAppointments();
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [currentUser, showToast]);

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

  async function persistAppointmentStatusChange(
    id: string,
    status: "Confirmado" | "Cancelado" | "Concluído" | "Pendente",
    paymentMethod?: AppointmentPaymentMethod,
  ): Promise<boolean> {
    const target = appointmentList.find((a) => a.id === id);
    const res = await updateAppointmentStatusAction(id, status, paymentMethod);
    if (!res.success) { showToast(res.error || "Erro ao atualizar agendamento."); return false; }
    const updatedAppointment = res.data ? { ...target, ...res.data, status } : target ? { ...target, status, paymentMethod } : null;
    setAppointmentList((prev) => prev.map((a) => (a.id === id ? (updatedAppointment ?? { ...a, status, paymentMethod }) : a)));
    if (status === "Concluído" && target?.status !== "Concluído" && target?.clientId && target?.userId) {
      setSurveySuggestion({ ...target, ...res.data, status: "Concluído", paymentMethod });
    }
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
      if (target?.status === "Concluído") {
        showToast("Agendamento cancelado no sistema. Abrindo a mensagem para o cliente...");
        openWhatsAppCancellation({
          phone: target.clientPhone,
          clientName: target.name,
          date: target.date,
          time: target.time,
          professionalName: target.userName,
          serviceName: target.service,
        });
      } else {
        showToast("Agendamento cancelado no sistema.");
      }
    } else {
      showToast(`Agendamento marcado como ${status}`);
    }
    return true;
  }

  async function handleAppointmentStatusChange(
    id: string,
    status: "Confirmado" | "Cancelado" | "Concluído" | "Pendente",
  ) {
    if (status === "Concluído") {
      const appointment = appointmentList.find((item) => item.id === id);
      if (appointment) setPaymentAppointment(appointment);
      return;
    }
    await persistAppointmentStatusChange(id, status);
  }

  async function handleDeleteAppointment(id: string) {
    const result = await deleteAppointmentAction(id);
    if (!result.success) { showToast(result.error || "Erro ao excluir agendamento."); return; }
    setAppointmentList((prev) => prev.filter((a) => a.id !== id));
  }

  async function dismissSurveySuggestion(): Promise<boolean> {
    if (!surveySuggestion) return false;
    const result = await dismissAppointmentReviewAction(surveySuggestion.id);
    if (!result.success) {
      showToast(result.error || "Não foi possível dispensar a pesquisa.");
      return false;
    }
    setSurveySuggestion(null);
    return true;
  }

  return {
    appointmentList,
    surveySuggestion,
    paymentAppointment,
    closeSurveySuggestion: () => setSurveySuggestion(null),
    dismissSurveySuggestion,
    closePaymentModal: () => setPaymentAppointment(null),
    submitAppointmentPaymentMethod: (method: AppointmentPaymentMethod) => paymentAppointment
      ? persistAppointmentStatusChange(paymentAppointment.id, "Concluído", method)
      : Promise.resolve(false),
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
  return createElement(AppointmentsContext.Provider, { value },
    createElement("div", null, children,
      value.paymentAppointment ? createElement(PaymentMethodModal, {
        appointment: value.paymentAppointment,
        onClose: value.closePaymentModal,
        onSubmit: value.submitAppointmentPaymentMethod,
      }) : null,
      value.surveySuggestion ? createElement(SurveySuggestionModal, {
        appointment: value.surveySuggestion,
        onClose: value.closeSurveySuggestion,
        onDismiss: value.dismissSurveySuggestion,
      }) : null,
    ),
  );
}
