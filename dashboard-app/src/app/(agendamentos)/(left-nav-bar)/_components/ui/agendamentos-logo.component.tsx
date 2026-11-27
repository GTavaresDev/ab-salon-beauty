"use client";

import Image from "next/image";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light" | "rose";
  size?: "sm" | "md" | "lg";
}

export function AgendamentosLogo({
  className = "",
  variant = "light",
  size = "md",
}: LogoProps) {
  const isDark = variant === "dark";
  const isRose = variant === "rose";

  const logoHeight = size === "sm" ? 28 : size === "lg" && isRose ? 128 : size === "lg" ? 40 : 32;
  const logoWidth = Math.round((logoHeight * 1138) / 353);
  const titleSize =
    size === "sm"
      ? "text-base font-bold"
      : size === "lg" && isRose
        ? "text-[22px] font-bold"
      : size === "lg"
        ? "text-2xl font-bold"
        : "text-lg font-bold";
  const badgeSize =
    isRose
      ? "text-lg"
      : size === "sm"
      ? "text-[9px]"
      : size === "lg"
        ? "text-[10px]"
        : "text-[9.5px]";

  return (
    <div
      className={`flex select-none ${
        isRose ? "flex-col items-center gap-4" : "items-center gap-2.5"
      } ${className}`}
    >
      <Image
        src="/images/brand/logo-horizontal.png"
        alt="AB Salon Beauty"
        width={logoWidth}
        height={logoHeight}
        className={`${isRose ? "h-32" : "h-auto"} w-auto shrink-0 object-contain`}
      />

      {/* Brand Typography */}
      <div className="flex flex-col">
        {!isRose ? (
          <span
            className={`leading-none tracking-tight ${titleSize} ${
              isDark ? "text-white" : "text-zinc-950"
            }`}
          >
            AB Salon Beauty
          </span>
        ) : null}
        <span
          className={`${isRose ? "font-medium" : "mt-1 font-semibold"} leading-none uppercase ${
            isRose ? "tracking-[0.25em]" : "tracking-[0.14em]"
          } ${badgeSize} ${
            isRose
              ? "text-[#9B4A68]"
              : isDark
                ? "text-zinc-400"
                : "text-zinc-500"
          }`}
        >
          Gestão & Agenda
        </span>
      </div>
    </div>
  );
}
