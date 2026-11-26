"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getTodayIsoString, dateToIsoString } from "@/lib/week-generator";
import { isBookingTimeExpired } from "@core/server/rule/booking-time.business-rule";
import { useAppShell } from "@/stores/app-shell.store";
import { useAppointments } from "@/app/(agendamentos)/(left-nav-bar)/agenda/hooks/use-appointments";
import { useClients } from "@/app/(agendamentos)/(left-nav-bar)/clientes/hooks/use-clients";
import { useServices } from "@/app/(agendamentos)/(left-nav-bar)/servicos/hooks/use-services";
import { dismissPendingNotification } from "../lib/pending-notification-storage";

export function useDashboardView() {
  const router = useRouter();
  const { currentUser, showToast } = useAppShell();
  const {
    appointmentList,
    isLoading: appointmentsLoading,
    handleAppointmentStatusChange,
  } = useAppointments();
  const { clientList, isLoading: clientsLoading } = useClients();
  const { serviceList } = useServices();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [onlyPending, setOnlyPending] = useState(false);
  const [dismissedOnThisVisit, setDismissedOnThisVisit] = useState(false);

  const onNew = () => router.push("/agenda?novo=1");
  const onVerAgenda = () => router.push("/agenda");
  const appointments = appointmentList;
  const clientsCount = clientList.length;
  const onStatusChange = handleAppointmentStatusChange;

  // Calculate weekly movement from database
  const bars = useMemo(() => {
    const dayMap = new Map<number, number>();
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      const dateStr = dateToIsoString(dayDate);

      const dayAppointments = appointments.filter((a) => a.date === dateStr);
      dayMap.set(i, dayAppointments.length);
    }

    const maxCount = Math.max(...Array.from(dayMap.values()), 1);
    return Array.from({ length: 7 }, (_, i) => {
      const count = dayMap.get(i) || 0;
      return Math.round((count / maxCount) * 100);
    });
  }, [appointments]);

  const todayIso = getTodayIsoString();

  // Agendamentos feitos pelo cliente entram como "Pendente" (Aguardando confirmação)
  // Atendimentos cujo horário já expirou sem confirmação não entram no filtro/contagem de pendentes
  const pendingAppointments = useMemo(
    () =>
      appointments
        .filter(
          (a) =>
            a.status === "Pendente" &&
            !isBookingTimeExpired(a.date, a.time, new Date(), 0),
        )
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [appointments],
  );

  const displayedAppointments = useMemo(() => {
    if (onlyPending) return pendingAppointments.slice(0, 10);
    return appointments
      .filter((a) => a.date === todayIso)
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(0, 10);
  }, [appointments, todayIso, onlyPending, pendingAppointments]);

  const todayList = useMemo(
    () => appointments.filter((a) => a.date === todayIso),
    [appointments, todayIso],
  );
  const todayCount = todayList.length;
  const todayCompletedCount = todayList.filter((a) => a.status === "Concluído").length;
  const todayAttendanceRate = todayCount > 0
    ? Math.round((todayCompletedCount / todayCount) * 100)
    : 0;



  const handleClosePendingModal = () => {
    dismissPendingNotification();
    setDismissedOnThisVisit(true);
  };

  const handleReviewPending = () => {
    dismissPendingNotification();
    setDismissedOnThisVisit(true);
    setOnlyPending(true);
  };
  return {
    router,
    currentUser,
    showToast,
    appointmentsLoading,
    clientsLoading,
    serviceList,
    openMenuId,
    setOpenMenuId,
    onlyPending,
    setOnlyPending,
    isPendingModalOpen: Boolean(currentUser && currentUser.role !== "Administrador" && pendingAppointments.length > 0 && !dismissedOnThisVisit),
    onNew,
    onVerAgenda,
    appointments,
    clientsCount,
    onStatusChange,
    bars,
    todayIso,
    pendingAppointments,
    displayedAppointments,
    todayCount,
    todayCompletedCount,
    todayAttendanceRate,
    handleClosePendingModal,
    handleReviewPending,
  };
}
