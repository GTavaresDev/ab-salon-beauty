import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "node:path";
import { hashPassword } from "@core/server/auth/password";

config({ path: resolve(process.cwd(), "..", ".env.local"), override: true });

const prisma = new PrismaClient();

const ADMIN_ID = "bb323bc0-f216-4309-8ef5-db9ea664e845";
const EMPLOYEE_ID = "user-mariana-costa";

async function main() {
  console.log("=== Limpando Banco de Dados ===");

  await prisma.sale.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.appointmentStatus.deleteMany({});
  await prisma.appointmentChannel.deleteMany({});
  await prisma.userPermission.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("\n1. Criando Status de Atendimento...");
  const appointmentStatuses = [
    {
      id: "status-confirmado",
      name: "Confirmado",
      description: "Agendamento confirmado pela equipe",
    },
    {
      id: "status-aguardando",
      name: "Aguardando confirmação",
      description: "Agendamento criado pelo cliente aguardando confirmação",
    },
    {
      id: "status-concluido",
      name: "Concluído",
      description: "Atendimento concluído com sucesso",
    },
    {
      id: "status-cancelado",
      name: "Cancelado",
      description: "Agendamento cancelado",
    },
  ];
  for (const st of appointmentStatuses) {
    await prisma.appointmentStatus.upsert({
      where: { name: st.name },
      update: { description: st.description },
      create: st,
    });
  }

  console.log("\n2. Criando Canais de Agendamento...");
  await prisma.appointmentChannel.createMany({
    data: [
      { id: "site", name: "Sistema", value: 0, percent: 0, digital: true },
      { id: "whatsapp", name: "WhatsApp", value: 0, percent: 0, digital: true },
      {
        id: "recepcao",
        name: "Recepção",
        value: 0,
        percent: 0,
        digital: false,
      },
      {
        id: "instagram",
        name: "Instagram",
        value: 0,
        percent: 0,
        digital: true,
      },
    ],
  });

  console.log("\n3. Criando Usuários (Funcionários / Profissionais)...");
  const defaultPassword = await hashPassword("zxcasd");
  const adminPassword = await hashPassword("lkjh-poiu-zxc10");

  await prisma.user.create({
    data: {
      id: ADMIN_ID,
      name: "Product Manegar",
      email: "admin@agendamentos.com",
      phone: "(11) 90000-0001",
      password: adminPassword,
      status: "Ativo",
      initials: "AH",
      last: "Online",
      failedLoginAttempts: 0,
    },
  });

  await prisma.user.create({
    data: {
      id: EMPLOYEE_ID,
      name: "Mariana Costa",
      email: "func@agendamentos.com",
      phone: "(11) 90000-0003",
      password: defaultPassword,
      status: "Ativo",
      initials: "MC",
      last: "Hoje",
      failedLoginAttempts: 0,
    },
  });

  await prisma.userPermission.createMany({
    data: [
      { userId: ADMIN_ID, name: "Product Manegar" },
      { userId: EMPLOYEE_ID, name: "Usuario" },
    ],
  });

  console.log("\n4. Criando Catálogo de Serviços...");
  const serviceDefs = [
    {
      id: "srv-1",
      name: "Consulta Inicial",
      description: "Avaliação estética facial completa",
      duration: 30,
      price: 150.0,
      color: "#10b981",
    },
  ];

  for (const s of serviceDefs) {
    await prisma.service.create({ data: { ...s, status: "Ativo" } });
  }

  console.log("\n5. Criando Catálogo de Produtos...");
  const productDefs = [
    {
      id: "prod-1",
      name: "Sérum Anti-idade Ácido Hialurônico 30ml",
      category: "Skincare",
      price: 180.0,
      quantity: 45,
    },
  ];

  for (const p of productDefs) {
    await prisma.product.create({ data: { ...p, status: "Ativo" } });
  }

  console.log("\n6. Criando Cliente de Exemplo...");
  await prisma.client.create({
    data: {
      id: "cli-1",
      name: "Ana Paula Silva",
      email: "ana.paula.silva@gmail.com",
      phone: "(11) 90000-0002",
      status: "Ativo",
      initials: "AS",
    },
  });

  console.log("\nNenhum agendamento ou venda histórica foi criado.");

  console.log("\n=== Banco de Dados semeado com sucesso! ===");
}

main()
  .catch((error) => {
    console.error("Erro ao semear banco de dados:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
