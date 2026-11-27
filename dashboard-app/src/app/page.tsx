import type { Metadata } from "next";
import { redirect } from "next/navigation";

const siteUrl = process.env.APP_URL || "https://painel.absalonbeauty.com.br";
const shareImage = `${siteUrl}/images/brand/logo-circulo.png`;

export const metadata: Metadata = {
  title: "Agendamentos — Gestão Inteligente & Sistema de Agendamentos",
  description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
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
  twitter: {
    card: "summary",
    title: "Agendamentos — Gestão Inteligente & Sistema de Agendamentos",
    description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
    images: [shareImage],
  },
};

export default function HomePage() {
  redirect("/login");
}
