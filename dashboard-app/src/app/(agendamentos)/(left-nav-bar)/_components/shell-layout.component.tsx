"use client";

import { useShellLayout } from "../hooks/use-shell-layout";
import { type ReactNode } from "react";
import Link from "next/link";
import {
  Check,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Avatar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/avatar.component";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import { AgendamentosLogo } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/agendamentos-logo.component";
import { cn } from "@/lib/utils";

export function ShellLayout({ children }: { children: ReactNode }) {
  const {
    pathname,
    currentUser,
    mobileOpen,
    setMobileOpen,
    toast,
    handleLogout,
    impersonatingLoading,
    isFuncionario,
    nav,
    onStopImpersonation,
    title,
    subtitle,
    handleOpenSelfEdit,
  } = useShellLayout({ children });

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#f4f4f5] text-zinc-950">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {!currentUser && (
        <aside
          aria-label="Carregando menu principal"
          className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white p-4"
        >
          <div className="flex h-20 items-center border-b border-zinc-100 px-3">
            <AgendamentosLogo variant="light" size="md" />
          </div>
          <div className="mt-6 space-y-3 px-2" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-11 animate-pulse rounded-xl bg-zinc-100" />
            ))}
          </div>
        </aside>
      )}

      {/* Persistent Sidebar */}
      {currentUser && (
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white p-4 transition-transform duration-300 lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="relative flex h-20 items-center justify-between px-3 border-b border-zinc-100">
            <Link href="/dashboard" aria-label="Ir para o início">
              <AgendamentosLogo variant="light" size="md" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X />
            </Button>
          </div>
          <div className="mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Menu principal
          </div>
          <nav className="mt-3 space-y-1">
            {nav.map(({ id, label, icon: Icon, href }) => {
              const isActive =
                pathname === href ||
                (href !== "/dashboard" && (pathname + "/").startsWith(href + "/"));
              return (
                <Link
                  key={id}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                    isActive
                      ? "bg-zinc-950 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                  )}
                >
                  <span className="flex size-[18px] shrink-0 items-center justify-center">
                    <Icon className="size-[18px] stroke-[1.75]" />
                  </span>
                  <span className="text-[14px] font-medium leading-5">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-1 relative">
            {currentUser.impersonating && (
              <div className="mb-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between shadow-sm">
                <span className="font-medium truncate">Modo de visualização</span>
                <button
                  type="button"
                  disabled={impersonatingLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStopImpersonation();
                  }}
                  title="Sair da conta"
                  className="flex items-center gap-1 text-amber-800 hover:text-amber-950 font-semibold p-1 rounded hover:bg-amber-100 transition shrink-0 ml-1"
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            )}
            <div className="my-2 h-px bg-zinc-100" />
            <div
              onClick={handleOpenSelfEdit}
              className={`relative flex items-center gap-3 rounded-xl p-2 bg-zinc-50/80 border border-zinc-100 ${
                !isFuncionario ? "cursor-pointer hover:bg-zinc-100/90 transition" : ""
              }`}
              title={!isFuncionario ? "Editar meu perfil" : undefined}
            >
              <Avatar
                initials={currentUser.initials || "US"}
                className="size-10 bg-zinc-950 text-white ring-0"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900">
                  {currentUser.name}
                </p>
                <p className="truncate text-xs font-medium text-zinc-500">
                  {currentUser.role}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                title="Sair do sistema"
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-950 transition"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="min-w-0 max-w-full lg:pl-[256px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex min-h-[58px] sm:min-h-[66px] items-center gap-3 sm:gap-4 border-b border-zinc-200 bg-white/90 px-3.5 py-2.5 backdrop-blur sm:px-6 lg:px-8">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden shrink-0 size-9"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold tracking-[-0.02em] text-zinc-950 sm:text-xl leading-tight">
              {title}
            </h1>
            <p className="truncate text-xs text-zinc-500 leading-tight mt-0.5">
              {subtitle}
            </p>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-66px)] min-w-0 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Toast Notification */}
      <div
        className={cn(
          "fixed bottom-5 right-5 z-[80] flex items-center gap-3 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white shadow-2xl transition-all duration-300",
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        )}
      >
        <span className="flex size-5 items-center justify-center rounded-full bg-white text-black">
          <Check className="size-3" />
        </span>
        {toast}
      </div>
    </div>
  );
}
