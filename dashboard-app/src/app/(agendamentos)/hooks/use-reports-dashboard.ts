"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/app/(agendamentos)/_components/app-data-provider.component";
import { reportAppointmentChannels as appointmentChannels } from "@/app/mocks/scheduling";

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function percentageChange(current: number, previous: number) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function useReportsDashboard() {
  const { appointments } = useAppData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [period, setPeriod] = useState("Últimos 6 meses");
  const [toast, setToast] = useState("");
  const heatColors = [
    "bg-zinc-100",
    "bg-zinc-200",
    "bg-zinc-400",
    "bg-zinc-600",
    "bg-zinc-950",
  ];
  const monthsInPeriod =
    period === "Este mês"
      ? 1
      : period === "Últimos 3 meses"
        ? 3
        : period === "Últimos 6 meses"
          ? 6
          : 12;
  const periodStart = new Date(2026, 8 - monthsInPeriod, 1).getTime();
  const previousStart = new Date(2026, 8 - monthsInPeriod * 2, 1).getTime();
  const previousEnd = new Date(periodStart);
  previousEnd.setDate(0);
  const filteredAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const date = new Date(`${appointment.date}T12:00:00`);
        return (
          date.getTime() >= periodStart &&
          date <= new Date("2026-08-31T23:59:59")
        );
      }),
    [appointments, periodStart],
  );
  const previousAppointments = appointments.filter((appointment) => {
    const date = new Date(`${appointment.date}T12:00:00`);
    return date.getTime() >= previousStart && date <= previousEnd;
  });
  const payableAppointments = filteredAppointments.filter(
    (appointment) =>
      appointment.status !== "Cancelado" &&
      appointment.status !== "Não compareceu",
  );
  const previousPayable = previousAppointments.filter(
    (appointment) =>
      appointment.status !== "Cancelado" &&
      appointment.status !== "Não compareceu",
  );
  const totalRevenue = payableAppointments.reduce(
    (total, appointment) => total + appointment.price,
    0,
  );
  const previousRevenue = previousPayable.reduce(
    (total, appointment) => total + appointment.price,
    0,
  );
  const completed = filteredAppointments.filter(
    (appointment) => appointment.status === "Concluído",
  ).length;
  const attendanceBase = filteredAppointments.filter(
    (appointment) =>
      appointment.status !== "Cancelado" && appointment.status !== "Pendente",
  ).length;
  const attendanceRate = attendanceBase ? (completed / attendanceBase) * 100 : 0;
  const occupiedMinutes = payableAppointments.reduce(
    (total, appointment) => total + appointment.durationMinutes,
    0,
  );
  const capacityMinutes = monthsInPeriod * 28 * 10 * 60;
  const occupancyRate = capacityMinutes
    ? Math.min(100, (occupiedMinutes / capacityMinutes) * 100)
    : 0;
  const appointmentChange = percentageChange(
    filteredAppointments.length,
    previousAppointments.length,
  );
  const revenueChange = percentageChange(totalRevenue, previousRevenue);

  const monthly = useMemo(() => {
    const grouped = new Map<
      string,
      { key: string; month: string; agendamentos: number; cancelados: number; receita: number }
    >();
    filteredAppointments.forEach((appointment) => {
      const date = new Date(`${appointment.date}T12:00:00`);
      const key = appointment.date.slice(0, 7);
      const current = grouped.get(key) ?? {
        key,
        month: new Intl.DateTimeFormat("pt-BR", { month: "short" })
          .format(date)
          .replace(".", ""),
        agendamentos: 0,
        cancelados: 0,
        receita: 0,
      };
      current.agendamentos += 1;
      if (appointment.status === "Cancelado") current.cancelados += 1;
      if (
        appointment.status !== "Cancelado" &&
        appointment.status !== "Não compareceu"
      ) {
        current.receita += appointment.price;
      }
      grouped.set(key, current);
    });
    return Array.from(grouped.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredAppointments]);

  const statusData = [
    { name: "Concluídos", status: "Concluído", color: "#18181b" },
    { name: "Confirmados", status: "Confirmado", color: "#71717a" },
    { name: "Pendentes", status: "Pendente", color: "#a1a1aa" },
    { name: "Cancelados", status: "Cancelado", color: "#d4d4d8" },
    { name: "Não compareceu", status: "Não compareceu", color: "#f4f4f5" },
  ].map((item) => ({
    ...item,
    value: filteredAppointments.filter(
      (appointment) => appointment.status === item.status,
    ).length,
  }));

  const serviceMap = new Map<string, { name: string; total: number; receita: number }>();
  payableAppointments.forEach((appointment) => {
    const current = serviceMap.get(appointment.service) ?? {
      name: appointment.service,
      total: 0,
      receita: 0,
    };
    current.total += 1;
    current.receita += appointment.price;
    serviceMap.set(appointment.service, current);
  });
  const services = Array.from(serviceMap.values()).sort((a, b) => b.total - a.total);

  const hourlyCounts = Array.from(
    new Set(filteredAppointments.map((appointment) => appointment.time.slice(0, 2))),
  )
    .sort()
    .map((hour) => ({
      hour: `${hour}h`,
      total: filteredAppointments.filter((appointment) => appointment.time.startsWith(hour)).length,
    }));
  const peakHourCount = Math.max(...hourlyCounts.map((item) => item.total), 1);
  const hourly = hourlyCounts.map((item) => ({
    hour: item.hour,
    ocupacao: Math.round((item.total / peakHourCount) * 100),
  }));
  const peakHour = hourly.reduce(
    (peak, item) => (item.ocupacao > peak.ocupacao ? item : peak),
    hourly[0] ?? { hour: "—", ocupacao: 0 },
  );

  const buckets = [8, 9, 10, 13, 14, 15, 16];
  const weekCounts = Array.from({ length: 6 }, (_, dayIndex) =>
    buckets.map(
      (hour) =>
        filteredAppointments.filter((appointment) => {
          const date = new Date(`${appointment.date}T12:00:00`);
          const normalizedDay = date.getDay() === 0 ? 6 : date.getDay() - 1;
          return normalizedDay === dayIndex && Number(appointment.time.slice(0, 2)) === hour;
        }).length,
    ),
  );
  const maxHeat = Math.max(...weekCounts.flat(), 1);
  const weekMatrix = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
    (day, index) => ({
      day,
      values: weekCounts[index].map((value) => Math.round((value / maxHeat) * 4)),
    }),
  );

  const channelData = appointmentChannels.map((channel) => {
    const value = filteredAppointments.filter(
      (appointment) => appointment.channelId === channel.id,
    ).length;
    return {
      ...channel,
      value,
      percent: filteredAppointments.length
        ? Math.round((value / filteredAppointments.length) * 100)
        : 0,
    };
  });
  const digitalChannelTotal = channelData
    .filter((channel) => channel.digital)
    .reduce((total, channel) => total + channel.value, 0);
  const digitalChannelPercent = filteredAppointments.length
    ? Math.round((digitalChannelTotal / filteredAppointments.length) * 100)
    : 0;

  const professionalNames = Array.from(
    new Set(filteredAppointments.map((appointment) => appointment.professional)),
  );
  const professionalCounts = professionalNames.map((name) => ({
    name,
    records: filteredAppointments.filter(
      (appointment) => appointment.professional === name,
    ),
  }));
  const maxProfessionalCount = Math.max(
    ...professionalCounts.map((item) => item.records.length),
    1,
  );
  const professionals = professionalCounts
    .map(({ name, records }) => {
      const valid = records.filter((item) => item.status !== "Cancelado");
      const attended = records.filter((item) => item.status === "Concluído");
      const presence = valid.length ? (attended.length / valid.length) * 100 : 0;
      const revenue = records
        .filter(
          (item) => item.status !== "Cancelado" && item.status !== "Não compareceu",
        )
        .reduce((total, item) => total + item.price, 0);
      return {
        name,
        initials: initials(name),
        appointments: records.length,
        presence: `${presence.toFixed(1).replace(".", ",")}%`,
        occupancy: `${Math.round((records.length / maxProfessionalCount) * 100)}%`,
        revenue: formatCurrency(revenue),
        score: (4.5 + Math.min(0.4, presence / 250)).toFixed(1).replace(".", ","),
      };
    })
    .sort((a, b) => b.appointments - a.appointments);

  const clientNames = Array.from(
    new Set(filteredAppointments.map((appointment) => appointment.name)),
  );
  const clients = clientNames
    .map((name) => {
      const records = filteredAppointments
        .filter((appointment) => appointment.name === name)
        .sort((a, b) => b.date.localeCompare(a.date));
      const spent = records
        .filter(
          (item) => item.status !== "Cancelado" && item.status !== "Não compareceu",
        )
        .reduce((total, item) => total + item.price, 0);
      return {
        name,
        initials: initials(name),
        visits: records.length,
        spent: formatCurrency(spent),
        last: records[0]?.date
          ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
              .format(new Date(`${records[0].date}T12:00:00`))
              .replace(".", "")
          : "—",
        status: records.length >= 5 ? "Recorrente" : "Ativo",
      };
    })
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5);

  const received = filteredAppointments
    .filter((appointment) => appointment.status === "Concluído")
    .reduce((total, appointment) => total + appointment.price, 0);
  const receivable = filteredAppointments
    .filter(
      (appointment) =>
        appointment.status === "Confirmado" || appointment.status === "Pendente",
    )
    .reduce((total, appointment) => total + appointment.price, 0);
  const cancelledRevenue = filteredAppointments
    .filter(
      (appointment) =>
        appointment.status === "Cancelado" ||
        appointment.status === "Não compareceu",
    )
    .reduce((total, appointment) => total + appointment.price, 0);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  function exportReport() {
    const header = [
      "Data",
      "Horário",
      "Cliente",
      "Serviço",
      "Status",
      "Canal",
      "Valor",
    ];
    const rows = filteredAppointments.map((appointment) => [
      appointment.date,
      appointment.time,
      appointment.name,
      appointment.service,
      appointment.status,
      appointmentChannels.find((channel) => channel.id === appointment.channelId)?.name ?? "",
      appointment.price.toFixed(2),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(";"))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-${period.toLowerCase().replaceAll(" ", "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Relatório exportado em CSV");
  }
  return {
    appointments,
    menuOpen,
    setMenuOpen,
    period,
    setPeriod,
    toast,
    heatColors,
    filteredAppointments,
    previousAppointments,
    payableAppointments,
    totalRevenue,
    previousRevenue,
    completed,
    attendanceBase,
    attendanceRate,
    occupiedMinutes,
    occupancyRate,
    appointmentChange,
    revenueChange,
    monthly,
    statusData,
    services,
    hourly,
    peakHour,
    weekMatrix,
    channelData,
    digitalChannelTotal,
    digitalChannelPercent,
    professionals,
    clients,
    received,
    receivable,
    cancelledRevenue,
    showToast,
    exportReport,
  };
}
