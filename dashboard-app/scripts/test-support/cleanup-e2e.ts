import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

async function main() {
  if (process.env.E2E_ALLOW_DATABASE_WRITES !== "true" || !process.env.E2E_FIXTURES_FILE) {
    throw new Error("Recusa de limpeza E2E sem a confirmação explícita e o manifesto de fixtures.");
  }

  const fixtures = JSON.parse(readFileSync(process.env.E2E_FIXTURES_FILE, "utf8")) as {
    namespace: string;
    appointmentId: string;
    adminEmail: string;
    clientEmail: string;
    serviceName: string;
  };
  const prisma = new PrismaClient();
  try {
    await prisma.appointment.deleteMany({ where: { id: fixtures.appointmentId } });
    await prisma.client.deleteMany({ where: { email: fixtures.clientEmail } });
    await prisma.service.deleteMany({ where: { name: fixtures.serviceName } });
    await prisma.user.deleteMany({ where: { email: { endsWith: `-${fixtures.namespace}@agendamentos.test` } } });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Could not clean E2E fixtures.", error);
  process.exitCode = 1;
});
