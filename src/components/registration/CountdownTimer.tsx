import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  targetDate: string | Date;
  label?: string;
  onComplete?: () => void;
  className?: string;
  variant?: "default" | "compact" | "hero";
}

interface TimeUnit {
  value: number;
  label: string;
  shortLabel: string;
}

function FlipDigit({ value, label }: { value: number; label: string }) {
  const [prevValue, setPrevValue] = useState(value);
  
  useEffect(() => {
    if (value !== prevValue) {
      setPrevValue(value);
    }
  }, [value, prevValue]);

  const displayValue = value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={value}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          >
            <div className="px-3 py-2 sm:px-4 sm:py-3 min-w-[48px] sm:min-w-[64px]">
              <span className="text-2xl sm:text-4xl font-bold text-foreground font-mono">
                {displayValue}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
        {/* Gradient overlay for 3D effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/20 rounded-lg pointer-events-none" />
      </div>
      <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ 
  targetDate, 
  label,
  onComplete,
  className,
  variant = "default"
}: CountdownTimerProps) {
  const target = useMemo(() => 
    typeof targetDate === "string" ? new Date(targetDate) : targetDate, 
    [targetDate]
  );
  
  const [timeLeft, setTimeLeft] = useState<TimeUnit[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        setIsComplete(true);
        onComplete?.();
        return [
          { value: 0, label: "Hari", shortLabel: "H" },
          { value: 0, label: "Jam", shortLabel: "J" },
          { value: 0, label: "Menit", shortLabel: "M" },
          { value: 0, label: "Detik", shortLabel: "D" },
        ];
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Set urgent state if less than 24 hours
      setIsUrgent(days === 0 && hours < 24);

      return [
        { value: days, label: "Hari", shortLabel: "H" },
        { value: hours, label: "Jam", shortLabel: "J" },
        { value: minutes, label: "Menit", shortLabel: "M" },
        { value: seconds, label: "Detik", shortLabel: "D" },
      ];
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [target, onComplete]);

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-muted",
          className
        )}
      >
        <Clock className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Waktu telah berakhir
        </span>
      </motion.div>
    );
  }

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
          isUrgent 
            ? "bg-destructive/10 text-destructive" 
            : "bg-primary/10 text-primary",
          className
        )}
      >
        {isUrgent ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {timeLeft.map((t, i) => (
            <span key={t.label}>
              {t.value}{t.shortLabel}
              {i < timeLeft.length - 1 && " : "}
            </span>
          ))}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("text-center", className)}
    >
      {/* Label */}
      {label && (
        <motion.div
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4",
            isUrgent 
              ? "bg-destructive/10" 
              : "bg-primary/10"
          )}
          animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {isUrgent ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <Clock className="h-4 w-4 text-primary" />
          )}
          <span className={cn(
            "text-sm font-medium",
            isUrgent ? "text-destructive" : "text-primary"
          )}>
            {label}
          </span>
        </motion.div>
      )}

      {/* Countdown Digits */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {timeLeft.map((unit, index) => (
          <div key={unit.label} className="flex items-center gap-2 sm:gap-4">
            <FlipDigit value={unit.value} label={unit.label} />
            {index < timeLeft.length - 1 && (
              <motion.span
                className="text-2xl sm:text-4xl font-bold text-muted-foreground"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                :
              </motion.span>
            )}
          </div>
        ))}
      </div>

      {/* Urgent Warning */}
      {isUrgent && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm text-destructive font-medium"
        >
          ⚠️ Segera selesaikan pendaftaran Anda!
        </motion.p>
      )}
    </motion.div>
  );
}
