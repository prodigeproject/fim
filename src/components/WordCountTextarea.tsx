import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WordCountTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  minWords?: number;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export function WordCountTextarea({
  id,
  label,
  value,
  onChange,
  minWords = 0,
  placeholder,
  rows = 5,
  required = false,
}: WordCountTextareaProps) {
  const wordCount = value.trim().split(/\s+/).filter(w => w).length;
  const isValid = minWords === 0 || wordCount >= minWords;
  const hasContent = value.trim().length > 0;
  const showWarning = hasContent && !isValid && minWords > 0;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1">
        {label} {required && "*"}
        {minWords > 0 && (
          <span className="text-xs text-muted-foreground ml-1">(minimal {minWords} kata)</span>
        )}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          showWarning && "border-amber-500 focus-visible:ring-amber-500"
        )}
      />
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          {hasContent && minWords > 0 && (
            isValid ? (
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            )
          )}
          <span className={cn(
            "text-muted-foreground",
            showWarning && "text-amber-600 font-medium"
          )}>
            Jumlah kata: {wordCount}
            {showWarning && ` (kurang ${minWords - wordCount} kata lagi)`}
          </span>
        </div>
        {minWords > 0 && (
          <span className={cn(
            "text-muted-foreground",
            isValid ? "text-green-600" : "text-muted-foreground"
          )}>
            {isValid ? "✓ Memenuhi syarat" : `Target: ${minWords} kata`}
          </span>
        )}
      </div>
    </div>
  );
}
