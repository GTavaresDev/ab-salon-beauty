"use client";

import { useResetPasswordForm } from "../hooks/use-reset-password-form";
import Link from "next/link";
import { Button } from "@/components/portal-ui/button.component";
import { FieldLabel } from "@/components/portal-ui/field-label.component";
import { Input } from "@/components/portal-ui/input.component";

export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const {
    password,
    setPassword,
    passwordConfirmation,
    setPasswordConfirmation,
    error,
    done,
    loading,
    submit,
  } = useResetPasswordForm({ token, email });

  if (done) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center">
        <p className="text-sm font-medium text-zinc-950">Senha redefinida</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Sua senha foi alterada. Você já pode entrar com a nova senha.
        </p>
        <Link href="/cliente" className="mt-4 inline-block text-sm font-semibold text-zinc-950 hover:underline">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <FieldLabel>E-mail</FieldLabel>
        <Input type="email" value={email} disabled readOnly />
      </div>

      <div>
        <FieldLabel>Nova senha</FieldLabel>
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo de 8 caracteres"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <div>
        <FieldLabel>Confirmar senha</FieldLabel>
        <Input
          type="password"
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          placeholder="Repita a senha"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Button className="w-full" size="lg" type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Redefinir senha"}
      </Button>
    </form>
  );
}
