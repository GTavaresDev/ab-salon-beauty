"use client";

import { findAvailableStartTimes } from "@core/server/rule/availability.business-rule";
import { getOccupiedSlotsAction } from "@core/application/query/controller/appointments/appointment.controller";
import { durationLabelFromMinutes, occupiedSlots, minutesFromDuration } from "@core/server/rule/appointment-duration";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { isBookingTimeExpired } from "@/lib/appointment-time";
import { appointmentChannels } from "@/app/mocks/scheduling";
import { generateWeek, getCurrentWeekIndex } from "@/lib/week-generator";
import { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import {
  ClientScheduleConflictError,
  hasClientScheduleConflict,
} from "@core/server/rule/client-schedule-conflict.business-rule";
import { useAppShell } from "@/stores/app-shell.store";
import { useAppointments } from "@/app/(agendamentos)/(left-nav-bar)/agenda/hooks/use-appointments";
import { useClients } from "@/app/(agendamentos)/(left-nav-bar)/clientes/hooks/use-clients";
import { useServices } from "@/app/(agendamentos)/(left-nav-bar)/servicos/hooks/use-services";
import { openWhatsAppConfirmation } from "@/lib/whatsapp-helper";

export function useCreateAppointmentDialog({
  appointments,
  onClose,
  showToast,
}: {
  appointments: AppointmentProps[];
  onClose: () => void;
  showToast: (message: string) => void;
}) {
  const { allowPastBooking } = useAppShell();
  const { handleAddAppointment } = useAppointments();
  const { clientList } = useClients();
  const { serviceList } = useServices();

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(getCurrentWeekIndex());
  const [selectedTime, setSelectedTime] = useState("");
  const [manualDuration, setSelectedDuration] = useState("30 min");
  const [selectedChannel, setSelectedChannel] = useState("recepcao");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [serviceChoice, setSelectedService] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const weekDays = useMemo(() => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + weekOffset * 7);
    return generateWeek(baseDate);
  }, [weekOffset]);

  const selectedClient =
    clientList.find((client) => client.id === selectedClientId) || clientList[0];
  const clientName = selectedClient?.name || "";
  const clientId = selectedClient?.id;

  const currentService = serviceList.find((service) => service.id === serviceChoice) ?? serviceList[0];
  const selectedService = currentService?.name ?? "Consulta inicial";
  const serviceMinutes = currentService?.duration ?? minutesFromDuration(manualDuration);
  let selectedDuration = "Indisponível";
  if (serviceMinutes > 0 && serviceMinutes <= 90) selectedDuration = durationLabelFromMinutes(serviceMinutes);
  const targetDateStr = weekDays[selectedDay]?.iso || "";

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Desmarca o horário selecionado se ele expirou (evita depender de setState em efeito)
  const selectedTimeExpired =
    !!selectedTime && !allowPastBooking && isBookingTimeExpired(targetDateStr, selectedTime, now);
  const activeSelectedTime = selectedTimeExpired ? "" : selectedTime;

  const [occupancy, setOccupancy] = useState<{ date: string; slots: string[] }>();
  useEffect(() => {
    let active = true;
    getOccupiedSlotsAction(targetDateStr).then((slots) => {
      if (active) setOccupancy({ date: targetDateStr, slots });
    }).catch(() => {
      if (active) setOccupancy(undefined);
    });
    return () => { active = false; };
  }, [targetDateStr, appointments]);

  const available = findAvailableStartTimes(appointments, {
    date: targetDateStr, serviceMinutes, clientId: clientId ?? "",
    clientName, now, allowPastBooking,
  });
  function isTimeDisabled(time: string) {
    if (occupancy?.date !== targetDateStr || !available.includes(time)) return true;
    return occupiedSlots(time, selectedDuration).some((slot) => occupancy.slots.includes(slot));
  }

  async function addAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeSelectedTime) return;

    if (isTimeDisabled(activeSelectedTime)) {
      const conflict = hasClientScheduleConflict(appointments, {
        date: targetDateStr,
        time: activeSelectedTime,
        duration: selectedDuration,
        name: clientName || "Cliente",
        clientId: clientId || null,
      });
      showToast(
        conflict
          ? new ClientScheduleConflictError().message
          : "Horário indisponível: já passou da tolerância de 5 minutos ou está reservado.",
      );
      return;
    }

    setLoading(true);
    try {
      const channel = appointmentChannels.find((item) => item.id === selectedChannel);
      const service = currentService;
      await handleAddAppointment({
        date: targetDateStr,
        time: activeSelectedTime,
        name: clientName || "Cliente",
        service: selectedService,
        serviceId: service?.id,
        duration: selectedDuration,
        channelId: selectedChannel,
        allowPastBooking,
        notes,
        clientId,
      });
      openWhatsAppConfirmation({
        phone: selectedClient?.phone,
        clientName,
        date: targetDateStr,
        time: activeSelectedTime,
        professionalName: "Equipe da clínica",
        serviceName: selectedService,
      });
      showToast(
        `Agendamento de ${selectedDuration} criado e salvo no banco para às ${activeSelectedTime} via ${channel?.name || "Sistema"}`,
      );
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao agendar.";
      showToast(message);
    } finally {
      setLoading(false);
    }
  }
  return {
    clientList,
    serviceList,
    setWeekOffset,
    selectedDay,
    setSelectedDay,
    setSelectedTime,
    setSelectedDuration,
    selectedChannel,
    setSelectedChannel,
    setSelectedClientId,
    setSelectedService,
    notes,
    setNotes,
    loading,
    weekDays,
    selectedClient,
    currentService,
    serviceMinutes,
    selectedDuration,
    activeSelectedTime,
    isTimeDisabled,
    addAppointment,
  };
}
