import Image from "next/image";
import { type ReactNode } from "react";

/** Casca das telas públicas do portal (login, cadastro, recuperação). */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-6 py-10 sm:px-10">
      <div className="w-full max-w-[430px]">
        <div className="mb-7 flex flex-col items-center gap-2">
          <Image
            src="/images/brand/logo-horizontal-transparente.png"
            alt="AB Salon Beauty"
            width={935}
            height={240}
            className="h-14 w-auto max-w-full object-contain"
            preload
          />
          <p className="text-center text-[11px] font-medium tracking-[0.25em] text-[#9B4A68]">
            GESTÃO &amp; AGENDA
          </p>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#3D0F22]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#7A3350]">{subtitle}</p>
        </div>

        {children}

        {footer ? (
          <div className="mt-8 border-t border-[#5C1A33]/10 pt-6 text-center text-sm text-[#7A3350]">
            {footer}
          </div>
        ) : null}

        <p className="mt-20 text-center text-xs text-zinc-400">
          &copy; 2026 Agendamentos. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}
