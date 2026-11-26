"use client";

import { useState, useRef, useEffect } from "react";

export interface CardInfoExplanation {
  title: string;
  whatIsIt: string;
  howItIsCalculated: string;
  exampleOrNote?: string;
}

export function useCardInfoModal({
  info,
  align = "center",
  className,
}: {
  info: CardInfoExplanation;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);
  return {
    open,
    setOpen,
    ref,
  };
}
