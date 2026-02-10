import { memo } from "react";
import { Check, Loader2, AlertCircle, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

type AutosaveStatus = "idle" | "saving" | "saved" | "error";

interface AutosaveIndicatorProps {
  status: AutosaveStatus;
  lastSaved?: Date | null;
  className?: string;
}

function AutosaveIndicatorComponent({ status, lastSaved, className }: AutosaveIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs transition-all duration-300",
        status === "saving" && "text-muted-foreground",
        status === "saved" && "text-supporting",
        status === "error" && "text-destructive",
        status === "idle" && "text-muted-foreground",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Menyimpan...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3" />
          <span>
            Tersimpan
            {lastSaved && (
              <span className="ml-1 text-muted-foreground">
                {lastSaved.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-3 w-3" />
          <span>Gagal menyimpan</span>
        </>
      )}
      {status === "idle" && (
        <>
          <Cloud className="h-3 w-3" />
          <span>Autosave aktif</span>
        </>
      )}
    </div>
  );
}

export const AutosaveIndicator = memo(AutosaveIndicatorComponent);
