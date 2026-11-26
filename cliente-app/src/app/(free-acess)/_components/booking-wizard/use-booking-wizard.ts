import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  BookableServiceDTO,
} from "@core/application/query/contract/service.contract";
import type { BookableProfessionalDTO } from "@core/application/query/contract/professional.contract";
import type { ClientAppointmentDTO } from "@core/application/interfaces/appointments/client-appointment";
import {
  createClientAppointmentAction,
} from "@core/application/query/controller/create-appointment.controller";
import { getAvailableDatesAction, getAvailableTimesAction } from "@core/application/query/controller/get-date.controller";
import { getProfessionalsController } from "@core/application/query/controller/get-professionals.controller";
import { STEP_ORDER, Step } from "./booking-wizard.types";

export function useBookingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("servico");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [service, setService] = useState<BookableServiceDTO | null>(null);
  const [professional, setProfessional] = useState<BookableProfessionalDTO | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [professionals, setProfessionals] = useState<BookableProfessionalDTO[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [booked, setBooked] = useState<ClientAppointmentDTO | null>(null);

  async function selectService(selected: BookableServiceDTO) {
    setService(selected);
    setProfessional(null);
    setDate("");
    setTime("");
    setError("");
    setLoading(true);
    setStep("profissional");

    const list = await getProfessionalsController(selected.id);
    setProfessionals(list);
    setLoading(false);
  }

  async function selectProfessional(selected: BookableProfessionalDTO) {
    setProfessional(selected);
    setDate("");
    setTime("");
    setLoading(true);
    setStep("data");

    const available = await getAvailableDatesAction(service!.id);
    setDates(available);
    setLoading(false);
  }

  async function selectDate(selected: string) {
    setDate(selected);
    setTime("");
    setLoading(true);
    setStep("horario");

    const available = await getAvailableTimesAction(service!.id, selected);
    setTimes(available);
    setLoading(false);
  }

  function selectTime(selected: string) {
    setTime(selected);
    setStep("confirmacao");
  }

  async function confirm() {
    if (!service || !professional || !date || !time) return;

    setLoading(true);
    setError("");

    const result = await createClientAppointmentAction({
      serviceId: service.id,
      professionalId: professional.id,
      date,
      time,
    });

    setLoading(false);

    if (!result.success || !result.data) {
      setError(result.error || "Não foi possível agendar.");
      // O horário pode ter sido ocupado durante o fluxo: volta para a escolha.
      const refreshed = await getAvailableTimesAction(service.id, date);
      setTimes(refreshed);
      setTime("");
      setStep("horario");
      return;
    }

    setBooked(result.data);
    setStep("sucesso");
    router.refresh();
  }

  function goBack() {
    setError("");
    const index = STEP_ORDER.indexOf(step);
    if (index > 0) {
      setStep(STEP_ORDER[index - 1]);
    }
  }

  const stepIndex = STEP_ORDER.indexOf(step);

  return {
    step,
    stepIndex,
    loading,
    error,
    service,
    professional,
    date,
    time,
    professionals,
    dates,
    times,
    booked,
    selectService,
    selectProfessional,
    selectDate,
    selectTime,
    confirm,
    goBack,
  };
}
