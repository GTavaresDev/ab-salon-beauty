import { type ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/portal-ui/avatar.component";
import { AgendamentosLogo } from "@/components/portal-ui/agendamentos-logo.component";
import { getClientSession, type ClientSession } from "@/lib/client-session";
import { getClientProfileStatusAction } from "@core/application/query/controller/login/login-profile.controller";
import { LogoutButton } from "./logout-button.component";
import { PortalNav } from "./portal-nav.component";
import { firstName } from "./portal-format/portal-format";
import { ForcedSessionLogout } from "./forced-session-logout.component";
import { AppointmentReviewModal } from "./appointment-review-modal.component";
import { getPendingReviewsAction } from "@core/application/query/controller/read-appointment.controller";

/**
 * Guarda das páginas do portal. O middleware já redireciona, mas cada página
 * confere a sessão de novo — a autorização não depende da camada de rota.
 */
export async function requirePortalSession(): Promise<ClientSession> {
  const session = await getClientSession();
  if (!session) {
    redirect("/cliente");
  }
  return session;
}

/**
 * Guarda das telas internas do painel. Além da sessão, exige cadastro
 * completo: sem telefone e data de nascimento, tudo volta para `/cliente/painel`,
 * que mostra o formulário de conclusão no lugar do conteúdo.
 *
 * Isto é conveniência de navegação — a barreira que vale é a das use cases
 * (o controller de agendamento recusa cadastro incompleto).
 */
export async function requireCompletePortalSession(): Promise<ClientSession> {
  const session = await requirePortalSession();
  const { complete } = await getClientProfileStatusAction();
  if (!complete) {
    redirect("/cliente/painel");
  }
  return session;
}

/**
 * Casca do portal do cliente: cabeçalho próprio, sem a sidebar do sistema
 * interno. Mobile-first — a navegação vira barra inferior no celular.
 */
export async function PortalShell({
  session,
  title,
  subtitle,
  locked = false,
  children,
}: {
  session: ClientSession;
  title?: string;
  subtitle?: string;
  /** Cadastro incompleto: esconde a navegação, já que tudo redireciona de volta. */
  locked?: boolean;
  children: ReactNode;
}) {
  const pendingReviews = locked ? [] : await getPendingReviewsAction();
  const headerTitle = title ?? `Olá, ${firstName(session.name)}!`;
  const headerSubtitle =
    subtitle ?? "Gerencie seus agendamentos e acompanhe seus próximos horários.";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      {!locked ? <AppointmentReviewModal reviews={pendingReviews} clientName={session.name} /> : null}
      <ForcedSessionLogout expiresAt={session.expiresAt} />
      {/* Sidebar Persistente no Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-zinc-200 bg-white p-4 lg:flex">
        <div className="flex h-20 items-center px-3 border-b border-zinc-100">
          <Link href="/cliente/painel" aria-label="Ir para o início">
            <AgendamentosLogo variant="light" size="md" />
          </Link>
        </div>

        {locked ? null : (
          <>
            <div className="mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
              Menu principal
            </div>

            <PortalNav variant="sidebar" className="mt-3 space-y-1" />
          </>
        )}

        <div className="mt-auto space-y-1">
          {/* Só aparece quando a equipe está vendo o portal como este cliente. */}
          <div className="my-2 h-px bg-zinc-100" />
          <div className="relative flex items-center gap-3 rounded-xl p-2.5 bg-zinc-50/80 border border-zinc-100">
            <Avatar
              initials={session.initials || "CL"}
              className="size-10 bg-zinc-950 text-white shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">
                {session.name}
              </p>
              <p className="truncate text-xs font-medium text-zinc-500">
                Cliente
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Header Mobile */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur shadow-xs lg:hidden">
        <div className="mx-auto flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/cliente/painel" aria-label="Ir para o início" className="shrink-0">
            <AgendamentosLogo variant="light" size="sm" />
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-zinc-800">
              {firstName(session.name)}
            </span>
            <Avatar initials={session.initials || "CL"} className="size-8" />
            <LogoutButton />
          </div>
        </div>

        {/* Sem sidebar no celular: a faixa acompanha o cabeçalho. */}
      </header>

      {/* Conteúdo Principal */}
      <div className="lg:pl-[256px]">
        {/* Header Superior da Página */}
        <header className="sticky top-0 z-20 flex min-h-[58px] sm:min-h-[66px] items-center border-b border-zinc-200 bg-white/90 px-4 py-2.5 backdrop-blur sm:px-6 lg:px-8">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold tracking-[-0.02em] text-zinc-950 sm:text-xl leading-tight">
              {headerTitle}
            </h1>
            <p className="truncate text-xs text-zinc-500 leading-tight mt-0.5">
              {headerSubtitle}
            </p>
          </div>
        </header>

        <main className="w-full px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Barra Inferior Mobile */}
      {locked ? null : (
        <PortalNav
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-zinc-200 bg-white px-2 py-2 lg:hidden"
          variant="bar"
        />
      )}
    </div>
  );
}
