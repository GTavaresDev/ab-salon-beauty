import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Link from "next/link";

import { HeaderNav } from "@/components/HeaderNav";
import { ScrollReveal } from "@/components/ScrollReveal";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Design de Sobrancelhas em Goiânia | Henna, Brow Lamination e Dermaplaning",
  description:
    "Estudio de sobrancelhas em Goiania com design personalizado, sobrancelha + henna, brow lamination e dermaplaning. Resultado natural e atendimento especializado. Agende agora.",
  keywords: [
    "AB Sobrancelhas",
    "sobrancelhas em Goiânia",
    "design de sobrancelhas Goiânia",
    "sobrancelha com henna Goiânia",
    "sobrancelha + henna Goiânia",
    "estudio de sobrancelhas Goiânia",
    "estética facial Goiânia",
    "lash lifting Goiânia",
    "brow lamination Goiânia",
    "dermaplaning Goiânia",
    "limpeza de pele Goiânia",
    "nanoblading Goiânia",
    "revitalização labial Goiânia",
    "salão de beleza em Goiânia",
  ],
  alternates: {
    canonical: "https://studioamandabeauty.com/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Design de Sobrancelhas em Goiânia | AB Sobrancelhas",
    description:
      "Sobrancelha + henna, brow lamination e dermaplaning em Goiânia com resultado natural e atendimento profissional.",
    url: "https://studioamandabeauty.com/",
    siteName: "AB Sobrancelhas",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://studioamandabeauty.com/assets/absobrancelhas.jpeg",
        width: 646,
        height: 866,
        alt: "Logo principal da AB Sobrancelhas, salão de beleza e estética facial em Goiânia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Design de Sobrancelhas em Goiânia | AB Sobrancelhas",
    description:
      "Estudio de sobrancelhas em Goiania com design, henna, brow lamination e dermaplaning. Agende agora.",
    images: ["https://studioamandabeauty.com/assets/absobrancelhas.jpeg"],
  },
};

const navItems = [
  { href: "#hero", label: "Inicio" },
  { href: "#services", label: "Servicos" },
  { href: "#testimonials", label: "Depoimentos" },
  { href: "#cta", label: "Contato" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${cormorant.variable} font-[var(--font-manrope)]`}>
        <ScrollReveal />
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-blush-900/60 backdrop-blur-lg">
          <nav className="section-shell flex h-16 items-center justify-between">
            <Link href="#hero" className="font-[var(--font-cormorant)] text-lg tracking-wide text-blush-50">
              AB Sobrancelhas
            </Link>
            <HeaderNav items={navItems} />
            <Link
              href="#cta"
              className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/15 md:text-sm"
            >
              Agendar
            </Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
