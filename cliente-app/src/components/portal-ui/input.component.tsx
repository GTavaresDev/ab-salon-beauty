import { type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn("flex h-11 w-full rounded-lg border border-[#E7C5CF] bg-white px-3 py-2 text-sm text-[#3D0F22] outline-none transition placeholder:text-[#B98A9C] focus:border-[#9B4A68] focus:ring-4 focus:ring-[#9B4A68]/10 disabled:cursor-not-allowed disabled:opacity-50", className)}
      {...props}
    />
  );
}
