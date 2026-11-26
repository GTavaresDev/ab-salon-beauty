import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import amandaBorges from "../../assets/amanda-borges.jpeg";

function getWhatsappLink(): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "556291390313";
  const message = encodeURIComponent(
    "Ola, quero agendar um horario na AB Sobrancelhas.",
  );
  return `https://wa.me/${number}?text=${message}`;
}

export function Hero() {
  return <div></div>;
}
