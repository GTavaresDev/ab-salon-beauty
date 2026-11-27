"use client";

import { STEP_TITLE, type BookingWizardProps } from "../booking-wizard/booking-wizard.types";
import { useBookingWizard } from "../booking-wizard/use-booking-wizard";

export function useBookingWizardView({ flow }: BookingWizardProps) {
  const {
    services,
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
  } = useBookingWizard(flow);

  const { title, subtitle } = STEP_TITLE[step];
  return {
    services,
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
    title,
    subtitle,
  };
}
