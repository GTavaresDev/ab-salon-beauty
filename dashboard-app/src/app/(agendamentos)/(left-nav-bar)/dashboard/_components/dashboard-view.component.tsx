"use client";

import { useDashboardView } from "../hooks/use-dashboard-view";
import {
  ArrowRight,
  CalendarDays,
  Check,
  MoreVertical,
  Pencil,
  Plus,
  Power,
  TrendingUp,
  Trash2,
  UserCheck,
  Clock3,
  ShoppingCart,
  X,
} from "lucide-react";
import { Avatar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/avatar.component";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge.component";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import {
  ViewLoadingSkeleton,
  LoadingOverlayCard,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/page-skeletons.component";
import { ServiceColorIndicator } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/service-color-indicator.component";
import { cn } from "@/lib/utils";
import { appointmentAttendantLabel } from "@/lib/appointment-attendant";
import { resolveServiceColor } from "@/lib/service-color";
import { getStatusBadgeVariant } from "@/lib/appointment-status";
import { dateToIsoString } from "@/lib/week-generator";
import { StatCard } from "./stat-card.component";
import { PendingAppointmentsModal } from "./pending-appointments-modal.component";

export function DashboardView() {
  const {
    router,
    currentUser,
    showToast,
    appointmentsLoading,
    clientsLoading,
    serviceList,
    openMenuId,
    setOpenMenuId,
    onlyPending,
    setOnlyPending,
    isPendingModalOpen,
    onNew,
    onVerAgenda,
    appointments,
    clientsCount,
    onStatusChange,
    onDeleteAppointment,
    bars,
    todayIso,
    pendingAppointments,
    displayedAppointments,
    todayCount,
    todayCompletedCount,
    todayAttendanceRate,
    handleClosePendingModal,
    handleReviewPending,
  } = useDashboardView();

  const isFuncionario =
    currentUser?.permissionLevel === 3 || currentUser?.role === "Funcionario";

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-66px)]">
        <ViewLoadingSkeleton view="dashboard" />
      </div>
    );
  }

  if (appointmentsLoading || clientsLoading) {
    return (
      <div className="relative min-h-[calc(100vh-84px)]">
        <ViewLoadingSkeleton view="dashboard" />
        <LoadingOverlayCard label="Carregando dados..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-375 p-3.5 sm:p-6 lg:p-8 space-y-6">
      {/* Top Sections: Action Buttons + Stat Cards */}
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Indicadores Principais (Primeiro no Desktop) */}
        {!isFuncionario && (
          <div className="order-2 sm:order-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label="Agendamentos hoje"
              value={todayCount.toString().padStart(2, "0")}
              detail="de 8 horários"
              icon={CalendarDays}
              progress={Math.round((todayCount / 8) * 100)}
            />
            <StatCard
              label="Base de clientes"
              value={clientsCount.toString()}
              detail="clientes cadastrados"
              icon={UserCheck}
            />
            <StatCard
              label="Aguardando confirmação"
              value={pendingAppointments.length.toString().padStart(2, "0")}
              detail={pendingAppointments.length === 1 ? "1 a confirmar" : `${pendingAppointments.length} a confirmar`}
              icon={Clock3}
              highlight={pendingAppointments.length > 0}
              active={onlyPending}
              badge={
                pendingAppointments.length > 0 ? (
                  <span>{pendingAppointments.length} pendente{pendingAppointments.length > 1 ? "s" : ""}</span>
                ) : (
                  <span>Tudo em dia</span>
                )
              }
              badgeClassName={
                pendingAppointments.length > 0
                  ? "border-amber-500/30 bg-amber-500/20 text-amber-300"
                  : "border-white/10 bg-white/5 text-zinc-400"
              }
              onClick={() => setOnlyPending((prev) => !prev)}
            />
            <StatCard
              label="Taxa de presença"
              value={`${todayAttendanceRate}%`}
              detail={todayCount > 0 ? `${todayCompletedCount} de ${todayCount} agendamentos` : "sem agendamentos"}
              icon={Check}
              progress={todayAttendanceRate}
            />
            </div>
          </div>
        )}

        {/* Começar / Ações Rápidas (Abaixo dos cards no Desktop, Primeiro no Mobile) */}
        <div
          className={cn(
            "order-1 sm:order-2",
            isFuncionario && "mx-auto w-full max-w-[900px]",
          )}
        >
          <h2 className="mb-2.5 text-sm sm:text-base font-semibold tracking-tight text-zinc-950">
            Começar
          </h2>
          <div
            className={cn(
              "grid gap-2 sm:gap-4",
              isFuncionario
                ? "mx-auto w-full max-w-[900px] grid-cols-3"
                : "grid-cols-4",
            )}
          >
            <button
              type="button"
              onClick={onNew}
              className="group flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-white p-2 sm:p-4 text-center shadow-xs transition-all hover:border-zinc-300 hover:bg-zinc-50/60 hover:shadow-md active:scale-[0.98] min-h-[85px] sm:min-h-[125px] h-full"
            >
              <div className="flex size-8 sm:size-12 items-center justify-center rounded-lg sm:rounded-xl bg-zinc-100 text-zinc-900 transition-transform group-hover:scale-105">
                <Plus className="size-4 sm:size-6 stroke-[2]" />
              </div>
              <span className="mt-1.5 sm:mt-3 text-[11px] sm:text-xs font-semibold text-zinc-900 leading-tight text-center w-full">
                <span className="sm:hidden">Agendar</span>
                <span className="hidden sm:inline">Novo agendamento</span>
              </span>
            </button>

            <button
              type="button"
              onClick={onVerAgenda}
              className="group flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-white p-2 sm:p-4 text-center shadow-xs transition-all hover:border-zinc-300 hover:bg-zinc-50/60 hover:shadow-md active:scale-[0.98] min-h-[85px] sm:min-h-[125px] h-full"
            >
              <div className="flex size-8 sm:size-12 items-center justify-center rounded-lg sm:rounded-xl bg-zinc-100 text-zinc-900 transition-transform group-hover:scale-105">
                <CalendarDays className="size-4 sm:size-6 stroke-[1.75]" />
              </div>
              <span className="mt-1.5 sm:mt-3 text-[11px] sm:text-xs font-semibold text-zinc-900 leading-tight text-center w-full">
                <span className="sm:hidden">Agenda</span>
                <span className="hidden sm:inline">Ver agenda completa</span>
              </span>
            </button>

            {!isFuncionario && (
              <button
                type="button"
                onClick={() => router.push("/clientes?novo=1")}
                className="group flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-white p-2 sm:p-4 text-center shadow-xs transition-all hover:border-zinc-300 hover:bg-zinc-50/60 hover:shadow-md active:scale-[0.98] min-h-[85px] sm:min-h-[125px] h-full"
              >
                <div className="flex size-8 sm:size-12 items-center justify-center rounded-lg sm:rounded-xl bg-zinc-100 text-zinc-900 transition-transform group-hover:scale-105">
                  <UserCheck className="size-4 sm:size-6 stroke-[1.75]" />
                </div>
                <span className="mt-1.5 sm:mt-3 text-[11px] sm:text-xs font-semibold text-zinc-900 leading-tight text-center w-full">
                  <span className="sm:hidden">Clientes</span>
                  <span className="hidden sm:inline">Cadastrar cliente</span>
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => router.push("/vendas?novo=1")}
              className="group flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-white p-2 sm:p-4 text-center shadow-xs transition-all hover:border-zinc-300 hover:bg-zinc-50/60 hover:shadow-md active:scale-[0.98] min-h-[85px] sm:min-h-[125px] h-full"
            >
              <div className="flex size-8 sm:size-12 items-center justify-center rounded-lg sm:rounded-xl bg-zinc-100 text-zinc-900 transition-transform group-hover:scale-105">
                <ShoppingCart className="size-4 sm:size-6 stroke-[1.75]" />
              </div>
              <span className="mt-1.5 sm:mt-3 text-[11px] sm:text-xs font-semibold text-zinc-900 leading-tight text-center w-full">
                <span className="sm:hidden">Vendas</span>
                <span className="hidden sm:inline">Registrar venda</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 grid gap-4",
          isFuncionario
            ? "mx-auto w-full max-w-[900px]"
            : "xl:grid-cols-[1.55fr_1fr]",
        )}
      >
        <Card className="min-h-105 overflow-hidden">
          <CardHeader className="flex-row items-center justify-between gap-3 p-4 sm:px-6">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold text-zinc-950 truncate">
                {onlyPending ? "A confirmar" : "Agenda de hoje"}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="inline-flex h-8 items-center rounded-lg border border-zinc-200 bg-zinc-100/80 p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setOnlyPending(false)}
                  className={cn(
                    "h-full rounded-md px-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center justify-center",
                    !onlyPending
                      ? "bg-white text-zinc-900 shadow-xs font-semibold"
                      : "text-zinc-600 hover:text-zinc-900",
                  )}
                >
                  Hoje ({todayCount})
                </button>
                <button
                  type="button"
                  onClick={() => setOnlyPending(true)}
                  className={cn(
                    "h-full flex items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0",
                    onlyPending
                      ? "bg-white text-amber-700 shadow-xs font-semibold"
                      : pendingAppointments.length > 0
                        ? "text-amber-600 font-semibold hover:text-amber-700"
                        : "text-zinc-600 hover:text-zinc-900",
                  )}
                >
                  <Clock3 className="size-3.5 shrink-0" />
                  <span>Aguardando ({pendingAppointments.length})</span>
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onVerAgenda || onNew}
                className="h-8 px-2.5 text-xs font-medium whitespace-nowrap shrink-0 rounded-lg gap-1.5 border-zinc-200"
              >
                <span>Ver agenda</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <div className="min-h-85 max-h-85 overflow-y-auto divide-y divide-zinc-100">
              {displayedAppointments.map((item) => {
                const attendantLabel = appointmentAttendantLabel(item);
                const serviceColor = resolveServiceColor(serviceList, item);
                const isPending = item.status === "Pendente";
                const isTodayItem = item.date === todayIso;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "group relative flex min-h-17 items-center gap-2.5 sm:gap-4 px-3 sm:px-5 hover:bg-zinc-50 transition-colors",
                      isPending && "bg-amber-50/20 hover:bg-amber-50/40",
                    )}
                  >
                    <div className="w-14 shrink-0 text-sm font-semibold text-zinc-950">
                      <div>{item.time}</div>
                      {!isTodayItem ? (
                        <span className="block text-[10px] font-semibold text-amber-700">
                          {item.date.slice(8, 10)}/{item.date.slice(5, 7)}
                        </span>
                      ) : (
                        <span className="block text-[10px] font-normal text-zinc-400">
                          Hoje
                        </span>
                      )}
                    </div>
                    <ServiceColorIndicator color={serviceColor} variant="bar" />
                    <Avatar initials={item.initials} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {item.name}
                      </p>
                      <p className="truncate text-xs text-zinc-400">
                        <span className="sm:hidden">{item.service} ({item.duration})</span>
                        <span className="hidden sm:inline">{item.service} · {item.duration} · Atendente: {attendantLabel}</span>
                      </p>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      variant={getStatusBadgeVariant(item.status)}
                      className={cn(
                        "hidden sm:inline-flex",
                        isPending && "border-amber-300 bg-amber-100 text-amber-800 font-semibold",
                      )}
                    >
                      {isPending ? "Aguardando confirmação" : item.status}
                    </Badge>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(openMenuId === item.id ? null : item.id)
                        }
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-black transition-colors"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                      {openMenuId === item.id && (
                        <div className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={async () => {
                                  await onStatusChange(item.id, "Confirmado");
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
                              >
                                <Check className="size-4 shrink-0 text-emerald-600" /> Confirmar
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await onStatusChange(item.id, "Cancelado");
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50"
                              >
                                <X className="size-4 shrink-0 text-amber-600" /> Recusar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={async () => {
                                  const nextStatus = item.status === "Confirmado" ? "Concluído" : "Confirmado";
                                  await onStatusChange(item.id, nextStatus);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                              >
                                <Power className="size-4 shrink-0 text-zinc-500" />{" "}
                                {item.status === "Confirmado" ? "Marcar como Concluído" : "Marcar como Confirmado"}
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await onStatusChange(item.id, "Cancelado");
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                              >
                                <X className="size-4 shrink-0 text-zinc-500" /> Cancelar agendamento
                              </button>
                            </>
                          )}

                          <div className="my-1 h-px bg-zinc-100" />

                          <button
                            type="button"
                            onClick={() => {
                              showToast(`Editar agendamento de ${item.name}`);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                          >
                            <Pencil className="size-4 shrink-0 text-zinc-500" /> Editar
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await onDeleteAppointment(item.id);
                              showToast(
                                `Agendamento de ${item.name} excluído`,
                              );
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="size-4 shrink-0 text-red-500" /> Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {displayedAppointments.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-center text-sm text-zinc-400 min-h-75">
                  {onlyPending ? (
                    <>
                      <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
                        <Check className="size-6" />
                      </div>
                      <p className="font-medium text-zinc-700">Nenhum atendimento aguardando confirmação</p>
                      <p className="text-xs text-zinc-400 mt-1">Todos os agendamentos criados por clientes já foram revisados.</p>
                    </>
                  ) : (
                    <>
                      <div className="flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 mb-3">
                        <CalendarDays className="size-6" />
                      </div>
                      <p className="font-medium text-zinc-700">Nenhum agendamento para hoje</p>
                      <p className="text-xs text-zinc-400 mt-1">Clique em &quot;Novo agendamento&quot; ou veja a agenda completa.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!isFuncionario && (
          <Card className="min-h-105">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Movimento semanal</CardTitle>
              <CardDescription>Agendamentos por dia</CardDescription>
            </div>
            <Badge variant="outline">Esta semana</Badge>
          </CardHeader>
          <CardContent>
            {appointments.length > 0 ? (
              <>
                <div className="flex h-[190px] items-end gap-1.5 border-b border-zinc-200 pt-4 sm:gap-5">
                  {bars.map((height, index) => {
                    const today = new Date();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    const dayDate = new Date(startOfWeek);
                    dayDate.setDate(startOfWeek.getDate() + index);
                    const dateStr = dateToIsoString(dayDate);

                    const dayAppointments = appointments.filter((a) => a.date === dateStr).length;
                    const isToday = index === today.getDay();

                    return (
                      <div key={index} className="group flex h-full flex-1 flex-col items-center justify-end">
                        <div
                          className={cn(
                            "relative w-full rounded-t-md transition-all group-hover:bg-zinc-700",
                            isToday ? "bg-zinc-950" : "bg-zinc-200",
                          )}
                          style={{ height: `${height}%`, minHeight: height > 0 ? "8px" : "0px" }}
                        >
                          {dayAppointments > 0 && (
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-black px-1.5 py-0.5 text-[9px] font-semibold text-white">
                              {dayAppointments}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex justify-between text-[10px] font-medium text-zinc-400">
                  <span>SEG</span>
                  <span>TER</span>
                  <span>QUA</span>
                  <span>QUI</span>
                  <span>SEX</span>
                  <span className={new Date().getDay() === 6 ? "text-zinc-950" : ""}>SÁB</span>
                  <span>DOM</span>
                </div>
                {(() => {
                  const today = new Date();
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - today.getDay());
                  const dayDate = new Date(startOfWeek);
                  dayDate.setDate(startOfWeek.getDate() + today.getDay());
                  const todayDateStr = dateToIsoString(dayDate);

                  const todayCount = appointments.filter((a) => a.date === todayDateStr).length;
                  const weekAvg = appointments.length / 7;
                  const diff = ((todayCount - weekAvg) / Math.max(weekAvg, 1)) * 100;

                  return (
                    <div className="mt-6 flex items-center gap-4 rounded-xl bg-zinc-50 p-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
                        <TrendingUp className="size-4" />
                      </div>
                      <p className="text-xs leading-5 text-zinc-500">
                        <strong className="block text-sm text-zinc-900">
                          {todayCount > 0
                            ? `Hoje com ${Math.abs(Math.round(diff))}% ${diff >= 0 ? "mais" : "menos"} agendamentos`
                            : "Nenhum agendamento hoje"}
                        </strong>
                        {todayCount > 0
                          ? `comparado à média da semana (${Math.round(weekAvg)} por dia).`
                          : "Agenda vazia para hoje."}
                      </p>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="flex h-75 items-center justify-center text-center text-zinc-400">
                <p>Nenhum agendamento na semana</p>
              </div>
            )}
          </CardContent>
          </Card>
        )}
      </div>

      <PendingAppointmentsModal
        isOpen={isPendingModalOpen}
        onClose={handleClosePendingModal}
        onReview={handleReviewPending}
        onConfirm={(item) => onStatusChange(item.id, "Confirmado")}
        pendingAppointments={pendingAppointments}
        serviceList={serviceList}
      />
    </div>
  );
}
