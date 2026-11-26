"use client";

import { useEffect, useState } from "react";
import { fetchReportMetricsAction } from "@core/application/query/controller/reports/report.controller";
import type { ReportMetrics } from "@core/server/use-case/reports/get-report-metrics.use-case";

export const RELATORIO_VALIDO_MS = 1_200_000;

export const relatorioEmMemoria = new Map<string, { em: number; dados: ReportMetrics }>();

function lerDaMemoria(period: string): ReportMetrics | null {
  const guardado = relatorioEmMemoria.get(period);
  if (!guardado || Date.now() - guardado.em > RELATORIO_VALIDO_MS) {
    return null;
  }
  return guardado.dados;
}

export function useReportsDashboard() {
  const [period, setPeriod] = useState("Últimos 6 meses");
  // Já carregado nesta aba: entra com o dado em mãos, sem skeleton.
  const [dbMetrics, setDbMetrics] = useState<ReportMetrics | null>(() =>
    lerDaMemoria("Últimos 6 meses"),
  );
  const [loading, setLoading] = useState(() => lerDaMemoria("Últimos 6 meses") === null);

  useEffect(() => {
    let cancelado = false;
    if (lerDaMemoria(period)) return;

    fetchReportMetricsAction(period)
      .then((data) => {
        if (cancelado) return;
        if (data) {
          relatorioEmMemoria.set(period, { em: Date.now(), dados: data });
          setDbMetrics(data);
        }
      })
      // Sem isto, uma ação que falha (sem permissão, rede fora) deixa o
      // skeleton girando para sempre.
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [period]);

  function changePeriod(value: string) {
    const cached = lerDaMemoria(value);
    setLoading(!cached);
    if (cached) setDbMetrics(cached);
    setPeriod(value);
  }
  return {
    period,
    dbMetrics,
    loading,
    changePeriod,
  };
}
