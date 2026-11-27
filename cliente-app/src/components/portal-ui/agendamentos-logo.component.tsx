"use client";

import Image from "next/image";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}

export function AgendamentosLogo({
  className = "",
  size = "md",
}: LogoProps) {
  const height = size === "sm" ? 32 : size === "lg" ? 56 : 40;
  const width = Math.round((height * 935) / 240);

  return (
    <Image
      src="/images/brand/logo-horizontal-transparente.png"
      alt="AB Salon Beauty"
      width={width}
      height={height}
      className={`h-auto w-auto object-contain ${className}`}
    />
  );
}
