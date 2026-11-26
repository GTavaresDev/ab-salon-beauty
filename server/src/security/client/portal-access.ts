import type { DataSource } from 'typeorm';

export async function hasPortalAccess(db: DataSource, clientId: string): Promise<boolean> {
  const rows = await db.query(
    'SELECT id FROM "Clients" WHERE id = $1 AND status = $2 AND "portalAccess" = $3',
    [clientId, 'Ativo', 'APPROVED'],
  );
  return rows.length === 1;
}
