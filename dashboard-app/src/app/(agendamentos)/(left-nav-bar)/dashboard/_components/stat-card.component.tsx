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
        "@container/stat h-full overflow-hidden border border-zinc-700/70 bg-zinc-800 text-white shadow-sm transition-all flex flex-col justify-between select-none",
        isInteractive && "cursor-pointer hover:border-zinc-500 hover:bg-zinc-750 active:scale-[0.99]",
        active && "ring-2 ring-amber-500/80 border-amber-500/80 bg-zinc-800",
        highlight && !active && "border-amber-500/60 bg-zinc-800",
      )}
    >
      <CardContent className="p-[clamp(0.75rem,4.5cqw,1.25rem)] flex flex-col justify-between h-full space-y-[clamp(0.5rem,2.5cqw,1rem)]">
        <div>
          <div className="mb-[clamp(0.375rem,2.5cqw,0.75rem)] flex items-center justify-between gap-[clamp(0.25rem,1.5cqw,0.75rem)]">
            <div
              className={cn(
                "flex size-[clamp(1.75rem,8cqw,2.5rem)] shrink-0 items-center justify-center rounded-xl bg-zinc-700/80 text-white transition-colors",
                highlight && "bg-amber-500/20 text-amber-400",
                active && "bg-amber-500 text-zinc-950",
              )}
            >
              <Icon className="size-[clamp(0.875rem,4cqw,1.25rem)]" />
            </div>
            {badge && (
              <Badge
                variant="outline"
                className={cn(
                  "border-white/15 bg-white/10 text-[clamp(0.5625rem,2.5cqw,0.75rem)] font-medium text-white px-[clamp(0.375rem,1.8cqw,0.5rem)] py-[clamp(0.125rem,0.8cqw,0.25rem)] shrink-0 whitespace-nowrap leading-none flex items-center",
                  badgeClassName,
                )}
              >
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-[clamp(0.6875rem,3.2cqw,0.875rem)] font-medium text-zinc-300 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {label}
          </p>
        </div>

        <div className="mt-auto pt-1">
          <div className="flex items-baseline justify-between gap-x-[clamp(0.25rem,1.5cqw,0.5rem)]">
            <p
              className={cn(
                "text-[clamp(1.125rem,6.8cqw,1.875rem)] font-semibold tracking-[-0.04em] text-white tabular-nums leading-none whitespace-nowrap",
                highlight && "text-amber-300",
              )}
            >
              {value}
            </p>
            <span className="text-[clamp(0.5625rem,2.6cqw,0.75rem)] text-zinc-400 font-normal leading-none whitespace-nowrap shrink-0">
              {detail}
            </span>
          </div>
          {progress !== undefined && (
            <div className="mt-[clamp(0.375rem,2cqw,0.75rem)] h-[clamp(0.25rem,1.2cqw,0.375rem)] overflow-hidden rounded-full bg-zinc-700">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

