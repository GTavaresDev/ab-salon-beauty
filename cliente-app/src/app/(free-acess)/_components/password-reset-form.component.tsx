"use client";

import { usePasswordResetForm } from "../hooks/use-password-reset-form";
import { Button } from "@/components/portal-ui/button.component";
import { FieldLabel } from "@/components/portal-ui/field-label.component";
import { Input } from "@/components/portal-ui/input.component";

export function PasswordResetForm() {
  const {
    email,
    setEmail,
    error,
    sent,
    loading,
    submit,
  } = usePasswordResetForm();

  if (sent) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <p className="text-sm font-medium text-zinc-950">Solicitação registrada</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Se este e-mail estiver cadastrado, você receberá as instruções para redefinir
          a senha. Se precisar de ajuda, entre em contato com a clínica.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <FieldLabel>E-mail cadastrado</FieldLabel>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="seuemail@exemplo.com"
          autoComplete="email"
          inputMode="email"
          required
        />
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Button className="w-full" size="lg" type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar instruções"}
      </Button>
    </form>
  );
}
