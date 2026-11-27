import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge.component";
import { Card, CardContent } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  progress,
  badge,
  badgeClassName,
  onClick,
  active,
  highlight,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  progress?: number;
  badge?: ReactNode;
  badgeClassName?: string;
  onClick?: () => void;
  active?: boolean;
  highlight?: boolean;
}) {
  const isInteractive = Boolean(onClick);

  return (
    <Card
      onClick={onClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        "@container/stat flex h-full select-none flex-col justify-between overflow-hidden border border-[#E3AEBE] bg-gradient-to-br from-[#F9CAD5] to-[#F4B6C6] text-[#3D0F22] shadow-sm transition-all",
        isInteractive && "cursor-pointer hover:border-[#9B4A68] hover:shadow-md active:scale-[0.99]",
        active && "border-[#B8912F] ring-2 ring-[#B8912F]/50",
        highlight && !active && "border-[#B8912F]/70",
      )}
    >
      <CardContent className="p-[clamp(0.75rem,4.5cqw,1.25rem)] flex flex-col justify-between h-full space-y-[clamp(0.5rem,2.5cqw,1rem)]">
        <div>
          <div className="mb-[clamp(0.375rem,2.5cqw,0.75rem)] flex items-center justify-between gap-[clamp(0.25rem,1.5cqw,0.75rem)]">
            <div
              className={cn(
                "flex size-[clamp(1.75rem,8cqw,2.5rem)] shrink-0 items-center justify-center rounded-xl bg-white/65 text-[#5C1A33] transition-colors",
                highlight && "bg-[#B8912F]/15 text-[#8A6819]",
                active && "bg-[#B8912F] text-white",
              )}
            >
              <Icon className="size-[clamp(0.875rem,4cqw,1.25rem)]" />
            </div>
            {badge && (
              <Badge
                variant="outline"
                className={cn(
                  "flex shrink-0 items-center whitespace-nowrap border-white/80 bg-white/45 px-[clamp(0.375rem,1.8cqw,0.5rem)] py-[clamp(0.125rem,0.8cqw,0.25rem)] text-[clamp(0.5625rem,2.5cqw,0.75rem)] font-medium leading-none text-[#5C1A33]",
                  badgeClassName,
                )}
              >
                {badge}
              </Badge>
            )}
          </div>
          <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(0.6875rem,3.2cqw,0.875rem)] font-medium leading-tight text-[#7A3350]">
            {label}
          </p>
        </div>

        <div className="mt-auto pt-1">
          <div className="flex items-baseline justify-between gap-x-[clamp(0.25rem,1.5cqw,0.5rem)]">
            <p
              className={cn(
                "whitespace-nowrap text-[clamp(1.125rem,6.8cqw,1.875rem)] font-semibold leading-none tracking-[-0.04em] text-[#3D0F22] tabular-nums",
                highlight && "text-[#8A6819]",
              )}
            >
              {value}
            </p>
            <span className="shrink-0 whitespace-nowrap text-[clamp(0.5625rem,2.6cqw,0.75rem)] font-normal leading-none text-[#9B4A68]">
              {detail}
            </span>
          </div>
          {progress !== undefined && (
            <div className="mt-[clamp(0.375rem,2cqw,0.75rem)] h-[clamp(0.25rem,1.2cqw,0.375rem)] overflow-hidden rounded-full bg-[#5C1A33]/15">
              <div
                className="h-full rounded-full bg-[#5C1A33] transition-[width] duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

