"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppShell } from "@/stores/app-shell.store";
import { useServices } from "@/app/(agendamentos)/(left-nav-bar)/servicos/hooks/use-services";
import { paginateItems } from "@/lib/pagination";
import { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { isBookingTimeExpired } from "@core/server/rule/booking-time.business-rule";
import { appointmentChannels } from "@/app/mocks/scheduling";
import { dateToIsoString, getTodayIsoString } from "@/lib/week-generator";
import {
  isPendingNotificationDismissed,
  dismissPendingNotification,
} from "@/app/(agendamentos)/(left-nav-bar)/dashboard/lib/pending-notification-storage";

const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function useAgendaView({
  appointments,
  onStatusChange,
  onNew,
  showToast,
  currentUserRole = "Administrador",
  currentUserName = "",
  currentUserId = "",
  userList = [],
}: {
  appointments: AppointmentProps[];
  onStatusChange: (id: string, status: "Confirmado" | "Cancelado" | "Concluído" | "Pendente") => Promise<void>;
  onNew: () => void;
  showToast: (message: string) => void;
  currentUserRole?: "Dono" | "Administrador" | "Gestor" | "Funcionario";
  currentUserName?: string;
  currentUserId?: string;
  userList?: { id?: string; name: string; role?: string }[];
}) {
  const { setPageHeader } = useAppShell();
  const { serviceList } = useServices();

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [agendaScope, setAgendaScope] = useState("Geral");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [onlyPending, setOnlyPending] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(() => !isPendingNotificationDismissed());

  const todayIso = getTodayIsoString();
  const selectedIso = dateToIsoString(selectedDate);

  useEffect(() => {
    setPageHeader({
      title: "Agenda Completa",
      subtitle: `${fullDateFormatter.format(selectedDate)} — Visão da agenda (${currentUserRole})`,
    });
    return () => setPageHeader(null);
  }, [selectedDate, currentUserRole, setPageHeader]);

  // Compromissos visíveis para o usuário atual, independente da data selecionada
  const visibleAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      if (currentUserRole === "Funcionario") {
        const isMine =
          appt.userId === currentUserId ||
          (!appt.userId && appt.userName === currentUserName);
        if (!isMine) return false;
      } else if (currentUserRole === "Gestor") {
        if (appt.userRole === "Administrador") return false;
      }

      if (agendaScope !== "Geral") {
        if (appt.userName !== agendaScope && appt.userId !== agendaScope) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, currentUserRole, currentUserName, currentUserId, agendaScope]);

  // Agendamentos pendentes válidos (não expirados)
  const pendingAppointments = useMemo(() => {
    return visibleAppointments
      .filter(
        (a) =>
          a.status === "Pendente" &&
          !isBookingTimeExpired(a.date, a.time, new Date(), 0),
      )
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [visibleAppointments]);

  // Modal de notificação de pendências


  const handleClosePendingModal = () => {
    dismissPendingNotification();
    setIsPendingModalOpen(false);
  };

  const handleReviewPending = () => {
    dismissPendingNotification();
    setIsPendingModalOpen(false);
    setOnlyPending(true);
    setPage(1);
  };

  const markedDates = useMemo(() => {
    return new Set(visibleAppointments.map((appt) => appt.date));
  }, [visibleAppointments]);

  const dateAppointmentsCount = useMemo(() => {
    return visibleAppointments.filter((appt) => appt.date === selectedIso).length;
  }, [visibleAppointments, selectedIso]);

  const filteredAppointments = useMemo(() => {
    return visibleAppointments.filter((appt) => {
      const matchDate = onlyPending
        ? appt.status === "Pendente" && !isBookingTimeExpired(appt.date, appt.time, new Date(), 0)
        : appt.date === selectedIso;

      const matchSearch =
        appt.name.toLowerCase().includes(search.toLowerCase()) ||
        appt.service?.toLowerCase().includes(search.toLowerCase()) ||
        (appt.userName || "").toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        onlyPending || statusFilter === "Todos" || appt.status === statusFilter;

      return matchDate && matchSearch && matchStatus;
    }).sort((a, b) => {
      if (onlyPending) {
        return (a.date + a.time).localeCompare(b.date + b.time);
      }
      return a.time.localeCompare(b.time);
    });
  }, [visibleAppointments, search, statusFilter, selectedIso, onlyPending]);

  const pagedAppointments = useMemo(
    () => paginateItems(filteredAppointments, page, 10),
    [filteredAppointments, page],
  );

  const channelMap = useMemo(() => {
    const map = new Map<string, string>();
    appointmentChannels.forEach((c) => map.set(c.id, c.name));
    return map;
  }, []);
  return {
    serviceList,
    selectedDate,
    setSelectedDate,
    calendarMonth,
    setCalendarMonth,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    agendaScope,
    setAgendaScope,
    openMenuId,
    setOpenMenuId,
    page,
    setPage,
    onlyPending,
    setOnlyPending,
    isPendingModalOpen,
    todayIso,
    selectedIso,
    pendingAppointments,
    handleClosePendingModal,
    handleReviewPending,
    markedDates,
    dateAppointmentsCount,
    filteredAppointments,
    pagedAppointments,
    channelMap,
  };
}
