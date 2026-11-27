import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl = process.env.APP_URL || "https://agendamentos.vercel.app";
const shareImage = `${siteUrl}/images/brand/logo-circulo.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Portal do Cliente | Agendamentos", template: "%s | Agendamentos" },
  description: "Acesse seus agendamentos e reserve seu próximo horário.",
  openGraph: {
    title: "Portal do Cliente | Agendamentos",
    description: "Acesse seus agendamentos e reserve seu próximo horário.",
    url: siteUrl,
    siteName: "Agendamentos",
    images: [
      {
        url: shareImage,
        secureUrl: shareImage,
        width: 1254,
        height: 1254,
        alt: "AB Salon Beauty",
        type: "image/png",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: {
      url: "/images/brand/logo-circulo.png?v=3",
      type: "image/png",
      sizes: "1254x1254",
    },
    shortcut: "/images/brand/logo-circulo.png?v=3",
    apple: {
      url: "/images/brand/logo-circulo.png?v=3",
      type: "image/png",
      sizes: "1254x1254",
    },
  },
  twitter: {
    card: "summary",
    title: "Portal do Cliente | Agendamentos",
    description: "Acesse seus agendamentos e reserve seu próximo horário.",
    images: [shareImage],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
