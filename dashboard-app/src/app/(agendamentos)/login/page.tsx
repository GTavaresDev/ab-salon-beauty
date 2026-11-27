import type { Metadata } from "next";
import { LoginClient } from "./login-client.component";

const siteUrl = process.env.APP_URL || "https://painel.absalonbeauty.com.br";
const shareImage = `${siteUrl}/og-image.png`;

export const metadata: Metadata = {
  title: "Login — Agendamentos",
  description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
  openGraph: {
    title: "Agendamentos — Gestão Inteligente & Sistema de Agendamentos",
    description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
    url: `${siteUrl}/login`,
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

export default function LoginPage() {
  return <LoginClient />;
}
