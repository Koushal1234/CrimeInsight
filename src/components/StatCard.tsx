import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "default" | "danger" | "warning" | "success";
}

const accentBorder = {
  default: "border-l-primary",
  danger: "border-l-risk-high",
  warning: "border-l-risk-medium",
  success: "border-l-risk-low",
};

const iconStyles = {
  default: "text-primary bg-primary/10",
  danger: "text-risk-high bg-risk-high/10",
  warning: "text-risk-medium bg-risk-medium/10",
  success: "text-risk-low bg-risk-low/10",
};

export function StatCard({ title, value, icon: Icon, accent = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-lg p-5 border-l-[3px] card-hover animate-fade-in h-full min-h-[124px]",
        accentBorder[accent]
      )}
    >
      <div className="flex h-full items-start justify-between gap-4">
        <div className="flex min-h-full flex-1 flex-col">
          <p className="h-[3.75rem] text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2 leading-[1.15rem]">
            {title}
          </p>
          <p className="mt-auto text-3xl font-extrabold leading-none text-foreground tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        <div className={cn("p-2.5 rounded-lg shrink-0", iconStyles[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
