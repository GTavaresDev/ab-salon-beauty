import { PrismaClient } from "@prisma/client";

// Nunca usar o DATABASE_URL padrão da aplicação nestes testes.
const url = new URL(process.env.TEST_DATABASE_URL ?? "about:blank");
if (url.protocol !== "postgresql:" || !["127.0.0.1", "[::1]"].includes(url.hostname)
    || url.pathname !== "/salon_fixture_test" || url.search || url.hash) {
  throw new Error("Configure TEST_DATABASE_URL para um PostgreSQL local descartável chamado salon_fixture_test.");
}
export const prisma = new PrismaClient({ datasourceUrl: url.href });
