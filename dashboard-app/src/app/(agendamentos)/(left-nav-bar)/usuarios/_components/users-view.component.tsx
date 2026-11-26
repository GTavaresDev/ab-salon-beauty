"use client";

import { useUsersView } from "../hooks/use-users-view";

import { Plus, Search } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input.component";
import { Card } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import {
  ViewLoadingSkeleton,
  LoadingOverlayCard,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/page-skeletons.component";
import { UsersTable } from "./users-table.component";
import { CreateUserDialog } from "./create-user-dialog.component";
import { EditUserDialog } from "./edit-user-dialog.component";

export function UsersView() {
  const {
    userList,
    isLoading,
    handleAddUser,
    handleUpdateUser,
    handleReplaceUser,
    handleDeleteUser,
    currentUser,
    setInitialEditUserId,
    showToast,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    modal,
    setModal,
    setEditingUser,
    page,
    setPage,
    currentUserRole,
    canEditUser,
    canEditProfile,
    canEditPermissions,
    editingUser,
    filtered,
    pagedUsers,
    totalUsers,
    activeUsers,
    adminUsers,
    staffUsers,
  } = useUsersView();

  if (!currentUser) return null;

  const isFuncionario =
    currentUser.permissionLevel === 3 || currentUser.role === "Funcionario";
  if (isFuncionario) return null;

  if (isLoading) {
    return (
      <div className="relative min-h-[calc(100vh-84px)]">
        <ViewLoadingSkeleton view="usuarios" />
        <LoadingOverlayCard label="Carregando dados..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-375 p-3.5 sm:p-6 lg:p-8">
      {/* 4 Metric Cards at Top */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="@container/card p-[clamp(0.75rem,4cqw,1.25rem)] flex flex-col justify-between h-full shadow-xs hover:border-zinc-300 transition-all">
          <div className="text-[clamp(0.625rem,2.8cqw,0.75rem)] font-semibold uppercase tracking-wider text-zinc-500 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            Total da Equipe
          </div>
          <div className="mt-[clamp(0.375rem,2cqw,0.75rem)] text-[clamp(1.125rem,6cqw,1.625rem)] font-bold text-zinc-900 leading-none whitespace-nowrap">
            {totalUsers}
          </div>
        </Card>
        <Card className="@container/card p-[clamp(0.75rem,4cqw,1.25rem)] flex flex-col justify-between h-full shadow-xs hover:border-zinc-300 transition-all">
          <div className="text-[clamp(0.625rem,2.8cqw,0.75rem)] font-semibold uppercase tracking-wider text-zinc-500 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            Usuários Ativos
          </div>
          <div className="mt-[clamp(0.375rem,2cqw,0.75rem)] text-[clamp(1.125rem,6cqw,1.625rem)] font-bold text-zinc-900 leading-none whitespace-nowrap">
            {activeUsers}
          </div>
        </Card>
        <Card className="@container/card p-[clamp(0.75rem,4cqw,1.25rem)] flex flex-col justify-between h-full shadow-xs hover:border-zinc-300 transition-all">
          <div className="text-[clamp(0.625rem,2.8cqw,0.75rem)] font-semibold uppercase tracking-wider text-zinc-500 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            Administradores
          </div>
          <div className="mt-[clamp(0.375rem,2cqw,0.75rem)] text-[clamp(1.125rem,6cqw,1.625rem)] font-bold text-zinc-900 leading-none whitespace-nowrap">
            {adminUsers}
          </div>
        </Card>
        <Card className="@container/card p-[clamp(0.75rem,4cqw,1.25rem)] flex flex-col justify-between h-full shadow-xs hover:border-zinc-300 transition-all">
          <div className="text-[clamp(0.625rem,2.8cqw,0.75rem)] font-semibold uppercase tracking-wider text-zinc-500 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            Gestores & Equipe
          </div>
          <div className="mt-[clamp(0.375rem,2cqw,0.75rem)] text-[clamp(1.125rem,6cqw,1.625rem)] font-bold text-zinc-900 leading-none whitespace-nowrap">
            {staffUsers}
          </div>
        </Card>
      </div>

      {/* Search and Action Button on the same row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nome ou e-mail..."
            className="pl-9 w-full"
          />
        </div>
        <Button onClick={() => setModal(true)} className="w-full sm:w-48 shrink-0 gap-2 justify-center">
          <Plus className="size-4" /> Adicionar usuário
        </Button>
      </div>

      <UsersTable
        pagedUsers={filtered}
        filteredCount={filtered.length}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => { setStatusFilter(value); setPage(1); }}
        roleFilter={roleFilter}
        onRoleFilterChange={(value) => { setRoleFilter(value); setPage(1); }}
        page={page}
        onPageChange={setPage}
        currentUserRole={currentUser.role}
        canEditUser={canEditUser}
        onEditUser={(user) => setEditingUser(user)}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        showToast={showToast}
      />

      {modal && (
        <CreateUserDialog
          userList={userList}
          currentUserRole={currentUser.role}
          onAddUser={handleAddUser}
          onClose={() => setModal(false)}
          showToast={showToast}
        />
      )}
      {editingUser && (
        <EditUserDialog
          key={editingUser.id}
          user={editingUser}
          currentUserRole={currentUser.role}
          canEditUser={canEditUser(editingUser)}
          canEditProfile={canEditProfile(editingUser)}
          canEditPermissions={canEditPermissions(editingUser)}
          onUserUpdated={(updated) => {
            handleReplaceUser(updated);
          }}
          onClose={() => {
            setEditingUser(null);
            setInitialEditUserId(null);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
