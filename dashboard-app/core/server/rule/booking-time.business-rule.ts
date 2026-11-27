export const BOOKING_TOLERANCE_MINUTES = 5;

const bookingClock = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/**
 * Retorna true quando o horário já passou da tolerância de agendamento.
 * Ex.: 14:00 permanece reservável até 14:05; depois disso fica indisponível.
 */
export function isBookingTimeExpired(
  dateIso: string,
  time: string,
  now: Date = new Date(),
  toleranceMinutes: number = BOOKING_TOLERANCE_MINUTES,
): boolean {
  const [year, month, day] = dateIso.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return true;
  }

  // Compare both wall-clock times on the same scale, regardless of the host timezone.
  const localNow = Date.parse(bookingClock.format(now).replace(" ", "T") + "Z")
    + now.getUTCMilliseconds();
  const slotStart = Date.UTC(year, month - 1, day, hours, minutes);
  const deadline = slotStart + toleranceMinutes * 60 * 1000;

  return localNow > deadline;
}
