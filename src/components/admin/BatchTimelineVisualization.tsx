import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, isWithinInterval, parseISO, isBefore, isAfter } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Calendar, FileCheck, MessageSquare, Trophy, Users } from "lucide-react";

interface RegistrationSettings {
  id: string;
  batch_name: string;
  batch_number: number;
  is_registration_open: boolean;
  registration_start_date: string | null;
  registration_end_date: string | null;
  admin_review_start_date: string | null;
  admin_review_end_date: string | null;
  admin_result_announcement_date: string | null;
  interview_start_date: string | null;
  interview_end_date: string | null;
  final_result_announcement_date: string | null;
}

interface BatchTimelineVisualizationProps {
  batch: RegistrationSettings;
}

interface TimelinePhase {
  name: string;
  icon: React.ReactNode;
  startDate: Date | null;
  endDate: Date | null;
  color: string;
  bgColor: string;
}

export function BatchTimelineVisualization({ batch }: BatchTimelineVisualizationProps) {
  const phases = useMemo<TimelinePhase[]>(() => [
    {
      name: "Pendaftaran",
      icon: <Users className="h-4 w-4" />,
      startDate: batch.registration_start_date ? parseISO(batch.registration_start_date) : null,
      endDate: batch.registration_end_date ? parseISO(batch.registration_end_date) : null,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500",
    },
    {
      name: "Review Administrasi",
      icon: <FileCheck className="h-4 w-4" />,
      startDate: batch.admin_review_start_date ? parseISO(batch.admin_review_start_date) : null,
      endDate: batch.admin_review_end_date ? parseISO(batch.admin_review_end_date) : null,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500",
    },
    {
      name: "Pengumuman Administrasi",
      icon: <Calendar className="h-4 w-4" />,
      startDate: batch.admin_result_announcement_date ? parseISO(batch.admin_result_announcement_date) : null,
      endDate: batch.admin_result_announcement_date ? parseISO(batch.admin_result_announcement_date) : null,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500",
    },
    {
      name: "Wawancara",
      icon: <MessageSquare className="h-4 w-4" />,
      startDate: batch.interview_start_date ? parseISO(batch.interview_start_date) : null,
      endDate: batch.interview_end_date ? parseISO(batch.interview_end_date) : null,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500",
    },
    {
      name: "Pengumuman Final",
      icon: <Trophy className="h-4 w-4" />,
      startDate: batch.final_result_announcement_date ? parseISO(batch.final_result_announcement_date) : null,
      endDate: batch.final_result_announcement_date ? parseISO(batch.final_result_announcement_date) : null,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500",
    },
  ], [batch]);

  // Calculate timeline boundaries
  const { timelineStart, timelineEnd, totalDays } = useMemo(() => {
    const validDates: Date[] = [];
    phases.forEach(phase => {
      if (phase.startDate) validDates.push(phase.startDate);
      if (phase.endDate) validDates.push(phase.endDate);
    });

    if (validDates.length === 0) {
      const now = new Date();
      return { timelineStart: now, timelineEnd: now, totalDays: 1 };
    }

    const start = new Date(Math.min(...validDates.map(d => d.getTime())));
    const end = new Date(Math.max(...validDates.map(d => d.getTime())));
    const days = Math.max(differenceInDays(end, start), 1);

    return { timelineStart: start, timelineEnd: end, totalDays: days };
  }, [phases]);

  const getPhasePosition = (phase: TimelinePhase) => {
    if (!phase.startDate || !phase.endDate) return null;

    const startOffset = differenceInDays(phase.startDate, timelineStart);
    const duration = Math.max(differenceInDays(phase.endDate, phase.startDate), 1);
    
    const leftPercent = (startOffset / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;

    return { left: Math.max(0, leftPercent), width: Math.min(widthPercent, 100 - leftPercent) };
  };

  const getPhaseStatus = (phase: TimelinePhase): "upcoming" | "active" | "completed" | "not-set" => {
    if (!phase.startDate || !phase.endDate) return "not-set";
    
    const now = new Date();
    if (isBefore(now, phase.startDate)) return "upcoming";
    if (isAfter(now, phase.endDate)) return "completed";
    return "active";
  };

  const formatDateRange = (start: Date | null, end: Date | null) => {
    if (!start && !end) return "Belum diatur";
    if (start && end && start.getTime() === end.getTime()) {
      return format(start, "d MMM yyyy", { locale: localeId });
    }
    const startStr = start ? format(start, "d MMM", { locale: localeId }) : "-";
    const endStr = end ? format(end, "d MMM yyyy", { locale: localeId }) : "-";
    return `${startStr} - ${endStr}`;
  };

  const validPhases = phases.filter(p => p.startDate || p.endDate);

  if (validPhases.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Timeline Seleksi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Belum ada timeline yang diatur untuk batch ini
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Timeline Seleksi: {batch.batch_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gantt-like visualization */}
        <div className="space-y-3">
          {/* Timeline header */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
            <span>{format(timelineStart, "d MMM yyyy", { locale: localeId })}</span>
            <span>{format(timelineEnd, "d MMM yyyy", { locale: localeId })}</span>
          </div>

          {/* Timeline bars */}
          <div className="space-y-2">
            {phases.map((phase, index) => {
              const position = getPhasePosition(phase);
              const status = getPhaseStatus(phase);

              return (
                <div key={index} className="flex items-center gap-3">
                  {/* Phase label */}
                  <div className={`flex items-center gap-2 w-40 shrink-0 ${phase.color}`}>
                    {phase.icon}
                    <span className="text-sm font-medium truncate">{phase.name}</span>
                  </div>

                  {/* Timeline bar container */}
                  <div className="flex-1 relative h-8 bg-muted rounded-md overflow-hidden">
                    {position ? (
                      <div
                        className={`absolute top-1 bottom-1 rounded ${phase.bgColor} ${
                          status === "active" ? "opacity-100 animate-pulse" : 
                          status === "completed" ? "opacity-60" : "opacity-40"
                        }`}
                        style={{
                          left: `${position.left}%`,
                          width: `${position.width}%`,
                          minWidth: "4px",
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                        Belum diatur
                      </div>
                    )}

                    {/* Today marker */}
                    {(() => {
                      const now = new Date();
                      if (now >= timelineStart && now <= timelineEnd) {
                        const todayPosition = (differenceInDays(now, timelineStart) / totalDays) * 100;
                        return (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                            style={{ left: `${todayPosition}%` }}
                          />
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* Status badge */}
                  <div className="w-24 shrink-0">
                    {status === "not-set" ? (
                      <Badge variant="outline" className="text-xs">-</Badge>
                    ) : status === "active" ? (
                      <Badge className="bg-green-500 text-white text-xs">Aktif</Badge>
                    ) : status === "completed" ? (
                      <Badge variant="secondary" className="text-xs">Selesai</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Mendatang</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend for today marker */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <div className="w-3 h-0.5 bg-red-500" />
            <span>Hari ini</span>
          </div>
        </div>

        {/* Phase details table */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t">
          {phases.map((phase, index) => {
            const status = getPhaseStatus(phase);
            return (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  status === "active" ? "border-primary bg-primary/5" : "bg-muted/50"
                }`}
              >
                <div className={`flex items-center gap-2 mb-1 ${phase.color}`}>
                  {phase.icon}
                  <span className="text-sm font-medium">{phase.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDateRange(phase.startDate, phase.endDate)}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}