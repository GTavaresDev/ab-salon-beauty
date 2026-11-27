import { getClientSession } from "@/lib/client-session";
import { redirect } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { LoginBrandPanel } from "../_components/login-brand-panel.component";
import { GoogleSignIn } from "../_components/google-sign-in.component";
import { LoginForm } from "../_components/login-form.component";
import { portalOAuthErrorMessage } from "../_components/portal-oauth-error/portal-oauth-error";
import { PortalPendingNotice } from "../_components/portal-pending-notice.component";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function ClientLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  if (await getClientSession()) redirect("/cliente/painel");
  const { erro } = await searchParams;
  const oauthError = erro ? portalOAuthErrorMessage(erro) : null;

  return (
    <main className="grid min-h-screen bg-[#FAFAFA] text-[#5C1A33] lg:grid-cols-[1.02fr_.98fr]">
      <LoginBrandPanel />

      <section aria-labelledby="client-login-title" className="flex items-center justify-center px-6 py-8 sm:px-10 lg:py-12">
        <div className="w-full max-w-[430px]">
          <div className="mb-7 flex flex-col items-center gap-2">
            <Image
              src="/images/brand/logo-horizontal-transparente.png"
              alt="AB Salon Beauty"
              width={935}
              height={240}
              className="h-14 w-auto max-w-full object-contain"
              preload
            />
            <p className="text-center text-[11px] font-medium tracking-[0.25em] text-[#9B4A68]">
              GESTÃO &amp; AGENDA
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-[#9B4A68]">Bem-vindo de volta</p>
            <h1 id="client-login-title" className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-[#3D0F22]">
              Acesse sua conta
            </h1>
            <p className="mt-2 text-sm text-[#7A3350]">
              Entre para agendar e acompanhar seus atendimentos.
            </p>
          </div>

          {erro === "acesso" ? (
            <div className="mb-5"><PortalPendingNotice /></div>
          ) : oauthError ? (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {oauthError}
            </p>
          ) : null}

          <LoginForm />
          <GoogleSignIn />

          <footer className="mt-7 text-center text-xs text-[#7A3350]">
            &copy; 2026 Agendamentos. Todos os direitos reservados.
          </footer>
        </div>
      </section>
    </main>
  );
}
