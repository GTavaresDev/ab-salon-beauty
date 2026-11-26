import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clientSessionCookieName, decodeClientSessionToken } from "@/lib/client-session-token";

const AUTH_ROOT = "/cliente";
const HOME = "/cliente/painel";
const isUnder = (path: string, root: string) => path === root || path.startsWith(`${root}/`);

export default async function proxy(request: NextRequest, _event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  if (!isUnder(pathname, AUTH_ROOT)) return NextResponse.next();

  const value = request.cookies.get(clientSessionCookieName())?.value;
  const session = value ? await decodeClientSessionToken(value) : null;
  const protectedRoute = isUnder(pathname, HOME);

  if (!session && protectedRoute) return NextResponse.redirect(new URL(AUTH_ROOT, request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/cliente/:path*"] };
