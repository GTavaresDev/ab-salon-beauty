import { getClientSession } from "@/lib/client-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "../_components/auth-shell.component";
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
    <AuthShell
      title="Acesse sua conta"
      subtitle="Entre para agendar e acompanhar seus atendimentos."
      footer={
        <Link href="/cliente/recuperar-senha" className="font-semibold text-zinc-950 hover:underline">
          Recuperar senha
        </Link>
      }
    >
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
    </AuthShell>
  );
}
