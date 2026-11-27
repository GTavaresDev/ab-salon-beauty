"use client";

import { useLoginForm } from "../hooks/use-login-form";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/portal-ui/button.component";
import Link from "next/link";
import { Input } from "@/components/portal-ui/input.component";

import { PortalPendingNotice } from "./portal-pending-notice.component";
import { portalOAuthErrorMessage } from "./portal-oauth-error/portal-oauth-error";

const inputClass =
  "h-12 rounded-xl border-[#5C1A33]/20 text-base text-[#3D0F22] placeholder:text-[#9B4A68] focus:border-[#7A3350] focus:ring-2 focus:ring-[#7A3350]";

export function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    loading,
    submit,
  } = useLoginForm();

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="client-email" className="mb-2 block text-sm font-semibold">E-mail</label>
        <Input
          id="client-email"
          type="email"
          className={inputClass}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="seuemail@exemplo.com"
          autoComplete="email"
          inputMode="email"
          required
        />
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3">
          <label htmlFor="client-password" className="text-sm font-semibold">Senha</label>
          <Link href="/cliente/recuperar-senha" className="rounded-sm py-1 text-sm font-semibold text-[#7A3350] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A3350]">
            Esqueci minha senha
          </Link>
        </div>
        <div className="relative">
          <Input
            id="client-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua senha"
            className={`${inputClass} pr-24`}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-controls="client-password"
            className="absolute inset-y-0 right-0 min-h-12 rounded-r-xl px-3 text-xs! font-semibold! text-[#7A3350] hover:text-[#3D0F22] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#7A3350]"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      {error === portalOAuthErrorMessage("acesso") ? (
        <PortalPendingNotice />
      ) : error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        className="w-full bg-[#F8C5CE] text-sm! font-semibold! text-[#3D0F22] hover:bg-[#F4B6C6] focus-visible:ring-[#7A3350] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-100"
        size="lg"
        type="submit"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "Entrando..." : "Entrar"} {!loading && <ArrowRight aria-hidden="true" />}
      </Button>
    </form>
  );
}
