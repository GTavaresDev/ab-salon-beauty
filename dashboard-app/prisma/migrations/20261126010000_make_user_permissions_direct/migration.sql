-- Permissões pertencem diretamente ao usuário. Não existe mais catálogo global.
DELETE FROM "UserPermissions"
WHERE "name" IN ('ver_relatorios', 'compartilhar_permissoes');

ALTER TABLE "UserPermissions"
  DROP CONSTRAINT IF EXISTS "UserPermissions_permissionId_fkey";

DROP INDEX IF EXISTS "UserPermissions_userId_permissionId_key";

ALTER TABLE "UserPermissions"
  DROP COLUMN IF EXISTS "permissionId",
  DROP COLUMN IF EXISTS "isSystemPermission";

DROP TABLE IF EXISTS "SystemPermissions";
