import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CrimeInsightLogo({ collapsed = false, size = "md", className }: LogoProps) {
  const iconSize = size === "lg" ? 48 : size === "md" ? 32 : 24;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Shield outline */}
        <path
          d="M24 4L6 12V24C6 34.5 13.8 43.4 24 46C34.2 43.4 42 34.5 42 24V12L24 4Z"
          fill="url(#shield-gradient)"
          stroke="hsl(210, 100%, 56%)"
          strokeWidth="1.5"
          opacity="0.9"
        />
        {/* Fingerprint lines inside shield */}
        <path
          d="M24 16C20 16 17 19 17 23C17 25.5 18 27 19.5 28.5"
          stroke="hsl(210, 100%, 70%)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M24 14C18.5 14 15 18 15 23C15 26.5 16.5 29 19 31.5"
          stroke="hsl(210, 100%, 70%)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M24 18C21.5 18 19 20 19 23C19 24.8 19.8 26.2 21 27.5"
          stroke="hsl(210, 100%, 70%)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M24 20C22.5 20 21 21.5 21 23C21 24 21.5 25 22.5 26"
          stroke="hsl(185, 80%, 55%)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        {/* Right side fingerprint */}
        <path
          d="M24 16C28 16 31 19 31 23C31 25.5 30 27 28.5 28.5"
          stroke="hsl(210, 100%, 70%)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M24 18C26.5 18 29 20 29 23C29 24.8 28.2 26.2 27 27.5"
          stroke="hsl(210, 100%, 70%)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M24 20C25.5 20 27 21.5 27 23C27 24 26.5 25 25.5 26"
          stroke="hsl(185, 80%, 55%)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        {/* Center dot */}
        <circle cx="24" cy="23" r="1.5" fill="hsl(185, 80%, 55%)" opacity="1" />
        {/* Scale of justice at bottom */}
        <line x1="24" y1="30" x2="24" y2="37" stroke="hsl(210, 100%, 60%)" strokeWidth="1.2" opacity="0.7" />
        <line x1="19" y1="34" x2="29" y2="34" stroke="hsl(210, 100%, 60%)" strokeWidth="1.2" opacity="0.7" />
        <path d="M19 34L17 37H21L19 34Z" fill="hsl(210, 100%, 60%)" opacity="0.5" />
        <path d="M29 34L27 37H31L29 34Z" fill="hsl(210, 100%, 60%)" opacity="0.5" />
        <defs>
          <linearGradient id="shield-gradient" x1="24" y1="4" x2="24" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(210, 100%, 20%)" />
            <stop offset="100%" stopColor="hsl(222, 47%, 6%)" />
          </linearGradient>
        </defs>
      </svg>
      {!collapsed && (
        <div className="flex flex-col">
          <span className={cn(
            "font-extrabold tracking-tight leading-none text-gradient",
            size === "lg" ? "text-2xl" : size === "md" ? "text-base" : "text-sm"
          )}>
            CRIME INSIGHT
          </span>
          <span className={cn(
            "text-muted-foreground uppercase tracking-[0.15em] leading-tight",
            size === "lg" ? "text-xs mt-1" : "text-[9px] mt-0.5"
          )}>
            Advanced Intelligence System
          </span>
        </div>
      )}
    </div>
  );
}
