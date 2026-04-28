import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: "Low" | "Medium" | "High";
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-md",
        level === "High" && "risk-high",
        level === "Medium" && "risk-medium",
        level === "Low" && "risk-low",
        className
      )}
    >
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        level === "High" && "bg-risk-high animate-pulse",
        level === "Medium" && "bg-risk-medium",
        level === "Low" && "bg-risk-low",
      )} />
      {level}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant =
    status === "Pending" || status === "Open" || status === "Under Investigation"
      ? "status-pending"
      : status === "Active"
      ? "status-active"
      : "status-closed";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-md",
        variant,
        className
      )}
    >
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        variant === "status-active" && "bg-status-active",
        variant === "status-pending" && "bg-status-pending",
        variant === "status-closed" && "bg-status-closed",
      )} />
      {status}
    </span>
  );
}
