"use client";

import Image from "next/image";
import { useLoginScreen } from "../hooks/use-login-screen";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ClipboardList,
  Package,
  UserCog,
  Users,
} from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input.component";
import { FieldLabel } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/field-label.component";

const businessModules = [
  { title: "Agenda", description: "Horários sem conflito", Icon: CalendarDays },
  { title: "Clientes", description: "Histórico completo", Icon: Users },
  { title: "Equipe", description: "Funcionários e permissões", Icon: UserCog },
  { title: "Estoque", description: "Entrada e saída de produtos", Icon: Package },
  { title: "Atendimentos", description: "Registro de cada serviço", Icon: ClipboardList },
  { title: "Relatórios", description: "Dados para decidir melhor", Icon: BarChart3 },
];

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const {
    showPassword,
    setShowPassword,
    loading,
    email,
    setEmail,
    password,
    setPassword,
    error,
    submit,
  } = useLoginScreen({ onLogin });

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.02fr_.98fr]">
      <section className="relative hidden min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#F9CAD5] to-[#F4B6C6] px-6 py-8 sm:px-10 lg:flex lg:px-12 lg:py-10">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-white/35 blur-3xl" />
        <div className="absolute -bottom-28 -left-24 size-80 rounded-full bg-[#B8912F]/15 blur-3xl" />
        <div className="absolute -right-32 top-36 size-96 rounded-full border border-white/25" />
        <div className="absolute -right-16 top-52 size-64 rounded-full border border-white/30" />

        <div className="relative z-20 flex items-center gap-3">
          <div className="flex h-10 w-14 items-center justify-center">
            <Image
              src="/images/brand/logo-monograma-ab.svg"
              alt="AB Salon Beauty"
              width={52}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </div>
          <span className="text-[11px] font-medium tracking-[0.25em] text-[#9B4A68]">
            GESTÃO &amp; AGENDA
          </span>
        </div>

        <div className="relative z-20 mt-10 flex flex-1 flex-col">
          <div className="w-full max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/55 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-[#5C1A33]">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-[#B8912F] shadow-[0_0_0_3px_rgba(184,145,47,0.2)]"
              />
              GESTÃO COMPLETA
            </div>
            <h1 className="max-w-xl text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#5C1A33] sm:text-5xl">
              Toda a{" "}
              <span className="relative inline-block text-[#3D0F22] after:absolute after:-bottom-1 after:left-0 after:h-[3px] after:w-full after:-rotate-1 after:bg-[#B8912F] after:content-['']">
                gestão
              </span>{" "}
              do seu negócio em um só lugar.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#7A3350]">
              Agenda, clientes, equipe, estoque, atendimentos e relatórios reunidos
              em um sistema simples de usar, para você ter mais tempo para o que
              importa.
            </p>
          </div>

          <div className="mt-8 grid items-center gap-8 2xl:grid-cols-[1.08fr_.92fr]">
            <div className="relative hidden h-[270px] 2xl:block">
              <div className="animate-product-float absolute left-1 top-6 z-10 w-[310px] -rotate-2 rounded-[20px] bg-white p-5 shadow-xl shadow-[#5C1A33]/10">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#5C1A33]">
                  <CalendarDays className="size-4 text-[#9B4A68]" />
                  Agenda de hoje
                </div>
                <div className="space-y-3">
                  {[
                    ["09:00", "Marina Costa", "Confirmado", "bg-emerald-50 text-emerald-700"],
                    ["11:30", "Carlos Lima", "Em atendimento", "bg-pink-50 text-pink-700"],
                    ["15:00", "Ana Souza", "Aguardando", "bg-amber-50 text-amber-700"],
                  ].map(([time, name, status, statusClass]) => (
                    <div key={time} className="flex items-center gap-3 text-xs">
                      <span className="font-semibold text-[#5C1A33]">{time}</span>
                      <span className="min-w-0 flex-1 truncate text-zinc-600">{name}</span>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${statusClass}`}>
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="animate-product-float animation-delay-1000 absolute right-0 top-0 z-20 w-[190px] rotate-1 rounded-[20px] bg-white p-4 shadow-xl shadow-[#5C1A33]/10">
                <BarChart3 className="mb-3 size-5 text-[#9B4A68]" />
                <p className="text-xs text-zinc-500">Atendimentos no mês</p>
                <div className="mt-1 flex items-end justify-between">
                  <strong className="text-3xl text-[#5C1A33]">128</strong>
                  <span className="flex items-center text-xs font-semibold text-emerald-600">
                    <ArrowUpRight className="size-3.5" /> +12%
                  </span>
                </div>
              </div>

              <div className="animate-product-float animation-delay-2000 absolute bottom-2 right-5 z-20 w-[178px] -rotate-1 rounded-[20px] bg-white p-4 shadow-xl shadow-[#5C1A33]/10">
                <Package className="mb-3 size-5 text-[#B8912F]" />
                <p className="text-xs text-zinc-500">Estoque baixo</p>
                <strong className="mt-1 block text-lg text-[#5C1A33]">3 produtos</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              {businessModules.map(({ title, description, Icon }) => (
                <div key={title} className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                    <Icon className="size-4 text-[#9B4A68]" />
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-sm font-semibold text-[#5C1A33]">{title}</strong>
                    <span className="block text-xs leading-4 text-[#9B4A68]">{description}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-8 border-t border-[#5C1A33]/15 pt-5 text-sm text-[#7A3350]">
          <span>Menos planilhas, mais tempo para o que importa.</span>
        </div>
      </section>

      <section className="flex min-h-screen items-start justify-center bg-zinc-50 px-6 py-10 pt-36 sm:px-10 lg:pt-20">
        <div className="w-full max-w-[430px]">
          <div className="mb-10 flex justify-center lg:hidden">
            <Image
              src="/images/brand/logo-horizontal-transparente.png"
              alt="AB Salon Beauty"
              width={935}
              height={240}
              className="h-20 w-auto object-contain"
            />
          </div>
          <div className="mb-8 hidden flex-col items-center gap-4 lg:flex">
            <Image
              src="/images/brand/logo-horizontal-transparente.png"
              alt="AB Salon Beauty"
              width={935}
              height={240}
              className="h-32 w-auto object-contain"
            />
            <span className="text-lg font-medium uppercase tracking-[0.25em] text-[#9B4A68]">
              Gestão &amp; Agenda
            </span>
          </div>
          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-zinc-500">
              Bem-vindo de volta
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-950">
              Acesse sua conta
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Entre para acompanhar seus agendamentos.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <FieldLabel>E-mail</FieldLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                aria-label="E-mail"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <FieldLabel>Senha</FieldLabel>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="pr-16"
                  aria-label="Senha"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
            <Button
              className="w-full bg-[#F8C5CE] text-zinc-950 hover:bg-[#F8C5CE]"
              size="lg"
              type="submit"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"} {!loading && <ArrowRight />}
            </Button>
          </form>
          <p className="mt-8 text-center text-sm text-zinc-500">
            <span>Não tem uma conta? </span>
            <button type="button" className="font-semibold text-zinc-950 hover:underline">
              Fale com a gente
            </button>
          </p>
          <p className="mt-20 text-center text-xs text-zinc-400">
            <span>&copy; 2026 Agendamentos. Todos os direitos reservados.</span>
            <span className="mt-1 block text-zinc-400">
              Desenvolvido por: Gabriel Tavares dos Santos
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}
