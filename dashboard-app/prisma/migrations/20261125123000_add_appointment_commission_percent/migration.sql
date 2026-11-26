ALTER TABLE "Appointments" ADD COLUMN IF NOT EXISTS "commissionPercent" DOUBLE PRECISION;

UPDATE "Appointments" AS a
SET "commissionPercent" = COALESCE(u."commissionPercent", 0)
FROM "Users" AS u
WHERE a."userId" = u."id"
  AND a."status" = 'Concluído'
  AND a."commissionPercent" IS NULL;
