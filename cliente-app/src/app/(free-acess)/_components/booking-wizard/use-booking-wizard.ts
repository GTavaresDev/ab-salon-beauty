import { useState } from "react";
import type { BookingFlow, BookingService } from "@core/application/query/contract/booking-flow.contract";
import type { BookableProfessionalDTO } from "@core/application/query/contract/professional.contract";
import type { ClientAppointmentDTO } from "@core/application/interfaces/appointments/client-appointment";
import { confirmBooking, loadBookingFlow } from "@core/application/query/controller/booking-flow.controller";
import { STEP_ORDER, type Step } from "./booking-wizard.types";

export function useBookingWizard(initialFlow: BookingFlow) {
  const [flow, setFlow] = useState(initialFlow);
  const [step, setStep] = useState<Step>("servico");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [service, setService] = useState<BookingService | null>(null);
  const [professional, setProfessional] = useState<BookableProfessionalDTO | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [booked, setBooked] = useState<ClientAppointmentDTO | null>(null);

  const byDate = service ? flow.availability[Math.ceil(service.durationMinutes / 30)] : undefined;
  const dates = byDate ? Object.keys(byDate) : [];
  const times = byDate?.[date] ?? [];

  function selectService(selected: BookingService) {
    setService(selected);
    setProfessional(null);
    setDate("");
    setTime("");
    setError("");
    setStep("profissional");
  }

  function selectProfessional(selected: BookableProfessionalDTO) {
    setProfessional(selected);
    setDate("");
    setTime("");
    setStep("data");
  }

  function selectDate(selected: string) {
    setDate(selected);
    setTime("");
    setStep("horario");
  }

  function selectTime(selected: string) {
    setTime(selected);
    setStep("confirmacao");
  }

  async function confirm() {
    if (loading || !professional || !date || !time) return;
    setLoading(true);
    setError("");

    try {
      const result = await confirmBooking({ selection: professional.id, date, time });
      if (result.success) {
        setBooked(result.data);
        setStep("sucesso");
        return;
      }

      setError(result.error);
      if (result.refresh) {
        const refreshed = await loadBookingFlow();
        if (refreshed.success) {
          setFlow(refreshed.data);
          setService(null);
          setProfessional(null);
          setDate("");
          setTime("");
          setStep("servico");
        } else {
          setError(refreshed.error);
        }
      }
    } catch {
      setError("Não foi possível concluir a solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setError("");
    const index = STEP_ORDER.indexOf(step);
    if (!loading && index > 0) setStep(STEP_ORDER[index - 1]);
  }

  return {
    services: flow.services,
    step,
    stepIndex: STEP_ORDER.indexOf(step),
    loading,
    error,
    service,
    professional,
    date,
    time,
    professionals: service?.professionals ?? [],
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
