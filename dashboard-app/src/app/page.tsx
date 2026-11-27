import type { Metadata } from "next";
import { redirect } from "next/navigation";

const siteUrl = process.env.APP_URL || "https://painel.absalonbeauty.com.br";
const shareImage = `${siteUrl}/og-image.png`;

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
        width: 1200,
        height: 630,
        alt: "Agendamentos — Gestão Inteligente & Sistema de Agendamentos",
        type: "image/png",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agendamentos — Gestão Inteligente & Sistema de Agendamentos",
    description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
    images: [shareImage],
  },
};

export default function HomePage() {
  redirect("/login");
}
