"use client";

import { usePathname } from "next/navigation";

export function usePortalNav({
  className,
  variant = "inline",
}: {
  className?: string;
  variant?: "inline" | "bar" | "sidebar";
}) {
  const pathname = usePathname();
  return {
    pathname,
  };
}
