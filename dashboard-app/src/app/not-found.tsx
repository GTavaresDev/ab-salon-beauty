import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "./(agendamentos)/(left-nav-bar)/_components/ui/button.component";

export const metadata: Metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#FFF9FB] px-5 py-8 text-[#5C1A33]">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-[#EFD7DE] bg-white shadow-sm md:grid-cols-2">
        <div className="grid place-items-center bg-[#FFF4F7] p-7 sm:p-10 md:min-h-96">
          <Image
            src="/images/brand/logo-circulo.png"
            alt="AB Salon Beauty"
            width={288}
            height={288}
            sizes="(max-width: 767px) 176px, 288px"
            className="h-auto w-44 max-w-full md:w-72"
          />
        </div>
        <div className="flex flex-col items-start justify-center p-7 sm:p-10">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Página não encontrada
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#7A3350]">
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
