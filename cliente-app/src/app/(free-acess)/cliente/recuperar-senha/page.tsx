import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../../_components/auth-shell.component";
import { PasswordResetForm } from "../../_components/password-reset-form.component";

export const metadata: Metadata = {
  title: "Recuperar senha",
};

export default function ClientPasswordResetPage() {
  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Preencha seu nome e e-mail para preparar o pedido pelo WhatsApp."
      footer={
        <p>
          Lembrou a senha?{" "}
          <Link href="/cliente" className="font-semibold text-[#3D0F22] hover:underline">
            Entrar
          </Link>
        </p>
      }
    >
      <PasswordResetForm />
    </AuthShell>
  );
}
