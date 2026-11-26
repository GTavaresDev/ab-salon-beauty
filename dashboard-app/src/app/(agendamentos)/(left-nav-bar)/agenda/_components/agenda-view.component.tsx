"use client";

import { useAgendaView } from "../hooks/use-agenda-view";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  MoreVertical,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Avatar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/avatar.component";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge.component";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import { Calendar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/calendar.component";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input.component";
import { ServiceBadge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/service-color-indicator.component";
import { ListPagination } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/list-pagination.component";
import { cn } from "@/lib/utils";
import { resolveServiceColor } from "@/lib/service-color";
import { getStatusBadgeVariant } from "@/lib/appointment-status";
import { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { appointmentAttendantLabel } from "@/lib/appointment-attendant";
import { PendingAppointmentsModal } from "@/app/(agendamentos)/(left-nav-bar)/dashboard/_components/pending-appointments-modal.component";

export function AgendaView({
  appointments,
  onStatusChange,
  onDeleteAppointment,
  onNew,
  showToast,
  currentUserRole = "Administrador",
  currentUserName = "",
  currentUserId = "",
  userList = [],
}: {
  appointments: AppointmentProps[];
  onStatusChange: (id: string, status: "Confirmado" | "Cancelado" | "Concluído" | "Pendente") => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
  onNew: () => void;
  showToast: (message: string) => void;
  currentUserRole?: "Dono" | "Administrador" | "Gestor" | "Funcionario";
  currentUserName?: string;
  currentUserId?: string;
  userList?: { id?: string; name: string; role?: string }[];
}) {
  const {
    serviceList,
    selectedDate,
    setSelectedDate,
    calendarMonth,
    setCalendarMonth,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    agendaScope,
    setAgendaScope,
    openMenuId,
    setOpenMenuId,
    page,
    setPage,
    onlyPending,
    setOnlyPending,
    isPendingModalOpen,
    todayIso,
    selectedIso,
    pendingAppointments,
    handleClosePendingModal,
    handleReviewPending,
    markedDates,
    dateAppointmentsCount,
    filteredAppointments,
    pagedAppointments,
    channelMap,
  } = useAgendaView({ appointments, onStatusChange, onDeleteAppointment, onNew, showToast, currentUserRole, currentUserName, currentUserId, userList });

  return (
    <div className="mx-auto max-w-375 p-3 sm:p-5 lg:p-6">
      {/* Search and Action Button on top row */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por cliente, atendente ou serviço..."
            className="pl-9 w-full"
          />
        </div>
        <Button onClick={onNew} className="w-full sm:w-48 shrink-0 gap-2 justify-center">
          <Plus className="size-4" /> Novo agendamento
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        {/* Main Agenda Table Card */}
        <Card className="order-2 overflow-hidden xl:order-1">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/70 p-4 sm:px-6">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="flex shrink-0 items-start gap-2 text-base">
              <CalendarDays className="mt-0.5 size-4 shrink-0" />
              <span>{onlyPending ? "Atendimentos a confirmar" : "Horários e Atendimentos"}</span>
            </CardTitle>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-1.5 lg:justify-end">
              {/* Toggle similar to Dashboard */}
              <div className="inline-flex h-8 items-center rounded-lg border border-zinc-200 bg-zinc-100/80 p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setOnlyPending(false);
                    setPage(1);
                  }}
                  className={cn(
                    "h-full rounded-md px-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center justify-center",
                    !onlyPending
                      ? "bg-white text-zinc-900 shadow-xs font-semibold"
                      : "text-zinc-600 hover:text-zinc-900",
                  )}
                >
                  {selectedIso === todayIso
                    ? `Hoje (${dateAppointmentsCount})`
                    : `${selectedIso.slice(8, 10)}/${selectedIso.slice(5, 7)} (${dateAppointmentsCount})`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOnlyPending(true);
                    setPage(1);
                  }}
                  className={cn(
                    "h-full flex items-center justify-center gap-1 rounded-md px-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0",
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

              {currentUserRole !== "Funcionario" && (
                <div className="relative shrink-0">
                  <select
                    value={agendaScope}
                    onChange={(e) => {
                      setAgendaScope(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 max-w-32 truncate appearance-none rounded-lg border border-zinc-200 bg-white pl-2 pr-6 text-xs font-medium text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-400"
                  >
                    <option value="Geral">Todas</option>
                    {userList
                      .filter((u) => currentUserRole === "Administrador" || u.role !== "Administrador")
                      .map((u) => (
                        <option key={u.id || u.name} value={u.name}>
                          {u.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
                </div>
              )}

              {!onlyPending && (
                <div className="relative shrink-0">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 max-w-32 truncate appearance-none rounded-lg border border-zinc-200 bg-white pl-2 pr-6 text-xs font-medium text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-400"
                  >
                    <option value="Todos">Status: Todos</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
                </div>
              )}

            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Header Row for desktop */}
          <div className="hidden grid-cols-[80px_1.6fr_1.1fr_1.8fr_0.8fr_1.2fr_40px] items-center gap-3 border-b border-zinc-200 bg-zinc-100/60 px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 lg:grid">
            <span>Horário</span>
            <span>Cliente</span>
            <span>Atendente</span>
            <span>Serviço & Duração</span>
            <span>Canal</span>
            <span>Status</span>
            <span />
          </div>

          <div className="max-h-105 overflow-y-auto divide-y divide-zinc-100 min-h-65">
            {pagedAppointments.map((item) => {
              const attendantLabel = appointmentAttendantLabel(item);
              const channelLabel = channelMap.get(item.channelId) || "Sistema";
              const serviceColor = resolveServiceColor(serviceList, item);
              const isPending = item.status === "Pendente";
              const isTodayItem = item.date === todayIso;

              const isMine =
                item.userId === currentUserId ||
                (!item.userId && item.userName === currentUserName);
              const isTargetAdmin = item.userRole === "Administrador";
              const isTargetGestor = item.userRole === "Gestor";

              const canEdit =
                currentUserRole === "Administrador" ||
                (currentUserRole === "Gestor" &&
                  (isMine || (!isTargetAdmin && !isTargetGestor))) ||
                (currentUserRole === "Funcionario" && isMine);

              const actionMenuNode = canEdit ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId(openMenuId === item.id ? null : item.id)
                    }
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-black transition-colors"
                  >
                    <MoreVertical className="size-4" />
                  </button>
                  {openMenuId === item.id && (
                    <div className="absolute right-0 top-8 z-50 w-44 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={async () => {
                              await onStatusChange(item.id, "Confirmado");
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <Check className="size-4 shrink-0 text-emerald-600" /> Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await onStatusChange(item.id, "Cancelado");
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors"
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
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
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
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                          >
                            <X className="size-4 shrink-0 text-zinc-500" /> Cancelar agendamento
                          </button>
                        </>
                      )}

                      <div className="my-1 h-px bg-zinc-100" />

                      <button
                        type="button"
                        onClick={() => {
                          showToast(`Edição do agendamento de ${item.name}`);
                          setOpenMenuId(null);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                      >
                        <Pencil className="size-4 shrink-0 text-zinc-500" /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await onDeleteAppointment(item.id);
                          showToast(
                            `Agendamento de ${item.name} excluído do banco`,
                          );
                          setOpenMenuId(null);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="size-4 shrink-0 text-red-500" /> Excluir
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <span className="text-[11px] font-medium text-zinc-400">
                  Somente leitura
                </span>
              );

              return (
                <div
                  key={item.id || item.time}
                  className={cn(
                    "group relative flex flex-col gap-1.5 p-3 sm:p-3.5 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors lg:grid lg:grid-cols-[80px_1.6fr_1.1fr_1.8fr_0.8fr_1.2fr_40px] lg:items-center lg:py-2.5 lg:px-6 lg:border-b-0 lg:gap-3",
                    isPending && "bg-amber-50/20 hover:bg-amber-50/40",
                  )}
                >
                  {/* Line 1 for Mobile (< lg): Avatar + Name on left, Time + Status + Menu on right */}
                  <div className="flex items-center justify-between gap-2 lg:hidden">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        initials={item.initials}
                        className="size-8 bg-zinc-900 text-white shrink-0 text-xs font-semibold"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {item.name}
                        </p>
                        {onlyPending && (
                          <span className="text-[10px] font-semibold text-amber-700 block">
                            {isTodayItem ? "Hoje" : `${item.date.slice(8, 10)}/${item.date.slice(5, 7)}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-950">
                        <Clock3 className="size-3 text-zinc-500" />
                        {item.time}
                      </span>
                      <Badge
                        variant={getStatusBadgeVariant(item.status)}
                        className={cn(
                          "text-[11px] px-2 py-0.5",
                          isPending && "border-amber-300 bg-amber-100 text-amber-800 font-semibold",
                        )}
                      >
                        {isPending ? "Aguardando" : item.status}
                      </Badge>
                      <div className="relative">{actionMenuNode}</div>
                    </div>
                  </div>

                  {/* Line 2 for Mobile (< lg): Service, Duration, Attendant indented under name */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 min-w-0 overflow-hidden whitespace-nowrap pl-[42px] lg:hidden">
                    {item.service && <ServiceBadge color={serviceColor} name={item.service} className="shrink-0" />}
                    <span className="text-zinc-300 shrink-0">•</span>
                    <span className="shrink-0">{item.duration}</span>
                    <span className="text-zinc-300 shrink-0">•</span>
                    <span className="text-zinc-600 font-medium truncate min-w-0">{attendantLabel}</span>
                  </div>

                  {/* Desktop Time (lg:flex) */}
                  <div className="hidden lg:flex flex-col font-semibold text-zinc-950">
                    <span className="text-sm">{item.time}</span>
                    {(!isTodayItem || onlyPending) && (
                      <span className="text-[10px] font-semibold text-amber-700 leading-tight">
                        {isTodayItem ? "Hoje" : `${item.date.slice(8, 10)}/${item.date.slice(5, 7)}`}
                      </span>
                    )}
                  </div>

                  {/* Desktop Client Info */}
                  <div className="hidden lg:flex items-center gap-2.5 min-w-0">
                    <Avatar
                      initials={item.initials}
                      className="size-8 bg-zinc-900 text-white shrink-0 text-xs font-semibold"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {item.name}
                      </p>
                    </div>
                  </div>

                  {/* Desktop Column 3: Attendant */}
                  <div className="hidden lg:block min-w-0 text-xs font-medium text-zinc-700">
                    <p className="truncate">{attendantLabel}</p>
                  </div>

                  {/* Desktop Column 4: Service & Duration */}
                  <div className="hidden lg:flex min-w-0 items-center gap-1.5 text-xs text-zinc-500 whitespace-nowrap">
                    {item.service && <ServiceBadge color={serviceColor} name={item.service} />}
                    <span aria-hidden className="text-zinc-400">•</span>
                    <span>{item.duration}</span>
                  </div>

                  {/* Desktop Column 5: Channel */}
                  <div className="hidden lg:block text-xs font-medium text-zinc-500">
                    {channelLabel}
                  </div>

                  {/* Desktop Column 6: Status */}
                  <div className="hidden lg:flex items-center gap-2 min-w-0">
                    <Badge
                      variant={getStatusBadgeVariant(item.status)}
                      className={cn(
                        "truncate",
                        isPending && "border-amber-300 bg-amber-100 text-amber-800 font-semibold",
                      )}
                    >
                      {isPending ? "Aguardando confirmação" : item.status}
                    </Badge>
                  </div>

                  {/* Desktop Column 7: Actions */}
                  <div className="hidden lg:flex relative justify-end">
                    {actionMenuNode}
                  </div>
                </div>
              );
            })}

            {filteredAppointments.length === 0 && (
              <div className="p-8 text-center text-sm text-zinc-400">
                {onlyPending ? (
                  <>
                    <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3 mx-auto">
                      <Check className="size-6" />
                    </div>
                    <p className="font-medium text-zinc-700">Nenhum atendimento aguardando confirmação</p>
                    <p className="text-xs text-zinc-400 mt-1">Todos os agendamentos já foram revisados.</p>
                  </>
                ) : (
                  "Nenhum agendamento encontrado para os filtros selecionados."
                )}
              </div>
            )}
          </div>

          {filteredAppointments.length > 0 && (
            <ListPagination
              page={page}
              totalItems={filteredAppointments.length}
              onPageChange={setPage}
              label="agendamentos"
              pageSize={10}
            />
          )}
        </CardContent>
        </Card>

        {/* Calendar */}
        <Card className="order-1 xl:order-2">
          <CardContent className="p-3 sm:p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (!date) return;
                setSelectedDate(date);
                setOnlyPending(false);
                setPage(1);
              }}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              markedDates={markedDates}
            />
            <div className="mt-2 flex justify-center">
              <Badge variant="outline" className="h-7 px-2.5 text-xs font-normal whitespace-nowrap">
                {filteredAppointments.length} {filteredAppointments.length === 1 ? "compromisso" : "compromissos"}
              </Badge>
            </div>
          </CardContent>
        </Card>
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
