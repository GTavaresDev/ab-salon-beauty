import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@core/server/auth/password";

const prodDatabaseUrl =
  process.argv[2] ||
  process.env.PROD_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!prodDatabaseUrl) {
  console.error("Erro: Nenhuma URL de banco de dados fornecida.");
  console.log('Uso: npx tsx scripts/seed-prod.ts "POSTGRESQL_URL_PRODUCAO"');
  process.exit(1);
}

const targetUrl: string = prodDatabaseUrl;
const MASTER_ADMIN_ID = "bb323bc0-f216-4309-8ef5-db9ea664e845";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: targetUrl,
    },
  },
});

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function main() {
  console.log("=== Inicializando Seed Completo de Produção ===");
  console.log("URL Target:", targetUrl.replace(/:[^:@]+@/, ":****@"));

  // 1. Status de Atendimento
  console.log("\n1. Criando Status de Atendimento...");
  const appointmentStatuses = [
    { id: "status-confirmado", name: "Confirmado", description: "Agendamento confirmado pela equipe" },
    { id: "status-aguardando", name: "Aguardando confirmação", description: "Agendamento criado pelo cliente aguardando confirmação" },
    { id: "status-concluido", name: "Concluído", description: "Atendimento concluído com sucesso" },
    { id: "status-cancelado", name: "Cancelado", description: "Agendamento cancelado" },
  ];
  for (const st of appointmentStatuses) {
    await prisma.appointmentStatus.upsert({
      where: { name: st.name },
      update: { description: st.description },
      create: st,
    });
  }

  // 2. Usuários
  console.log("\n2. Criando Usuários...");
  const adminPasswordHash = await hashPassword("zxcasd");
  const gabrielPasswordHash = await hashPassword("lkjh-poiu-zxc10");

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@agendamentos.com" },
    update: { id: MASTER_ADMIN_ID, name: "Admin Agendamentos", status: "Ativo" },
    create: {
      id: MASTER_ADMIN_ID,
      name: "Admin Agendamentos",
      email: "admin@agendamentos.com",
      phone: "(11) 90000-0001",
      password: adminPasswordHash,
      status: "Ativo",
      initials: "AH",
      last: "Online",
    },
  });

  const gabrielUser = await prisma.user.upsert({
    where: { email: "gabriel@agendamentos.com" },
    update: { name: "Gabriel Tavares", status: "Ativo" },
    create: {
      name: "Gabriel Tavares",
      email: "gabriel@agendamentos.com",
      phone: "(11) 99999-9999",
      password: gabrielPasswordHash,
      status: "Ativo",
      initials: "GT",
      last: "Online",
    },
  });

  const julianaUser = await prisma.user.upsert({
    where: { email: "juliana@agendamentos.com" },
    update: { name: "Dra. Juliana Martins", status: "Ativo" },
    create: {
      name: "Dra. Juliana Martins",
      email: "juliana@agendamentos.com",
      phone: "(11) 98888-0002",
      password: adminPasswordHash,
      status: "Ativo",
      initials: "JM",
      last: "Há 1h",
    },
  });

  const camilaUser = await prisma.user.upsert({
    where: { email: "camila@agendamentos.com" },
    update: { name: "Dra. Camila Rocha", status: "Ativo" },
    create: {
      name: "Dra. Camila Rocha",
      email: "camila@agendamentos.com",
      phone: "(11) 98888-0003",
      password: adminPasswordHash,
      status: "Ativo",
      initials: "CR",
      last: "Hoje",
    },
  });

  const funcUser = await prisma.user.upsert({
    where: { email: "func@agendamentos.com" },
    update: { name: "Mariana Costa", status: "Ativo" },
    create: {
      name: "Mariana Costa",
      email: "func@agendamentos.com",
      phone: "(11) 90000-0003",
      password: adminPasswordHash,
      status: "Ativo",
      initials: "MC",
      last: "Hoje",
    },
  });

  const users = [adminUser, gabrielUser, julianaUser, camilaUser, funcUser];

  // 3. Serviços
  console.log("\n3. Criando Serviços...");
  const serviceDefs = [
    { id: "srv-1", name: "Consulta Inicial", description: "Avaliação estética facial completa", duration: 30, price: 150.0, color: "#10b981" },
    { id: "srv-2", name: "Harmonização Facial", description: "Procedimento estético avançado com preenchedores", duration: 90, price: 1200.0, color: "#8b5cf6" },
    { id: "srv-3", name: "Botox", description: "Aplicação de toxina botulínica em terço superior", duration: 45, price: 850.0, color: "#3b82f6" },
    { id: "srv-4", name: "Limpeza de Pele", description: "Limpeza profunda com hidratação e extração", duration: 60, price: 220.0, color: "#f59e0b" },
    { id: "srv-5", name: "Preenchimento Labial", description: "Escultura e volumização labial com ácido hialurônico", duration: 60, price: 950.0, color: "#ec4899" },
    { id: "srv-6", name: "Peeling Químico", description: "Renovação celular e clareamento de manchas", duration: 45, price: 380.0, color: "#06b6d4" },
    { id: "srv-7", name: "Drenagem Linfática Facial", description: "Massagem desintoxicante e pós-operatória", duration: 45, price: 190.0, color: "#14b8a6" },
    { id: "srv-8", name: "Microagulhamento", description: "Indução percutânea de colágeno", duration: 60, price: 450.0, color: "#6366f1" },
  ];

  const createdServices = [];
  for (const s of serviceDefs) {
    const srv = await prisma.service.upsert({
      where: { id: s.id },
      update: { name: s.name, price: s.price, color: s.color, duration: s.duration },
      create: { ...s, status: "Ativo" },
    });
    createdServices.push(srv);
  }

  // 4. Produtos
  console.log("\n4. Criando Produtos...");
  const productDefs = [
    { id: "prod-1", name: "Sérum Anti-idade Ácido Hialurônico 30ml", category: "Skincare", price: 180.0, quantity: 45 },
    { id: "prod-2", name: "Protetor Solar Facial FPS 70", category: "Proteção Solar", price: 95.0, quantity: 80 },
    { id: "prod-3", name: "Máscara Hidratante Ouro 100g", category: "Tratamento", price: 140.0, quantity: 30 },
    { id: "prod-4", name: "Sabonete Facial Purificante 150ml", category: "Higienização", price: 65.0, quantity: 60 },
    { id: "prod-5", name: "Kit Pós-procedimento Facial", category: "Kits", price: 250.0, quantity: 25 },
    { id: "prod-6", name: "Tônico Facial Suavizante 200ml", category: "Skincare", price: 85.0, quantity: 40 },
    { id: "prod-7", name: "Creme Nutritivo Noturno 50g", category: "Skincare", price: 160.0, quantity: 35 },
  ];

  const createdProducts = [];
  for (const p of productDefs) {
    const prod = await prisma.product.upsert({
      where: { id: p.id },
      update: { name: p.name, price: p.price, quantity: p.quantity },
      create: { ...p, status: "Ativo" },
    });
    createdProducts.push(prod);
  }

  // 5. 50 Clientes Únicos
  console.log("\n5. Criando 50 Clientes...");
  const clientNames = [
    "Ana Paula Silva", "Carlos Eduardo Santos", "Mariana Oliveira", "Beatriz Costa", "Lucas Mendes",
    "Fernanda Lima", "Rodrigo Alves", "Juliana Barbosa", "Rafael Souza", "Camila Pereira",
    "Thiago Martins", "Vanessa Ribeiro", "Felipe Rocha", "Patricia Lima", "Gabriel Ferreira",
    "Larissa Gomez", "Diego Carvalho", "Renata Dias", "Marcelo Castro", "Aline Martins",
    "Bruno Xavier", "Carla Mendonça", "Daniel Fonseca", "Eduarda Ramos", "Fabio Nogueira",
    "Gabriela Teixeira", "Heitor Cardoso", "Isabela Duarte", "João Pedro Viana", "Katia Freitas",
    "Leonardo Silveira", "Manuela Aguiar", "Nicolas Barros", "Olivia Monteiro", "Paulo Roberto Nunes",
    "Priscila Faria", "Renan Borges", "Sabrina Neves", "Tatiana Machado", "Vinicius Peixoto",
    "Yasmin Figueiredo", "Arthur Moraes", "Bianca Antunes", "Caio Guimarães", "Debora Paiva",
    "Elisa Reis", "Fernando Marinho", "Giovanna Pires", "Hugo Brandão", "Ingrid Sales"
  ];

  const createdClients = [];
  for (let i = 0; i < clientNames.length; i++) {
    const name = clientNames[i];
    const cleanName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".");
    const email = `${cleanName}@gmail.com`;
    const phone = `(11) 9${Math.floor(Math.random() * 8999 + 1000)}-${Math.floor(Math.random() * 8999 + 1000)}`;

    const cli = await prisma.client.upsert({
      where: { email },
      update: { name, phone },
      create: {
        id: `cli-${i + 1}`,
        name,
        email,
        phone,
        status: "Ativo",
        initials: getInitials(name),
      },
    });
    createdClients.push(cli);
  }

  // 6. Agendamentos
  console.log("\n6. Criando Agendamentos para os últimos 3 meses...");
  const baseDate = new Date("2026-08-07T12:00:00Z");
  const timeSlots = ["08:30", "09:15", "10:00", "10:45", "11:30", "13:30", "14:30", "15:15", "16:00", "17:00", "18:00"];
  const channels = ["digital", "whatsapp", "presencial", "telefone"];
  const weightedServiceIndices = [0, 0, 0, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 6, 7];
  const weightedUserIndices = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];

  let apptCount = 0;
  for (let dayOffset = 90; dayOffset >= 0; dayOffset--) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() - dayOffset);
    const dayOfWeek = currentDate.getDay();

    let countForDay = 0;
    if (dayOfWeek === 0) countForDay = Math.random() < 0.2 ? 1 : 0;
    else if (dayOfWeek === 1) countForDay = Math.floor(Math.random() * 3) + 1;
    else if (dayOfWeek === 6) countForDay = Math.floor(Math.random() * 4) + 2;
    else countForDay = Math.floor(Math.random() * 4) + 3;

    const usedSlots = new Set<string>();
    for (let k = 0; k < countForDay; k++) {
      const slotIndex = Math.floor(Math.random() * timeSlots.length);
      const time = timeSlots[slotIndex];
      if (usedSlots.has(time)) continue;
      usedSlots.add(time);

      const client = createdClients[Math.floor(Math.random() * createdClients.length)];
      const service = createdServices[weightedServiceIndices[Math.floor(Math.random() * weightedServiceIndices.length)]];
      const user = users[weightedUserIndices[Math.floor(Math.random() * weightedUserIndices.length)]];
      const channelId = channels[Math.floor(Math.random() * channels.length)];

      let status = "Concluído";
      if (dayOffset <= 2) {
        status = Math.random() > 0.3 ? "Confirmado" : "Concluído";
      } else {
        const rand = Math.random();
        if (rand < 0.82) status = "Concluído";
        else if (rand < 0.90) status = "Confirmado";
        else if (rand < 0.96) status = "Cancelado";
        else status = "Pendente";
      }

      apptCount++;
      const id = `apt-${apptCount}`;
      const dateStr = formatDate(currentDate);

      await prisma.appointment.upsert({
        where: { id },
        update: { date: dateStr, time, status, userId: user.id, clientId: client.id, serviceId: service.id },
        create: {
          id,
          date: dateStr,
          time,
          name: client.name,
          service: service.name,
          duration: `${service.duration}m`,
          status,
          initials: client.initials,
          channelId,
          userId: user.id,
          clientId: client.id,
          serviceId: service.id,
          createdAt: new Date(currentDate.getTime() + (slotIndex * 3600000)),
        },
      });
    }
  }

  // 7. Vendas
  console.log("\n7. Criando Vendas de Produtos...");
  let salesCount = 0;
  const paymentMethods = ["Pix", "Pix", "Pix", "Crédito", "Crédito", "Débito", "Dinheiro"];

  for (let dayOffset = 90; dayOffset >= 0; dayOffset--) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() - dayOffset);
    if (currentDate.getDay() === 0 && Math.random() > 0.2) continue;

    const salesForDay = Math.floor(Math.random() * 4) + 2;
    for (let k = 0; k < salesForDay; k++) {
      const prod = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const totalPrice = Number((prod.price * quantity).toFixed(2));
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      salesCount++;
      const id = `sale-${salesCount}`;
      const saleDate = new Date(currentDate.getTime() + (Math.floor(Math.random() * 8 + 9) * 3600000));

      await prisma.sale.upsert({
        where: { id },
        update: { totalPrice, createdAt: saleDate },
        create: {
          id,
          productId: prod.id,
          quantity,
          unitPrice: prod.price,
          totalPrice,
          paymentMethod,
          createdById: user.id,
          createdAt: saleDate,
        },
      });
    }
  }

  console.log("\n=== Setup de Produção Concluído com Sucesso! ===");
}

main()
  .catch((e) => {
    console.error("\n Erro ao executar setup de produção:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
