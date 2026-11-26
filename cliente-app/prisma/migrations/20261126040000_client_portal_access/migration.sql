BEGIN;
CREATE TYPE "PortalAccess" AS ENUM ('WAITING', 'IN_REVIEW', 'APPROVED');
ALTER TABLE "Clients"
  ADD COLUMN "portalAccess" "PortalAccess" NOT NULL DEFAULT 'WAITING',
  ADD COLUMN "portalApprovedAt" TIMESTAMP(3),
  ADD COLUMN "portalApprovedById" TEXT;
UPDATE "Clients" SET "portalAccess" = 'APPROVED' WHERE status = 'Ativo';
COMMIT;
