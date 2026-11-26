"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, MoreVertical, Pencil, Search, Trash2, UsersRound, X } from "lucide-react";
import type { ServiceProps } from "@core/application/query/interface/service.entity";
import type { StaffServicesEmployee } from "@core/shared/staff-services-users";
import { replaceUserServicesAction } from "@core/application/query/controller/users/user-services.controller";
import { useAppShellStore } from "@/stores/app-shell.store";
import { Avatar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/avatar.component";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge.component";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import { Card, CardHeader, CardTitle } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input.component";
import { ListPagination } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/list-pagination.component";
import { paginateItems } from "@/lib/pagination";
import { cn } from "@/lib/utils";

export function StaffServicesView({ users, services }: { users: StaffServicesEmployee[]; services: ServiceProps[] }) {
  const [assignments, setAssignments] = useState<Record<string, string[]>>(
    Object.fromEntries(users.map((user) => [user.id, user.serviceIds])),
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [editingUser, setEditingUser] = useState<StaffServicesEmployee | null>(null);
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const showToast = useAppShellStore((state) => state.showToast);

  useEffect(() => {
    if (!openMenuId) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !menuTriggerRef.current?.contains(target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [openMenuId]);

  const filtered = users.filter((user) =>
    (user.name + " " + user.email).toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")),
  );
  const paged = paginateItems(filtered, page);
  const menuUser = paged.find((user) => user.id === openMenuId);

  function openMenu(userId: string, button: HTMLButtonElement) {
    if (openMenuId === userId) {
      setOpenMenuId(null);
      return;
    }
    const rect = button.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 8 + 104 > window.innerHeight ? rect.top - 104 : rect.bottom + 8,
      left: Math.min(window.innerWidth - 216, Math.max(8, rect.right - 208)),
    });
    setOpenMenuId(userId);
  }

  function openEditor(user: StaffServicesEmployee) {
    setDraftIds(assignments[user.id] ?? []);
    setEditingUser(user);
    setOpenMenuId(null);
  }

  async function saveAssignments(user: StaffServicesEmployee, serviceIds: string[]) {
    if (saving) return;
    setSaving(true);
    try {
      const result = await replaceUserServicesAction({ userId: user.id, serviceIds });
      if (!result.success || !result.data) throw new Error(result.error || "Erro ao salvar vínculos.");
      setAssignments((current) => ({ ...current, [user.id]: result.data! }));
      setEditingUser(null);
      setOpenMenuId(null);
      showToast("Serviços do funcionário atualizados.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erro ao salvar vínculos.");
    } finally {
      setSaving(false);
    }
  }

  function toggleService(user: StaffServicesEmployee, serviceId: string) {
    const ids = assignments[user.id] ?? [];
    void saveAssignments(user, ids.includes(serviceId) ? ids.filter((id) => id !== serviceId) : [...ids, serviceId]);
  }

  return (
    <div className="mx-auto max-w-375 p-3.5 sm:p-6 lg:p-8">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={search}
          onChange={(event) => { setSearch(event.target.value); setPage(1); setOpenMenuId(null); }}
          placeholder="Buscar funcionário por nome ou e-mail..."
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/70 p-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <UsersRound className="size-4" /> Serviços por funcionário
            </CardTitle>
            <Badge variant="outline" className="h-8 shrink-0 px-2.5 text-xs font-normal">
              {filtered.length} {filtered.length === 1 ? "funcionário" : "funcionários"}
            </Badge>
          </div>
        </CardHeader>

        <div className="overflow-x-auto" onScroll={() => setOpenMenuId(null)}>
          <table className="w-full table-fixed border-separate border-spacing-0 text-sm" style={{ minWidth: 256 + services.length * 82 + 64 }}>
            <colgroup>
              <col style={{ width: 256 }} />
              {services.map((service) => <col key={service.id} style={{ width: 82 }} />)}
              <col />
              <col style={{ width: 64 }} />
            </colgroup>
            <thead>
              <tr className="bg-zinc-50/80 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <th scope="col" className="sticky left-0 z-20 min-w-64 border-b border-zinc-200 bg-zinc-50 px-5 py-3">Funcionário</th>
                {services.map((service) => (
                  <th key={service.id} scope="col" title={service.name} className="border-b border-zinc-200 px-1 py-3 text-center normal-case tracking-normal">
                    <span className="line-clamp-2">{service.name}</span>
                  </th>
                ))}
                <th aria-hidden="true" className="border-b border-zinc-200" />
                <th scope="col" className="sticky right-0 z-20 w-16 border-b border-zinc-200 bg-zinc-50 px-1 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((user) => {
                const assignedIds = assignments[user.id] ?? [];
                const linkedCount = services.filter((service) => assignedIds.includes(service.id!)).length;
                return (
                  <tr key={user.id} className="group hover:bg-zinc-50/60">
                    <th scope="row" className="sticky left-0 z-10 min-w-64 border-b border-zinc-100 bg-white px-5 py-3 text-left group-hover:bg-zinc-50">
                      <div className="flex items-center gap-3">
                        <Avatar initials={user.initials} className="size-9 shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-900">{user.name}</p>
                          <p className="truncate text-[11px] font-normal text-zinc-500">{user.email}</p>
                          <p className="text-[11px] font-normal text-zinc-400">{linkedCount} de {services.length} vinculados</p>
                        </div>
                      </div>
                    </th>
                    {services.map((service) => {
                      const linked = assignedIds.includes(service.id!);
                      return (
                        <td key={service.id} className="border-b border-zinc-100 px-1 py-3 text-center">
                          <button
                            type="button"
                            disabled={saving}
                            aria-label={(linked ? "Desvincular " + service.name + " de " : "Vincular " + service.name + " a ") + user.name + " (" + user.email + ")"}
                            aria-pressed={linked}
                            title={linked ? "Vinculado — clique para desativar" : "Não vinculado — clique para ativar"}
                            onClick={() => toggleService(user, service.id!)}
                            className={cn(
                              "mx-auto flex size-9 items-center justify-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-wait disabled:opacity-50",
                              linked
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "border-zinc-200 bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600",
                            )}
                          >
                            {linked ? <Check className="size-5" strokeWidth={2.5} aria-hidden="true" /> : <X className="size-4" strokeWidth={2.5} aria-hidden="true" />}
                          </button>
                        </td>
                      );
                    })}
                    <td aria-hidden="true" className="border-b border-zinc-100" />
                    <td className="sticky right-0 z-10 w-16 border-b border-zinc-100 bg-white px-1 py-3 text-center group-hover:bg-zinc-50">
                      <button
                        ref={openMenuId === user.id ? menuTriggerRef : undefined}
                        type="button"
                        aria-label={"Ações de " + user.name + " (" + user.email + ")"}
                        aria-expanded={openMenuId === user.id}
                        onClick={(event) => openMenu(user.id, event.currentTarget)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={services.length + 3} className="px-5 py-12 text-center text-sm text-zinc-500">
                    Nenhum funcionário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {services.length === 0 ? (
          <p className="border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500">Nenhum serviço cadastrado.</p>
        ) : (
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5"><Check className="size-4 text-emerald-700" /> Vinculado</span>
            <span className="inline-flex items-center gap-1.5"><X className="size-3.5 text-zinc-400" /> Não vinculado</span>
            <span>Clique no ícone para alterar.</span>
          </div>
        )}
      </Card>
      <ListPagination page={page} totalItems={filtered.length} onPageChange={(value) => { setPage(value); setOpenMenuId(null); }} label="funcionários" />

      {menuUser && createPortal(
        <div ref={menuRef} style={{ top: menuPosition.top, left: menuPosition.left }}
          className="fixed z-[80] w-52 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
          <button type="button" onClick={() => openEditor(menuUser)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100">
            <Pencil className="size-4 text-zinc-500" /> Editar serviços
          </button>
          {(assignments[menuUser.id]?.length ?? 0) > 0 && (
            <button type="button" disabled={saving}
              onClick={() => {
                if (window.confirm("Remover todos os serviços de " + menuUser.name + " (" + menuUser.email + ")?")) {
                  void saveAssignments(menuUser, []);
                } else {
                  setOpenMenuId(null);
                }
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
              <Trash2 className="size-4 text-red-500" /> Remover vínculos
            </button>
          )}
        </div>,
        document.body,
      )}

      {editingUser && (
        <div role="dialog" aria-modal="true" aria-labelledby="staff-services-title"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm lg:left-64"
          onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setEditingUser(null); }}>
          <Card className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden shadow-2xl">
            <CardHeader className="flex-row items-start justify-between gap-3 border-b border-zinc-100">
              <div>
                <CardTitle id="staff-services-title">Editar serviços</CardTitle>
                <p className="mt-1 text-sm text-zinc-500">{editingUser.name}</p>
                <p className="text-xs text-zinc-400">{editingUser.email}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" className="-mr-2 -mt-2"
                disabled={saving} onClick={() => setEditingUser(null)} aria-label="Fechar">
                <X className="size-4" />
              </Button>
            </CardHeader>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <p className="mb-3 text-xs text-zinc-500">Selecione os serviços realizados pelo funcionário.</p>
              <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200">
                {services.length === 0 && <p className="p-4 text-sm text-zinc-500">Nenhum serviço cadastrado.</p>}
                {services.map((service) => (
                  <label key={service.id} className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50">
                    <span>{service.name}</span>
                    <input type="checkbox" checked={draftIds.includes(service.id!)} disabled={saving}
                      onChange={(event) => setDraftIds((current) =>
                        event.target.checked ? [...current, service.id!] : current.filter((id) => id !== service.id))}
                      className="size-4 accent-emerald-600" />
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-100 p-4">
              <Button type="button" variant="outline" disabled={saving} onClick={() => setEditingUser(null)}>Cancelar</Button>
              <Button type="button" disabled={saving} onClick={() => void saveAssignments(editingUser, draftIds)}>
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
