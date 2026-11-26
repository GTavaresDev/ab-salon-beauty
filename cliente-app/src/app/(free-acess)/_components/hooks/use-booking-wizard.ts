"use client";

import { STEP_TITLE, type BookingWizardProps } from "../booking-wizard/booking-wizard.types";
import { useBookingWizard } from "../booking-wizard/use-booking-wizard";

export function useBookingWizardView({ services }: BookingWizardProps) {
  const {
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
  } = useBookingWizard();

  const { title, subtitle } = STEP_TITLE[step];
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
    title,
    subtitle,
  };
}
