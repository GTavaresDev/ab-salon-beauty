ALTER TABLE "ClientPasswordResetTokens" ADD COLUMN "issuedEmail" TEXT, ADD COLUMN "originHash" TEXT;
CREATE INDEX "ClientPasswordResetTokens_clientId_createdAt_idx" ON "ClientPasswordResetTokens" ("clientId", "createdAt");
CREATE INDEX "ClientPasswordResetTokens_originHash_createdAt_idx" ON "ClientPasswordResetTokens" ("originHash", "createdAt");
