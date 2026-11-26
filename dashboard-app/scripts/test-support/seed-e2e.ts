import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@core/server/auth/password";
import { readFileSync } from "node:fs";

async function main() {
  if (process.env.E2E_ALLOW_DATABASE_WRITES !== "true") {
    throw new Error("Recusa de seed E2E sem autorização explícita para gravar fixtures.");
  }

  const fixturesFile = process.env.E2E_FIXTURES_FILE;
  if (!fixturesFile || !process.env.E2E_TEST_NAMESPACE) {
    throw new Error("Manifesto e namespace das fixtures são obrigatórios.");
  }
  const fixtures = JSON.parse(readFileSync(fixturesFile, "utf8")) as {
    namespace: string;
    adminEmail: string;
    clientEmail: string;
    professionalEmail: string;
    serviceName: string;
    appointmentId: string;
  };
  const prisma = new PrismaClient();
  try {
    const adminPassword = await hashPassword("E2e-Admin-Password-934!");
    const clientPassword = await hashPassword("E2e-Client-Password-934!");

    await prisma.user.create({
      data: {
        name: "Administrador E2E",
        email: fixtures.adminEmail,
        phone: "11999990010",
        password: adminPassword,
        initials: "AE",
      },
    });
    const professional = await prisma.user.create({
      data: {
        name: "Profissional E2E",
        email: fixtures.professionalEmail,
        phone: "11999990011",
        password: adminPassword,
        initials: "PE",
      },
    });
    const client = await prisma.client.create({
      data: {
        name: "Cliente E2E",
        email: fixtures.clientEmail,
        phone: "11999990012",
        password: clientPassword,
        birthDate: "1990-01-15",
        initials: "CE",
      },
    });
    const service = await prisma.service.create({
      data: {
        name: fixtures.serviceName,
        description: "Serviço de teste automatizado",
        duration: 30,
        price: 1234,
        status: "Ativo",
      },
    });

    await prisma.appointment.create({
      data: {
        id: fixtures.appointmentId,
        date: "2020-01-02",
        time: "09:00",
        name: client.name,
        service: service.name,
        duration: "30 min",
        status: "Concluído",
        initials: client.initials,
        channelId: "e2e",
        notes: "PRIVATE_E2E_NOTE",
        userId: professional.id,
        clientId: client.id,
        serviceId: service.id,
      },
    });

    console.info("E2E fixtures created with isolated IDs.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Could not seed disposable E2E database.", error);
  process.exitCode = 1;
});
