import { format, isAfter, isBefore, isWithinInterval, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle, Clock, Circle, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface BatchSettings {
  registration_start_date: string | null;
  registration_end_date: string | null;
  admin_review_start_date: string | null;
  admin_review_end_date: string | null;
  admin_result_announcement_date: string | null;
  interview_start_date: string | null;
  interview_end_date: string | null;
  final_result_announcement_date: string | null;
}

interface BatchTimelineProps {
  batchData: BatchSettings | null;
}

interface TimelineStage {
  id: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  status: "completed" | "active" | "upcoming";
}

export function BatchTimeline({ batchData }: BatchTimelineProps) {
  if (!batchData) return null;

  const now = new Date();

  const getStageStatus = (
    startDate: string | null,
    endDate: string | null
  ): "completed" | "active" | "upcoming" => {
    if (!startDate) return "upcoming";

    const start = parseISO(startDate);
    const end = endDate ? parseISO(endDate) : start;

    if (isAfter(now, end)) return "completed";
    if (isBefore(now, start)) return "upcoming";
    if (
      isWithinInterval(now, { start, end }) ||
      (startDate === endDate && format(now, "yyyy-MM-dd") === format(start, "yyyy-MM-dd"))
    ) {
      return "active";
    }
    return "upcoming";
  };

  const stages: TimelineStage[] = [
    {
      id: "pendaftaran",
      title: "Pendaftaran",
      startDate: batchData.registration_start_date,
      endDate: batchData.registration_end_date,
      status: getStageStatus(
        batchData.registration_start_date,
        batchData.registration_end_date
      ),
    },
    {
      id: "review",
      title: "Seleksi Administrasi",
      startDate: batchData.admin_review_start_date,
      endDate: batchData.admin_review_end_date,
      status: getStageStatus(
        batchData.admin_review_start_date,
        batchData.admin_review_end_date
      ),
    },
    {
      id: "review_result",
      title: "Pengumuman Administrasi",
      startDate: batchData.admin_result_announcement_date,
      endDate: batchData.admin_result_announcement_date,
      status: getStageStatus(
        batchData.admin_result_announcement_date,
        batchData.admin_result_announcement_date
      ),
    },
    {
      id: "interview",
      title: "Wawancara",
      startDate: batchData.interview_start_date,
      endDate: batchData.interview_end_date,
      status: getStageStatus(
        batchData.interview_start_date,
        batchData.interview_end_date
      ),
    },
    {
      id: "final_result",
      title: "Pengumuman Final",
      startDate: batchData.final_result_announcement_date,
      endDate: batchData.final_result_announcement_date,
      status: getStageStatus(
        batchData.final_result_announcement_date,
        batchData.final_result_announcement_date
      ),
    },
  ];

  const formatDateRange = (start: string | null, end: string | null) => {
    if (!start) return "Akan diumumkan";

    const startDate = parseISO(start);
    const formattedStart = format(startDate, "d MMM", { locale: id });

    if (!end || start === end) {
      return format(startDate, "d MMM yyyy", { locale: id });
    }

    const endDate = parseISO(end);
    const formattedEnd = format(endDate, "d MMM yyyy", { locale: id });

    // Same month and year
    if (
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear()
    ) {
      return `${format(startDate, "d", { locale: id })} - ${formattedEnd}`;
    }

    return `${formattedStart} - ${formattedEnd}`;
  };

  const getStatusIcon = (status: TimelineStage["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-supporting" />;
      case "active":
        return <Clock className="h-5 w-5 text-primary animate-pulse" />;
      case "upcoming":
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <CalendarCheck className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Timeline Seleksi
        </h3>
      </div>

      {/* Desktop Timeline */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted" />
          <div
            className="absolute top-6 left-0 h-0.5 bg-primary transition-all duration-500"
            style={{
              width: `${
                (stages.filter((s) => s.status === "completed").length /
                  stages.length) *
                100
              }%`,
            }}
          />

          {/* Timeline items */}
          <div className="relative grid grid-cols-5 gap-4">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all",
                    stage.status === "completed" &&
                      "bg-supporting/20 ring-2 ring-supporting",
                    stage.status === "active" &&
                      "bg-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-card",
                    stage.status === "upcoming" && "bg-muted"
                  )}
                >
                  {getStatusIcon(stage.status)}
                </div>
                <div className="mt-4 text-center">
                  <p
                    className={cn(
                      "font-medium text-sm",
                      stage.status === "active"
                        ? "text-primary"
                        : stage.status === "completed"
                        ? "text-supporting"
                        : "text-muted-foreground"
                    )}
                  >
                    {stage.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDateRange(stage.startDate, stage.endDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Timeline */}
      <div className="md:hidden space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-start gap-4">
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center z-10",
                  stage.status === "completed" &&
                    "bg-supporting/20 ring-2 ring-supporting",
                  stage.status === "active" &&
                    "bg-primary/20 ring-2 ring-primary",
                  stage.status === "upcoming" && "bg-muted"
                )}
              >
                {getStatusIcon(stage.status)}
              </div>
              {index < stages.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-8 mt-2",
                    stage.status === "completed" ? "bg-supporting" : "bg-muted"
                  )}
                />
              )}
            </div>
            <div className="flex-1 pb-4">
              <p
                className={cn(
                  "font-medium",
                  stage.status === "active"
                    ? "text-primary"
                    : stage.status === "completed"
                    ? "text-supporting"
                    : "text-muted-foreground"
                )}
              >
                {stage.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDateRange(stage.startDate, stage.endDate)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
