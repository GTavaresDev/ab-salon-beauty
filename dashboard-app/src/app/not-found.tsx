import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AgendamentosLogo } from "./(agendamentos)/(left-nav-bar)/_components/ui/agendamentos-logo.component";
import { Button } from "./(agendamentos)/(left-nav-bar)/_components/ui/button.component";

export const metadata: Metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-zinc-50 px-5 py-8 text-zinc-950">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm md:grid-cols-2">
        <div className="relative isolate grid min-h-40 place-items-center overflow-hidden bg-zinc-950 p-7 text-white sm:p-10 md:min-h-96">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:48px_48px]"
          />
          <AgendamentosLogo variant="dark" size="lg" className="sm:scale-125" />
        </div>
        <div className="flex flex-col items-start justify-center p-7 sm:p-10">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Página não encontrada
          </h1>
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Confira o endereço ou volte ao painel para continuar.
          </p>
          <Button asChild className="mt-7">
            <Link href="/dashboard">
              <ArrowLeft aria-hidden="true" />
              Ir para o painel
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
