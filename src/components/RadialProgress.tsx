import { memo } from "react";
import { cn } from "@/lib/utils";

interface RadialProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

function RadialProgressComponent({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  showLabel = true,
  label,
}: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  const getColor = () => {
    if (value >= 100) return "hsl(var(--supporting))";
    if (value >= 60) return "hsl(var(--primary))";
    if (value >= 30) return "hsl(var(--accent))";
    return "hsl(var(--muted-foreground))";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{Math.round(value)}%</span>
          {label && <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>}
        </div>
      )}
    </div>
  );
}

export const RadialProgress = memo(RadialProgressComponent);
