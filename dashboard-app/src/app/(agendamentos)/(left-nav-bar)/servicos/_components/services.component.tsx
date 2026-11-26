"use client";

import { useServices, type ServicesProps } from "../hooks/use-services-panel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input.component";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge.component";
import { ListPagination } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/list-pagination.component";
import { Pencil, Plus, Search, Trash2, MoreVertical, Power, ChevronDown, Sparkles } from "lucide-react";
import { TABLE_BODY_MIN_HEIGHT_CLASS } from "@/lib/pagination";
import { ServiceModal } from "@/app/(agendamentos)/(left-nav-bar)/servicos/_components/service-modal.component";
import { cn } from "@/lib/utils";

export function Services({
  showToast,
  serviceList,
  onAddService,
  onUpdateService,
  onDeleteService,
  canViewMetrics,
}: ServicesProps) {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    modal,
    setModal,
    editingService,
    loading,
    page,
    setPage,
    openMenuId,
    setOpenMenuId,
    filtered,
    paginatedItems,
    handleOpenModal,
    handleSave,
    handleDelete,
    handleToggleStatus,
    totalServices,
    activeServices,
    avgPrice,
    avgDuration,
  } = useServices({ showToast, serviceList, onAddService, onUpdateService, onDeleteService });

  return (
    <div className="mx-auto max-w-375 p-3.5 sm:p-6 lg:p-8">
      {/* 4 Metric Cards at Top */}
      {canViewMetrics !== false && <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="@container/card p-[clamp(0.75rem,4cqw,1.25rem)] flex flex-col justify-between h-full shadow-xs hover:border-zinc-300 transition-all">
          <div className="text-[clamp(0.625rem,2.8cqw,0.75rem)] font-semibold uppercase tracking-wider text-zinc-500 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            Total de Serviços
          </div>
          <div className="mt-[clamp(0.375rem,2cqw,0.75rem)] text-[clamp(1.125rem,6cqw,1.625rem)] font-bold text-zinc-900 leading-none whitespace-nowrap">
            {totalServices}
          </div>
        </Card>
        <Card className="@container/card p-[clamp(0.75rem,4cqw,1.25rem)] flex flex-col justify-between h-full shadow-xs hover:border-zinc-300 transition-all">
          <div className="text-[clamp(0.625rem,2.8cqw,0.75rem)] font-semibold uppercase tracking-wider text-zinc-500 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            Serviços Ativos
          </div>
          <div className="mt-[clamp(0.375rem,2cqw,0.75rem)] text-[clamp(1.125rem,6cqw,1.625rem)] font-bold text-zinc-900 leading-none whitespace-nowrap">
            {activeServices}
          </div>
        </Card>
        <Card className="@container/card p-[clamp(0.75rem,4cqw,1.25rem)] flex flex-col justify-between h-full shadow-xs hover:border-zinc-300 transition-all">
          <div className="text-[clamp(0.625rem,2.8cqw,0.75rem)] font-semibold uppercase tracking-wider text-zinc-500 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            Preço Médio
          </div>
          <div className="mt-[clamp(0.375rem,2cqw,0.75rem)] text-[clamp(1.125rem,6cqw,1.625rem)] font-bold text-zinc-900 leading-none whitespace-nowrap">
            {avgPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        </Card>
        <Card className="@container/card p-[clamp(0.75rem,4cqw,1.25rem)] flex flex-col justify-between h-full shadow-xs hover:border-zinc-300 transition-all">
          <div className="text-[clamp(0.625rem,2.8cqw,0.75rem)] font-semibold uppercase tracking-wider text-zinc-500 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            Duração Média
          </div>
          <div className="mt-[clamp(0.375rem,2cqw,0.75rem)] text-[clamp(1.125rem,6cqw,1.625rem)] font-bold text-zinc-900 leading-none whitespace-nowrap">
            {avgDuration} min
          </div>
        </Card>
      </div>}

      {/* Search and Action Button on the second row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome ou descrição..."
            className="pl-9 w-full"
          />
        </div>
        <Button onClick={() => handleOpenModal()} className="w-full sm:w-48 shrink-0 gap-2 justify-center">
          <Plus className="size-4" /> Novo Serviço
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-zinc-500 mb-4">Nenhum serviço encontrado</p>
            <Button variant="outline" onClick={() => handleOpenModal()}>
              Criar Primeiro Serviço
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="overflow-visible">
            <CardHeader className="border-b border-zinc-100 bg-zinc-50/70 p-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Sparkles className="size-4" /> Catálogo de Serviços
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative shrink-0">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="h-8 max-w-35 truncate appearance-none rounded-lg border border-zinc-200 bg-white pl-2.5 pr-7 text-xs font-medium text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-400"
                    >
                      <option value="Todos">Status: Todos</option>
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
                  </div>
                  <Badge variant="outline" className="h-8 px-2.5 text-xs font-normal">
                    {filtered.length} {filtered.length === 1 ? "serviço" : "serviços"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <div className="hidden h-11 grid-cols-[1.5fr_0.8fr_0.8fr_0.7fr_36px] items-center gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 lg:grid">
              <span>Serviço</span>
              <span>Duração</span>
              <span>Preço</span>
              <span>Status</span>
              <span />
            </div>
            <div className={cn("divide-y divide-zinc-100", TABLE_BODY_MIN_HEIGHT_CLASS)}>
              {paginatedItems.filter(s => !!s.id).map((service, itemIndex, items) => {
                const actionMenuNode = (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        service.id && setOpenMenuId(openMenuId === service.id ? null : service.id)
                      }
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-black transition-colors"
                      disabled={loading}
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {openMenuId === service.id && (
                      <div className={cn("absolute right-0 z-[60] w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl", itemIndex >= items.length - 2 ? "bottom-8" : "top-8")}>
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenModal(service);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                          disabled={loading}
                        >
                          <Pencil className="size-4 shrink-0 text-zinc-500" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(service)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                          disabled={loading}
                        >
                          <Power className="size-4 shrink-0 text-zinc-500" /> Status
                        </button>
                        <div className="my-1 h-px bg-zinc-100" />
                        <button
                          type="button"
                          onClick={() => service.id && handleDelete(service.id, service.name)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          disabled={loading}
                        >
                          <Trash2 className="size-4 shrink-0 text-red-500" /> Excluir
                        </button>
                      </div>
                    )}
                  </div>
                );
                return (
                  <div
                    key={service.id}
                    className="group relative flex flex-col gap-1.5 p-3 sm:p-3.5 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors lg:grid lg:grid-cols-[1.5fr_0.8fr_0.8fr_0.7fr_36px] lg:items-center lg:py-2.5 lg:px-5 lg:border-b-0 lg:gap-4"
                  >
                    {/* Mobile Line 1 (< lg): Color dot + Name on left, Price + Status + Menu on right */}
                    <div className="flex items-center justify-between gap-2 lg:hidden">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {service.color && (
                          <div
                            className="size-3 rounded-full shrink-0"
                            style={{ backgroundColor: service.color }}
                          />
                        )}
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {service.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-950">
                          {service.price ? `R$ ${service.price.toFixed(2)}` : "—"}
                        </span>
                        <Badge
                          variant={service.status === "Ativo" ? "success" : "secondary"}
                          className="text-[11px] px-2 py-0.5"
                        >
                          <span className="mr-1 size-1.5 rounded-full bg-current" />
                          {service.status}
                        </Badge>
                        {actionMenuNode}
                      </div>
                    </div>

                    {/* Mobile Line 2 (< lg): Duration & Description indented */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 min-w-0 overflow-hidden whitespace-nowrap pl-[22px] lg:hidden">
                      <span className="font-medium text-zinc-700 shrink-0">{service.duration} min</span>
                      {service.description && (
                        <>
                          <span className="text-zinc-300 shrink-0">•</span>
                          <span className="text-zinc-500 truncate min-w-0">{service.description}</span>
                        </>
                      )}
                    </div>

                    {/* Desktop Name Column */}
                    <div className="hidden lg:flex min-w-0 items-center gap-3">
                      {service.color && (
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: service.color }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {service.name}
                        </p>
                      </div>
                    </div>

                    {/* Desktop Duration */}
                    <div className="hidden lg:block text-xs font-medium text-zinc-700">
                      {service.duration} min
                    </div>

                    {/* Desktop Price */}
                    <div className="hidden lg:block text-xs font-medium text-zinc-700">
                      {service.price ? `R$ ${service.price.toFixed(2)}` : "—"}
                    </div>

                    {/* Desktop Status */}
                    <div className="hidden lg:block">
                      <Badge
                        variant={service.status === "Ativo" ? "success" : "secondary"}
                      >
                        <span className="mr-1.5 size-1.5 rounded-full bg-current" />
                        {service.status}
                      </Badge>
                    </div>

                    {/* Desktop Actions Menu */}
                    <div className="hidden lg:flex relative justify-end">
                      {actionMenuNode}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <ListPagination
            page={page}
            totalItems={filtered.length}
            onPageChange={setPage}
            pageSize={10}
            label="serviços"
          />
        </>
      )}

      <ServiceModal
        open={modal}
        onOpenChange={setModal}
        onSave={handleSave}
        initialData={editingService}
        loading={loading}
      />
    </div>
  );
}
