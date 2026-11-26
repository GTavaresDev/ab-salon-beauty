-- O nível de acesso passa a existir somente como uma permissão direta do usuário.
INSERT INTO "UserPermissions" ("name", "userId", "enabled", "createdAt", "updatedAt")
SELECT
  CASE
    WHEN "role" = 'Administrador' THEN 'Product Manegar'
    WHEN "role" = 'Funcionario' THEN 'Usuario'
    ELSE "role"
  END,
  "id",
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Users"
ON CONFLICT ("userId", "name") DO NOTHING;

DELETE FROM "UserPermissions"
WHERE "name" IN ('Administrador', 'Funcionario');

ALTER TABLE "Users" DROP COLUMN "role";
