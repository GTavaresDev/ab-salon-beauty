"use client";

import { useCompleteProfileForm } from "../hooks/use-complete-profile-form";
import { ArrowRight, Lock } from "lucide-react";
import type { ClientProfileStatusDTO } from "@core/application/use-cases/login/complete-client-profile.usecase";
import { Button } from "@/components/portal-ui/button.component";
import { FieldLabel } from "@/components/portal-ui/field-label.component";
import { Input } from "@/components/portal-ui/input.component";
import { formatPhoneBR } from "@/lib/input-masks";

/**
 * Bloqueio de cadastro incompleto.
 *
 * Ocupa o lugar do conteúdo do portal até telefone e nascimento existirem —
 * o Google não traz nenhum dos dois. Nome vem preenchido (do provedor ou do
 * cadastro) e pode ser corrigido; e-mail é somente leitura por ser a
 * identidade da conta.
 */
export function CompleteProfileForm({ profile }: { profile: ClientProfileStatusDTO }) {
  const {
    form,
    acceptedTerms,
    setAcceptedTerms,
    error,
    loading,
    update,
    submit,
    today,
  } = useCompleteProfileForm({ profile });

  return (
    <div className="mx-auto w-full max-w-140">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-lg bg-zinc-100 p-2 text-zinc-700">
            <Lock className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-zinc-950">
              Complete seu cadastro
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500">
              Precisamos do seu telefone e da sua data de nascimento para
              liberar os agendamentos. Leva menos de um minuto.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <FieldLabel>Nome completo</FieldLabel>
            <Input
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Maria Souza"
              autoComplete="name"
              minLength={3}
              required
            />
          </div>

          <div>
            <FieldLabel>E-mail</FieldLabel>
            <Input value={profile.email} readOnly disabled className="bg-zinc-50" />
            <p className="mt-1.5 text-xs text-zinc-400">
              É o e-mail da sua conta e não pode ser alterado aqui.
            </p>
          </div>

          <div>
            <FieldLabel>Telefone</FieldLabel>
            <Input
              value={form.phone}
              onChange={(event) => update("phone", formatPhoneBR(event.target.value))}
              placeholder="(11) 99999-0000"
              autoComplete="tel"
              inputMode="tel"
              required
            />
          </div>

          <div>
            <FieldLabel>Data de nascimento</FieldLabel>
            <Input
              type="date"
              value={form.birthDate}
              onChange={(event) => update("birthDate", event.target.value)}
              max={today}
              min="1900-01-01"
              required
            />
          </div>

          {error ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 size-4 shrink-0 accent-zinc-900"
            />
            <span className="text-xs leading-relaxed text-zinc-500">
              Ao continuar, aceito que meus dados pessoais (nome, e-mail,
              telefone e data de nascimento) sejam armazenados e utilizados
              pela clínica para oferecer um atendimento personalizado.
            </span>
          </label>

          <Button className="w-full" size="lg" type="submit" disabled={loading || !acceptedTerms}>
            {loading ? "Salvando..." : "Salvar e continuar"}
            {!loading && <ArrowRight />}
          </Button>
        </form>
      </div>
    </div>
  );
}
