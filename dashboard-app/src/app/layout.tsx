import { type ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.APP_URL || "https://painel.absalonbeauty.com.br";
const shareImage = `${siteUrl}/images/brand/logo-circulo.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Agendamentos — Sistema de Gestão & Agendamentos",
    template: "%s | Agendamentos",
  },
  description: "Gerencie horários, clientes, produtos e relatórios da sua clínica de estética em um só lugar.",
  openGraph: {
    title: "Agendamentos — Gestão Inteligente & Sistema de Agendamentos",
    description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
    url: siteUrl,
    siteName: "Agendamentos",
    images: [
      {
        url: shareImage,
        secureUrl: shareImage,
        width: 1254,
        height: 1254,
        alt: "Agendamentos — Gestão Inteligente & Sistema de Agendamentos",
        type: "image/png",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: {
      url: "/images/brand/logo-circulo.png",
      type: "image/png",
      sizes: "1254x1254",
    },
    shortcut: "/images/brand/logo-circulo.png",
    apple: {
      url: "/images/brand/logo-circulo.png",
      type: "image/png",
      sizes: "1254x1254",
    },
  },
  twitter: {
    card: "summary",
    title: "Agendamentos — Gestão Inteligente & Sistema de Agendamentos",
    description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
    images: [shareImage],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
