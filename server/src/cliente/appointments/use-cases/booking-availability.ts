import type { DataSource, EntityManager } from 'typeorm';

const TIMES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
];
const ZONE = { timeZone: 'America/Sao_Paulo' };

export function bookingDays(now: Date): string[] {
  const today = new Date(now.toLocaleDateString('sv-SE', ZONE));
  return Array.from({ length: 14 }, (_, offset) => {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() + offset);
    return day.toISOString().slice(0, 10);
  });
}

export function durationBlocks(minutes: number): number {
  return Number.isFinite(minutes) && minutes > 0 && minutes <= 90 ? Math.ceil(minutes / 30) : 0;
}

function minutesOf(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function slots(time: string, blocks: number): string[] {
  const index = TIMES.indexOf(time);
  if (index < 0) return [];
  return TIMES.slice(index, index + blocks)
    .filter((slot, offset) => minutesOf(slot) === minutesOf(time) + offset * 30);
}

export async function readOccupancy(db: DataSource | EntityManager, start: string, end: string) {
  const rows: Array<{ date: string; time: string; duration: string }> = await db.query(
    `SELECT date, time, duration FROM "Appointments"
     WHERE date BETWEEN $1 AND $2 AND status <> 'Cancelado'`,
    [start, end],
  );
  const byDate = new Map<string, Set<string>>();
  for (const row of rows) {
    const occupied = byDate.get(row.date) ?? new Set<string>();
    const label = row.duration.trim();
    const minutes = label === '1h' ? 60 : label === '1h30' ? 90 : Number(/^(\d+)/.exec(label)?.[1]) || 30;
    for (const slot of slots(row.time, Math.ceil(minutes / 30))) occupied.add(slot);
    byDate.set(row.date, occupied);
  }
  return byDate;
}

export function availableStarts(date: string, blocks: number, occupied: ReadonlySet<string> | undefined, now: Date): string[] {
  if (!blocks) return [];
  const today = now.toLocaleDateString('sv-SE', ZONE);
  if (date < today) return [];
  const cutoff = minutesOf(now.toLocaleTimeString('sv-SE', { ...ZONE, hour: '2-digit', minute: '2-digit' })) + 5;
  return TIMES.filter((time) => {
    if (date === today && minutesOf(time) <= cutoff) return false;
    const required = slots(time, blocks);
    return required.length === blocks && !required.some((slot) => occupied?.has(slot));
  });
}

export const BOOKABLE_CATALOG = `
  FROM "Services" s
  JOIN "Users" u ON s.id = ANY(u."serviceIds") AND u.status = 'Ativo'
  WHERE s.status = 'Ativo'
    AND lower(btrim(u.name)) NOT IN ('product manegar', 'administrador')
    AND NOT EXISTS (
      SELECT 1 FROM "UserPermissions" up
      WHERE up."userId" = u.id AND up.enabled = true
        AND up.name IN ('Dono', 'Product Manegar', 'Administrador')
    )
`;
