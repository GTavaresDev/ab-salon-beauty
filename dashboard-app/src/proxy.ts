import NextAuth from "next-auth";
import { type NextFetchEvent, type NextRequest } from "next/server";
import { authConfig } from "@/auth.config";

// `auth` é sobrecarregado (wrapper de handler / middleware); aqui é o middleware.
const staffMiddleware = NextAuth(authConfig).auth as unknown as (
  request: NextRequest,
  event: NextFetchEvent,
) => Promise<Response | undefined>;

/** Telas públicas de acesso do cliente: login, cadastro e recuperação. */
export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  return staffMiddleware(request, event);
}

export const config = {
  matcher: [
    "/comissao/:path*",
    "/",
    "/login",
    "/dashboard/:path*",
    "/agenda/:path*",
    "/clientes/:path*",
    "/usuarios/:path*",
    "/produtos/:path*",
    "/servicos/:path*",
    "/vendas/:path*",
    "/relatorios/:path*",
  ],
};
