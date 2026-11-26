import { ALL_TIMES } from "@core/server/rule/booking-grid";

const DURATION_LABELS = ["30 min", "60 min (1h)", "90 min (1h30)"] as const;
export const SLOT_MINUTES = 30;
export const MAX_SLOTS_PER_APPOINTMENT = DURATION_LABELS.length;

export function minutesFromDuration(label: string): number {
  if (label === "1h") return 60;
  if (label === "1h30") return 90;
  const match = /^(\d+)(?:\s*(?:min|m))?(?: \(1h(?:30)?\))?$/.exec(label.trim());
  return match ? Number(match[1]) : NaN;
}

export function slotsFromMinutes(minutes: number): number {
  return Math.ceil(minutes / SLOT_MINUTES);
}

export function durationLabelFromMinutes(minutes: number): string {
  const label = DURATION_LABELS[slotsFromMinutes(minutes) - 1];
  if (!label) throw new Error("A duração deve caber em uma reserva de até 90 minutos.");
  return label;
}

function consecutiveSlots(start: string, minutes: number): string[] {
  const index = ALL_TIMES.indexOf(start);
  if (index < 0) return [];
  const [hour, minute] = start.split(":").map(Number);
  const startMinute = hour * 60 + minute;
  return ALL_TIMES.slice(index, index + slotsFromMinutes(minutes)).filter((time, offset) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m === startMinute + offset * SLOT_MINUTES;
  });
}

export function occupiedSlots(start: string, duration: string): string[] {
  const minutes = minutesFromDuration(duration);
  return consecutiveSlots(start, minutes > 0 ? minutes : SLOT_MINUTES);
}

export function startTimesThatFit(minutes: number): string[] {
  if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 90) return [];
  return ALL_TIMES.filter((time) => consecutiveSlots(time, minutes).length === slotsFromMinutes(minutes));
}
