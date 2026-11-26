"use client";

import { useLoginForm } from "../hooks/use-login-form";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/portal-ui/button.component";
import { FieldLabel } from "@/components/portal-ui/field-label.component";
import { Input } from "@/components/portal-ui/input.component";

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
    <form onSubmit={submit} className="space-y-5">
      <div>
        <FieldLabel>E-mail</FieldLabel>
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

      <div>
        <FieldLabel>Senha</FieldLabel>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua senha"
            className="pr-16"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500 hover:text-black"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Button className="w-full" size="lg" type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"} {!loading && <ArrowRight />}
      </Button>
    </form>
  );
}
