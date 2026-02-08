import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, X, CalendarIcon, Search, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface FilterConfig {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "dateRange" | "number" | "boolean";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterValue {
  [key: string]: string | number | boolean | Date | { from: Date; to: Date } | null;
}

interface AdvancedFilterProps {
  filters: FilterConfig[];
  values: FilterValue;
  onChange: (values: FilterValue) => void;
  onReset?: () => void;
  className?: string;
}

export function AdvancedFilter({
  filters,
  values,
  onChange,
  onReset,
  className,
}: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = useCallback(
    (id: string, value: FilterValue[string]) => {
      onChange({ ...values, [id]: value });
    },
    [values, onChange]
  );

  const activeFiltersCount = Object.values(values).filter(
    (v) => v !== null && v !== "" && v !== undefined
  ).length;

  const handleReset = () => {
    const resetValues: FilterValue = {};
    filters.forEach((f) => {
      resetValues[f.id] = null;
    });
    onChange(resetValues);
    onReset?.();
  };

  const renderFilterInput = (filter: FilterConfig) => {
    const value = values[filter.id];

    switch (filter.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={filter.id} className="text-sm font-medium">
              {filter.label}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id={filter.id}
                value={(value as string) || ""}
                onChange={(e) => handleChange(filter.id, e.target.value)}
                placeholder={filter.placeholder || `Cari ${filter.label.toLowerCase()}...`}
                className="pl-9 min-h-[44px]"
              />
            </div>
          </div>
        );

      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={filter.id} className="text-sm font-medium">
              {filter.label}
            </Label>
            <Select
              value={(value as string) || ""}
              onValueChange={(v) => handleChange(filter.id, v === "all" ? null : v)}
            >
              <SelectTrigger id={filter.id} className="min-h-[44px]">
                <SelectValue placeholder={filter.placeholder || "Pilih..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {filter.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "date":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{filter.label}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal min-h-[44px]",
                    !value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value
                    ? format(value as Date, "d MMMM yyyy", { locale: id })
                    : filter.placeholder || "Pilih tanggal..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value as Date | undefined}
                  onSelect={(date) => handleChange(filter.id, date || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case "dateRange":
        const rangeValue = value as { from: Date; to: Date } | null;
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{filter.label}</Label>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal min-h-[44px]",
                      !rangeValue?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rangeValue?.from
                      ? `${format(rangeValue.from, "d MMM", { locale: id })} - ${
                          rangeValue.to
                            ? format(rangeValue.to, "d MMM yyyy", { locale: id })
                            : "..."
                        }`
                      : "Pilih rentang..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={rangeValue ? { from: rangeValue.from, to: rangeValue.to } : undefined}
                    onSelect={(range) =>
                      handleChange(
                        filter.id,
                        range?.from ? { from: range.from, to: range.to || range.from } : null
                      )
                    }
                    initialFocus
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={filter.id} className="text-sm font-medium">
              {filter.label}
            </Label>
            <Input
              id={filter.id}
              type="number"
              value={(value as number) || ""}
              onChange={(e) => handleChange(filter.id, e.target.value ? Number(e.target.value) : null)}
              placeholder={filter.placeholder || "0"}
              className="min-h-[44px]"
            />
          </div>
        );

      case "boolean":
        return (
          <div className="space-y-2">
            <Label htmlFor={filter.id} className="text-sm font-medium">
              {filter.label}
            </Label>
            <Select
              value={value === true ? "true" : value === false ? "false" : "all"}
              onValueChange={(v) =>
                handleChange(filter.id, v === "all" ? null : v === "true")
              }
            >
              <SelectTrigger id={filter.id} className="min-h-[44px]">
                <SelectValue placeholder="Pilih..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="true">Ya</SelectItem>
                <SelectItem value="false">Tidak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] min-w-[44px] flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filter Lanjutan</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 px-2 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {filters.map((filter) => (
                <div key={filter.id}>{renderFilterInput(filter)}</div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setIsOpen(false)} className="min-h-[44px]">
                Terapkan Filter
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filter badges */}
      <div className="flex flex-wrap gap-1">
        {filters.map((filter) => {
          const value = values[filter.id];
          if (!value) return null;

          let displayValue = "";
          if (filter.type === "select" && filter.options) {
            displayValue = filter.options.find((o) => o.value === value)?.label || String(value);
          } else if (filter.type === "date" && value instanceof Date) {
            displayValue = format(value, "d MMM yy", { locale: id });
          } else if (filter.type === "dateRange" && typeof value === "object" && "from" in value) {
            displayValue = `${format(value.from, "d MMM", { locale: id })} - ${format(
              value.to,
              "d MMM yy",
              { locale: id }
            )}`;
          } else if (filter.type === "boolean") {
            displayValue = value ? "Ya" : "Tidak";
          } else {
            displayValue = String(value);
          }

          return (
            <Badge
              key={filter.id}
              variant="secondary"
              className="flex items-center gap-1 pl-2 pr-1"
            >
              <span className="text-xs">
                {filter.label}: {displayValue}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleChange(filter.id, null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
