const DURATION_LABELS = ["30 min", "60 min (1h)", "90 min (1h30)"] as const;

export function durationLabelFromMinutes(minutes: number): string {
  const slots = Math.ceil(minutes / 30);
  const label = DURATION_LABELS[slots - 1];
  if (!label) throw new Error("A duração deve caber em uma reserva de até 90 minutos.");
  return label;
}
