-- Link each user permission to the system permission that defines it.
-- A previous database can have this migration in its Prisma history but lack
-- the table, so recreate the canonical table before linking existing rows.
CREATE TABLE IF NOT EXISTS "SystemPermissions" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "category" TEXT DEFAULT 'general',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "requiresHierarchy" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

ALTER TABLE "UserPermissions" ADD COLUMN "permissionId" INTEGER;

-- Restore the role-level permissions when a database was seeded before this
-- relationship existed.
INSERT INTO "SystemPermissions" ("name", "description", "category", "requiresHierarchy", "updatedAt")
VALUES
  ('ver_relatorios', 'Permite acesso ao módulo de Relatórios', 'reports', false, CURRENT_TIMESTAMP),
  ('compartilhar_permissoes', 'Permite atribuir permissões a outros usuários', 'admin', false, CURRENT_TIMESTAMP),
  ('Administrador', 'Acesso administrativo', 'roles', true, CURRENT_TIMESTAMP),
  ('Gestor', 'Acesso gerencial', 'roles', true, CURRENT_TIMESTAMP),
  ('Funcionario', 'Acesso operacional', 'roles', true, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

UPDATE "UserPermissions" AS user_permission
SET "permissionId" = system_permission."id"
FROM "SystemPermissions" AS system_permission
WHERE user_permission."name" = system_permission."name";

ALTER TABLE "UserPermissions"
  ADD CONSTRAINT "UserPermissions_permissionId_fkey"
  FOREIGN KEY ("permissionId") REFERENCES "SystemPermissions"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "UserPermissions_userId_permissionId_key"
  ON "UserPermissions"("userId", "permissionId");
