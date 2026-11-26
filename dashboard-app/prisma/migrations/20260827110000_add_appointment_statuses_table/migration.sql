-- CreateTable
CREATE TABLE "AppointmentStatuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentStatuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentStatuses_name_key" ON "AppointmentStatuses"("name");

-- AlterTable
ALTER TABLE "Appointments" ADD COLUMN "statusId" TEXT;

-- Seed default statuses
INSERT INTO "AppointmentStatuses" ("id", "name", "description", "createdAt", "updatedAt") VALUES
('status-confirmado', 'Confirmado', 'Agendamento confirmado pela equipe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('status-aguardando', 'Aguardando confirmação', 'Agendamento criado pelo cliente aguardando confirmação', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('status-concluido', 'Concluído', 'Atendimento concluído com sucesso', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('status-cancelado', 'Cancelado', 'Agendamento cancelado', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Backfill existing appointments to link with statusId
UPDATE "Appointments"
SET "statusId" = (SELECT "id" FROM "AppointmentStatuses" WHERE "name" = 'Confirmado')
WHERE "status" = 'Confirmado';

UPDATE "Appointments"
SET "statusId" = (SELECT "id" FROM "AppointmentStatuses" WHERE "name" = 'Aguardando confirmação')
WHERE "status" = 'Pendente' OR "status" = 'Aguardando confirmação';

UPDATE "Appointments"
SET "statusId" = (SELECT "id" FROM "AppointmentStatuses" WHERE "name" = 'Concluído')
WHERE "status" = 'Concluído';

UPDATE "Appointments"
SET "statusId" = (SELECT "id" FROM "AppointmentStatuses" WHERE "name" = 'Cancelado')
WHERE "status" = 'Cancelado';

-- CreateIndex
CREATE INDEX "Appointments_statusId_idx" ON "Appointments"("statusId");

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "AppointmentStatuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
