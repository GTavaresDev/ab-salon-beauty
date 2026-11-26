"use server";

import { createReportGateway } from "@core/server/gateway/report.gateway";
import type { DashboardMetrics } from "@core/server/use-case/reports/get-dashboard-metrics.use-case";
import type { ReportMetrics } from "@core/server/use-case/reports/get-report-metrics.use-case";
import { requireSessionAction } from "@core/application/query/controller/users/auth.controller";
import { CacheKeys, CacheTTL, getCached } from "@core/server/cache/index";
import { canAccessReports, canViewDashboardMetrics } from "@/lib/permissions";
import { prisma } from "@core/server/db/prisma";


const { dashboard, report } = createReportGateway();

export async function fetchDashboardMetricsAction(): Promise<DashboardMetrics> {
  const session = await requireSessionAction();
  if (!canViewDashboardMetrics(session)) {
    throw new Error("Você não tem permissão para ver os indicadores da dashboard.");
  }
  const useCase = dashboard;
  return await useCase.execute();
}

/**
 * Métricas do período. É o caminho mais caro do sistema — quatro tabelas
 * inteiras somadas em memória (~800 ms no Neon) — e é puramente informativo,
 * então tolera a defasagem do TTL de 20 min.
 *
 * A permissão é conferida AQUI, e não só na página: a página apenas redireciona
 * quem não pode ver, mas a Server Action é chamável direto, e ela devolve
 * faturamento e dados de clientes. A verificação vem antes do cache — o Redis
 * nunca é um caminho alternativo para escapar da autorização.
 */
export async function fetchReportMetricsAction(period?: string): Promise<ReportMetrics> {
  const session = await requireSessionAction();
  if (!canAccessReports(session)) {
    throw new Error("Você não tem permissão para ver relatórios.");
  }

  const metrics = await getCached(CacheKeys.reports(period ?? "padrao"), CacheTTL.reports, () =>
    report.execute(period),
  );

  const now = new Date();
  const start = new Date(now);
  switch (period) {
    case "Este mês":
      start.setDate(1);
      break;
    case "Últimos 3 meses":
      start.setMonth(start.getMonth() - 3);
      break;
    case "Últimos 6 meses":
      start.setMonth(start.getMonth() - 6);
      break;
    case "Este ano":
      start.setMonth(0);
      start.setDate(1);
      break;
    default:
      start.setMonth(start.getMonth() - 6);
  }
  const ratings = await prisma.appointmentReview.groupBy({
    by: ["attendantId"],
    where: { rating: { not: null }, reviewedAt: { gte: start, lte: now } },
    _avg: { rating: true },
  });
  const scoreByAttendant = new Map(ratings.map((item) => [item.attendantId, item._avg.rating]));
  // Os relatórios em cache podem ter sido criados antes de `professionals.id` existir.
  const users = await prisma.user.findMany({ select: { id: true, name: true } });
  const userIdByName = new Map(users.map((user) => [user.name, user.id]));

  return {
    ...metrics,
    professionals: metrics.professionals.map((professional) => ({
      ...professional,
      score: (scoreByAttendant.get(professional.id ?? userIdByName.get(professional.name) ?? "") ?? 0).toFixed(1),
    })),
  };
}
