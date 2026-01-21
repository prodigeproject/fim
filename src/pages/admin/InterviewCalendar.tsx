import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Clock,
  MapPin,
  Link as LinkIcon,
  User,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  Send,
  ChevronLeft,
  ChevronRight,
  Bell,
  Users,
  Check,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface InterviewSchedule {
  id: string;
  registration_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  location: string | null;
  meeting_link: string | null;
  notes: string | null;
  status: string;
  reminder_sent: boolean;
  created_at: string;
  interview_feedback: string | null;
  interviewer_name: string | null;
}

interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  selection_stage: string;
  selection_passed?: boolean | null;
}

export default function InterviewCalendar() {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<InterviewSchedule | null>(null);
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [interviewFeedback, setInterviewFeedback] = useState("");
  
  // Dashboard filter state
  const [dashboardPeriod, setDashboardPeriod] = useState<"all" | "week" | "month" | "custom">("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  const [scheduleForm, setScheduleForm] = useState({
    registration_id: "",
    scheduled_date: "",
    scheduled_time: "09:00",
    duration_minutes: 30,
    location: "",
    meeting_link: "",
    notes: "",
  });

  const [batchForm, setBatchForm] = useState({
    scheduled_date: "",
    start_time: "09:00",
    interval_minutes: 45,
    duration_minutes: 30,
    location: "",
    meeting_link: "",
    notes: "",
  });

  // Real-time updates for interview schedules
  useEffect(() => {
    const channel = supabase
      .channel("interview-schedules-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interview_schedules",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["interview-schedules"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch interview schedules
  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["interview-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interview_schedules")
        .select("*")
        .order("scheduled_date", { ascending: true });
      
      if (error) throw error;
      return data as InterviewSchedule[];
    },
  });

  // Fetch registrations eligible for interview (lolos administrasi)
  const { data: registrations } = useQuery({
    queryKey: ["registrations-for-interview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fim_registrations")
        .select("id, full_name, email, phone, selection_stage, selection_passed")
        .or("selection_stage.eq.administrasi,selection_stage.eq.wawancara")
        .is("final_result", null);
      
      if (error) throw error;
      // Filter to only include those who passed administrasi or are in wawancara stage
      return (data as (Registration & { selection_passed: boolean | null })[]).filter(
        r => (r.selection_stage === "administrasi" && r.selection_passed === true) || 
             r.selection_stage === "wawancara"
      );
    },
  });

  // Get registration details for a schedule
  const getRegistrationById = (id: string) => {
    return registrations?.find(r => r.id === id);
  };

  // Get current user profile for interviewer name
  const { data: currentProfile } = useQuery({
    queryKey: ["current-admin-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .eq("id", user.id)
        .single();
      
      if (error) return null;
      return data;
    },
  });

  // Create schedule with interviewer name
  const createMutation = useMutation({
    mutationFn: async (data: typeof scheduleForm) => {
      // Check for existing active schedule (duplicate prevention)
      const { data: existingSchedule } = await supabase
        .from("interview_schedules")
        .select("id, status")
        .eq("registration_id", data.registration_id)
        .in("status", ["scheduled", "completed"])
        .maybeSingle();
      
      if (existingSchedule) {
        throw new Error("Pendaftar ini sudah memiliki jadwal wawancara aktif.");
      }

      // Ensure time is in proper format (HH:MM:SS)
      const formattedTime = data.scheduled_time.includes(":") && data.scheduled_time.split(":").length === 2 
        ? `${data.scheduled_time}:00` 
        : data.scheduled_time;

      const { data: result, error } = await supabase
        .from("interview_schedules")
        .insert([{
          registration_id: data.registration_id,
          scheduled_date: data.scheduled_date,
          scheduled_time: formattedTime,
          duration_minutes: data.duration_minutes,
          location: data.location || null,
          meeting_link: data.meeting_link || null,
          notes: data.notes || null,
          interviewer_name: currentProfile?.full_name || currentProfile?.username || null,
        }])
        .select()
        .single();
      
      if (error) throw error;

      // Update registration to wawancara stage
      await supabase
        .from("fim_registrations")
        .update({
          selection_stage: "wawancara",
          selection_passed: null,
        })
        .eq("id", data.registration_id);

      // Send notification email
      const reg = registrations?.find(r => r.id === data.registration_id);
      if (reg) {
        try {
          await supabase.functions.invoke("notify-selection-stage", {
            body: {
              registrantEmail: reg.email,
              registrantName: reg.full_name,
              stage: "wawancara",
              interviewDate: `${data.scheduled_date} ${data.scheduled_time}`,
              note: data.notes || undefined,
            },
          });
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Jadwal wawancara berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["interview-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["registrations-for-interview"] });
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      setIsScheduleDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat jadwal wawancara");
    },
  });

  // Update schedule with auto-sync to registrant data
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InterviewSchedule> & { interview_feedback?: string } }) => {
      const { error } = await supabase
        .from("interview_schedules")
        .update(data)
        .eq("id", id);
      
      if (error) throw error;

      // Auto-sync status changes to registrant data
      if (data.status) {
        const schedule = schedules?.find(s => s.id === id);
        if (schedule) {
          if (data.status === "completed") {
            // Move to interview stage with "belum_ditentukan" (awaiting recommendation)
            await supabase
              .from("fim_registrations")
              .update({ 
                selection_stage: "wawancara",
                selection_passed: null, // Awaiting recommendation
                interview_note: data.interview_feedback || null
              })
              .eq("id", schedule.registration_id);
          } else if (data.status === "cancelled" || data.status === "no_show") {
            // Mark as tidak lolos wawancara
            await supabase
              .from("fim_registrations")
              .update({ 
                selection_stage: "wawancara",
                selection_passed: false,
                interview_note: data.status === "no_show" ? "Tidak hadir pada jadwal wawancara" : "Wawancara dibatalkan"
              })
              .eq("id", schedule.registration_id);
          }
        }
      }
    },
    onSuccess: () => {
      toast.success("Jadwal wawancara berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["interview-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["all-interview-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["registrations-for-interview"] });
      setIsEditDialogOpen(false);
      setInterviewFeedback("");
    },
    onError: () => {
      toast.error("Gagal memperbarui jadwal");
    },
  });

  // Delete schedule
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("interview_schedules")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Jadwal wawancara berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["interview-schedules"] });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast.error("Gagal menghapus jadwal");
    },
  });

  // Send reminder
  const sendReminderMutation = useMutation({
    mutationFn: async (schedule: InterviewSchedule) => {
      const reg = registrations?.find(r => r.id === schedule.registration_id);
      if (!reg) throw new Error("Registration not found");

      await supabase.functions.invoke("notify-selection-stage", {
        body: {
          registrantEmail: reg.email,
          registrantName: reg.full_name,
          stage: "interview_reminder",
          interviewDate: `${schedule.scheduled_date} ${schedule.scheduled_time}`,
          note: schedule.notes || undefined,
        },
      });

      // Mark as reminder sent
      await supabase
        .from("interview_schedules")
        .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
        .eq("id", schedule.id);
    },
    onSuccess: () => {
      toast.success("Reminder berhasil dikirim");
      queryClient.invalidateQueries({ queryKey: ["interview-schedules"] });
    },
    onError: () => {
      toast.error("Gagal mengirim reminder");
    },
  });

  // Batch create schedules with interviewer name
  const batchCreateMutation = useMutation({
    mutationFn: async (data: typeof batchForm & { registration_ids: string[] }) => {
      const schedulesToCreate: Array<{
        registration_id: string;
        scheduled_date: string;
        scheduled_time: string;
        duration_minutes: number;
        location: string | null;
        meeting_link: string | null;
        notes: string | null;
        interviewer_name: string | null;
      }> = [];

      // Parse start time
      const [startHour, startMin] = data.start_time.split(":").map(Number);
      let currentMinutes = startHour * 60 + startMin;

      // Create schedule for each selected registration
      for (const regId of data.registration_ids) {
        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        const timeStr = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:00`;

        schedulesToCreate.push({
          registration_id: regId,
          scheduled_date: data.scheduled_date,
          scheduled_time: timeStr,
          duration_minutes: data.duration_minutes,
          location: data.location || null,
          meeting_link: data.meeting_link || null,
          notes: data.notes || null,
          interviewer_name: currentProfile?.full_name || currentProfile?.username || null,
        });

        currentMinutes += data.interval_minutes;
      }

      const { data: result, error } = await supabase
        .from("interview_schedules")
        .insert(schedulesToCreate)
        .select();

      if (error) throw error;

      // Update all registrations to wawancara stage
      for (const regId of data.registration_ids) {
        await supabase
          .from("fim_registrations")
          .update({
            selection_stage: "wawancara",
            selection_passed: null,
          })
          .eq("id", regId);
      }

      // Send notification emails
      for (const schedule of schedulesToCreate) {
        const reg = registrations?.find(r => r.id === schedule.registration_id);
        if (reg) {
          try {
            await supabase.functions.invoke("notify-selection-stage", {
              body: {
                registrantEmail: reg.email,
                registrantName: reg.full_name,
                stage: "wawancara",
                interviewDate: `${schedule.scheduled_date} ${schedule.scheduled_time}`,
                note: schedule.notes || undefined,
              },
            });
          } catch (emailError) {
            console.error("Failed to send email:", emailError);
          }
        }
      }

      return result;
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.registration_ids.length} jadwal wawancara berhasil dibuat`);
      queryClient.invalidateQueries({ queryKey: ["interview-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["registrations-for-interview"] });
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      setIsBatchDialogOpen(false);
      setSelectedRegistrations([]);
      setBatchForm({
        scheduled_date: "",
        start_time: "09:00",
        interval_minutes: 45,
        duration_minutes: 30,
        location: "",
        meeting_link: "",
        notes: "",
      });
    },
    onError: () => {
      toast.error("Gagal membuat jadwal wawancara batch");
    },
  });

  const resetForm = () => {
    setScheduleForm({
      registration_id: "",
      scheduled_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      scheduled_time: "09:00",
      duration_minutes: 30,
      location: "",
      meeting_link: "",
      notes: "",
    });
  };

  // Calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Get schedules for a specific date
  const getSchedulesForDate = (date: Date) => {
    return schedules?.filter(s => isSameDay(new Date(s.scheduled_date), date)) || [];
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setScheduleForm(prev => ({ ...prev, scheduled_date: format(date, "yyyy-MM-dd") }));
  };

  const openScheduleDialog = () => {
    if (!selectedDate) {
      toast.error("Pilih tanggal terlebih dahulu");
      return;
    }
    resetForm();
    setIsScheduleDialogOpen(true);
  };

  const openBatchDialog = () => {
    if (selectedRegistrations.length === 0) {
      toast.error("Pilih peserta terlebih dahulu");
      return;
    }
    setBatchForm(prev => ({
      ...prev,
      scheduled_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
    }));
    setIsBatchDialogOpen(true);
  };

  const openEditDialog = (schedule: InterviewSchedule) => {
    setSelectedSchedule(schedule);
    setIsEditDialogOpen(true);
  };

  const toggleRegistrationSelection = (regId: string) => {
    setSelectedRegistrations(prev =>
      prev.includes(regId)
        ? prev.filter(id => id !== regId)
        : [...prev, regId]
    );
  };

  const selectAllRegistrations = () => {
    if (!registrations) return;
    // Filter out registrations that already have a schedule
    const scheduledIds = new Set(schedules?.map(s => s.registration_id) || []);
    const available = registrations.filter(r => !scheduledIds.has(r.id));
    if (selectedRegistrations.length === available.length) {
      setSelectedRegistrations([]);
    } else {
      setSelectedRegistrations(available.map(r => r.id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Terjadwal</Badge>;
      case "completed":
        return <Badge className="bg-green-600">Selesai</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      case "no_show":
        return <Badge variant="secondary">Tidak Hadir</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get registrations that don't have a schedule yet
  const availableRegistrations = useMemo(() => {
    if (!registrations) return [];
    const scheduledIds = new Set(schedules?.map(s => s.registration_id) || []);
    return registrations.filter(r => !scheduledIds.has(r.id));
  }, [registrations, schedules]);

  // Dashboard statistics with period filter
  const dashboardStats = useMemo(() => {
    if (!schedules) return { total: 0, scheduled: 0, completed: 0, cancelled: 0, upcoming: 0 };
    
    let filteredSchedules = [...schedules];
    const now = new Date();
    
    // Apply period filter
    if (dashboardPeriod === "week") {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      filteredSchedules = schedules.filter(s => {
        const d = new Date(s.scheduled_date);
        return d >= weekStart && d < weekEnd;
      });
    } else if (dashboardPeriod === "month") {
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      filteredSchedules = schedules.filter(s => {
        const d = new Date(s.scheduled_date);
        return d >= monthStart && d <= monthEnd;
      });
    } else if (dashboardPeriod === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      filteredSchedules = schedules.filter(s => {
        const d = new Date(s.scheduled_date);
        return d >= start && d <= end;
      });
    }
    
    return {
      total: filteredSchedules.length,
      scheduled: filteredSchedules.filter(s => s.status === "scheduled").length,
      completed: filteredSchedules.filter(s => s.status === "completed").length,
      cancelled: filteredSchedules.filter(s => s.status === "cancelled").length,
      upcoming: filteredSchedules.filter(s => {
        const d = new Date(s.scheduled_date);
        return d >= now && s.status === "scheduled";
      }).length,
    };
  }, [schedules, dashboardPeriod, customStartDate, customEndDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Kalender Wawancara
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola jadwal wawancara peserta FIM
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["interview-schedules"] })}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline"
            onClick={openBatchDialog}
            disabled={selectedRegistrations.length === 0}
          >
            <Users className="h-4 w-4 mr-2" />
            Jadwalkan Batch ({selectedRegistrations.length})
          </Button>
          <Button onClick={openScheduleDialog} disabled={!selectedDate}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Jadwal
          </Button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-lg">Dashboard Wawancara</CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={dashboardPeriod} onValueChange={(v) => setDashboardPeriod(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="week">Minggu Ini</SelectItem>
                  <SelectItem value="month">Bulan Ini</SelectItem>
                  <SelectItem value="custom">Kustom</SelectItem>
                </SelectContent>
              </Select>
              {dashboardPeriod === "custom" && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <span className="self-center">-</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{dashboardStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Jadwal</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="text-2xl font-bold text-blue-600">{dashboardStats.scheduled}</div>
              <div className="text-sm text-blue-600/70">Terjadwal</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950">
              <div className="text-2xl font-bold text-amber-600">{dashboardStats.upcoming}</div>
              <div className="text-sm text-amber-600/70">Akan Datang</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
              <div className="text-2xl font-bold text-green-600">{dashboardStats.completed}</div>
              <div className="text-sm text-green-600/70">Selesai</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950">
              <div className="text-2xl font-bold text-red-600">{dashboardStats.cancelled}</div>
              <div className="text-sm text-red-600/70">Dibatalkan</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registrants in Interview Stage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Peserta Tahap Wawancara
          </CardTitle>
          <CardDescription>
            Daftar peserta yang sudah masuk tahap wawancara dengan status wawancaranya
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px]">
            <div className="space-y-2">
              {registrations?.filter(r => r.selection_stage === "wawancara").length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Belum ada peserta di tahap wawancara</p>
              ) : (
                registrations
                  ?.filter(r => r.selection_stage === "wawancara")
                  .map((reg) => {
                    const schedule = schedules?.find(s => s.registration_id === reg.id);
                    const hasSchedule = !!schedule;
                    const isCompleted = schedule?.status === "completed";
                    const isCancelled = schedule?.status === "cancelled" || schedule?.status === "no_show";
                    
                    return (
                      <div
                        key={reg.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted",
                          isCompleted && "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
                          isCancelled && "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                        )}
                        onClick={() => {
                          if (schedule) {
                            setSelectedSchedule(schedule);
                            setIsEditDialogOpen(true);
                          }
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{reg.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{reg.email}</p>
                          {schedule && (
                            <p className="text-xs text-muted-foreground mt-1">
                              📅 {format(new Date(schedule.scheduled_date), "dd MMM yyyy", { locale: localeId })} {schedule.scheduled_time.substring(0, 5)}
                              {schedule.interviewer_name && ` • ${schedule.interviewer_name}`}
                            </p>
                          )}
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {!hasSchedule ? (
                            <Badge variant="outline" className="border-amber-500 text-amber-700 text-xs">
                              Belum Dijadwal
                            </Badge>
                          ) : isCompleted ? (
                            <Badge className="bg-green-600 text-xs">
                              Selesai
                            </Badge>
                          ) : isCancelled ? (
                            <Badge variant="destructive" className="text-xs">
                              {schedule?.status === "no_show" ? "Tidak Hadir" : "Dibatalkan"}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-blue-500 text-blue-700 text-xs">
                              Terjadwal
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Batch Selection Panel */}
      {availableRegistrations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Peserta Menunggu Jadwal ({availableRegistrations.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllRegistrations}
                >
                  {selectedRegistrations.length === availableRegistrations.length ? (
                    <>Batal Pilih Semua</>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Pilih Semua
                    </>
                  )}
                </Button>
              </div>
            </div>
            <CardDescription>
              Pilih peserta untuk menjadwalkan wawancara secara batch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[180px]">
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {availableRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedRegistrations.includes(reg.id)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    )}
                    onClick={() => toggleRegistrationSelection(reg.id)}
                  >
                    <Checkbox
                      checked={selectedRegistrations.includes(reg.id)}
                      onCheckedChange={() => toggleRegistrationSelection(reg.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{reg.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{reg.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>
                {format(currentMonth, "MMMM yyyy", { locale: localeId })}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date())}>
                  Hari ini
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before first of month */}
              {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {calendarDays.map((day) => {
                const daySchedules = getSchedulesForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "aspect-square p-1 rounded-lg border transition-colors relative",
                      isToday(day) && "border-primary",
                      isSelected && "bg-primary text-primary-foreground",
                      !isSelected && "hover:bg-muted",
                      daySchedules.length > 0 && !isSelected && "bg-blue-50 dark:bg-blue-950"
                    )}
                  >
                    <span className="text-sm font-medium">{format(day, "d")}</span>
                    {daySchedules.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {daySchedules.slice(0, 3).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isSelected ? "bg-primary-foreground" : "bg-primary"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate 
                ? format(selectedDate, "EEEE, dd MMMM yyyy", { locale: localeId })
                : "Pilih Tanggal"
              }
            </CardTitle>
            <CardDescription>
              {selectedDate 
                ? `${getSchedulesForDate(selectedDate).length} jadwal wawancara`
                : "Klik tanggal untuk melihat jadwal"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <ScrollArea className="h-[400px]">
                {isLoadingSchedules ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : getSchedulesForDate(selectedDate).length > 0 ? (
                  <div className="space-y-3">
                    {getSchedulesForDate(selectedDate).map((schedule) => {
                      const reg = getRegistrationById(schedule.registration_id);
                      return (
                        <div
                          key={schedule.id}
                          className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => openEditDialog(schedule)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{schedule.scheduled_time}</span>
                            </div>
                            {getStatusBadge(schedule.status)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{reg?.full_name || "Unknown"}</span>
                            </div>
                            {schedule.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{schedule.location}</span>
                              </div>
                            )}
                            {schedule.meeting_link && (
                              <div className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                <a 
                                  href={schedule.meeting_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Link Meeting
                                </a>
                              </div>
                            )}
                          </div>
                          {schedule.reminder_sent && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              <Bell className="h-3 w-3 mr-1" />
                              Reminder terkirim
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada jadwal wawancara</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={openScheduleDialog}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Jadwal
                    </Button>
                  </div>
                )}
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Pilih tanggal pada kalender</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Jadwal Wawancara</DialogTitle>
            <DialogDescription>
              Buat jadwal wawancara baru untuk peserta FIM
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Peserta</Label>
              <Select
                value={scheduleForm.registration_id}
                onValueChange={(v) => setScheduleForm(prev => ({ ...prev, registration_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih peserta..." />
                </SelectTrigger>
                <SelectContent>
                  {registrations?.map((reg) => (
                    <SelectItem key={reg.id} value={reg.id}>
                      {reg.full_name} ({reg.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={scheduleForm.scheduled_date}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduled_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Waktu</Label>
                <Input
                  type="time"
                  value={scheduleForm.scheduled_time}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduled_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Durasi (menit)</Label>
              <Input
                type="number"
                value={scheduleForm.duration_minutes}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 30 }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Lokasi (opsional)</Label>
              <Input
                value={scheduleForm.location}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Contoh: Ruang Meeting Lt. 2"
              />
            </div>

            <div className="space-y-2">
              <Label>Link Meeting (opsional)</Label>
              <Input
                value={scheduleForm.meeting_link}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, meeting_link: e.target.value }))}
                placeholder="https://meet.google.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Textarea
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan tambahan..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={() => createMutation.mutate(scheduleForm)} 
              disabled={!scheduleForm.registration_id || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Buat Jadwal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Jadwal Wawancara</DialogTitle>
            <DialogDescription>
              {selectedSchedule && getRegistrationById(selectedSchedule.registration_id)?.full_name}
            </DialogDescription>
          </DialogHeader>

          {selectedSchedule && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tanggal</Label>
                  <p className="font-medium">
                    {format(new Date(selectedSchedule.scheduled_date), "EEEE, dd MMMM yyyy", { locale: localeId })}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Waktu</Label>
                  <p className="font-medium">{selectedSchedule.scheduled_time}</p>
                </div>
              </div>

              {selectedSchedule.location && (
                <div>
                  <Label className="text-muted-foreground">Lokasi</Label>
                  <p className="font-medium">{selectedSchedule.location}</p>
                </div>
              )}

              {selectedSchedule.meeting_link && (
                <div>
                  <Label className="text-muted-foreground">Link Meeting</Label>
                  <a 
                    href={selectedSchedule.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline block"
                  >
                    {selectedSchedule.meeting_link}
                  </a>
                </div>
              )}

              {selectedSchedule.notes && (
                <div>
                  <Label className="text-muted-foreground">Catatan</Label>
                  <p>{selectedSchedule.notes}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selectedSchedule.status}
                  onValueChange={(v) => {
                    if (v === "completed" && !interviewFeedback.trim()) {
                      // Require feedback for completed status - handled by button
                      toast.error("Catatan wawancara wajib diisi untuk menandai selesai");
                      return;
                    }
                    if (v === "completed") {
                      updateMutation.mutate({ 
                        id: selectedSchedule.id, 
                        data: { status: v, interview_feedback: interviewFeedback } 
                      });
                    } else {
                      updateMutation.mutate({ id: selectedSchedule.id, data: { status: v } });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Terjadwal</SelectItem>
                    <SelectItem value="completed" disabled={!interviewFeedback.trim()}>Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    <SelectItem value="no_show">Tidak Hadir</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interview Feedback - Required when marking as completed */}
              <div className="space-y-2">
                <Label>
                  Catatan Wawancara {selectedSchedule.status === "scheduled" && <span className="text-destructive">*</span>}
                </Label>
                <Textarea
                  value={interviewFeedback || selectedSchedule.interview_feedback || ""}
                  onChange={(e) => setInterviewFeedback(e.target.value)}
                  placeholder="Catatan hasil wawancara (wajib diisi untuk menandai selesai)..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Catatan ini akan disimpan sebagai feedback interviewer
                </p>
              </div>

              {selectedSchedule.interview_feedback && selectedSchedule.status === "completed" && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <Label className="text-green-700 dark:text-green-300">Feedback Tersimpan</Label>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">{selectedSchedule.interview_feedback}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => selectedSchedule && sendReminderMutation.mutate(selectedSchedule)}
              disabled={sendReminderMutation.isPending || selectedSchedule?.reminder_sent}
            >
              {sendReminderMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {selectedSchedule?.reminder_sent ? "Reminder Terkirim" : "Kirim Reminder"}
            </Button>
            <div className="flex-1" />
            <Button
              variant="destructive"
              onClick={() => selectedSchedule && deleteMutation.mutate(selectedSchedule.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Hapus
            </Button>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Schedule Dialog */}
      <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Jadwalkan Wawancara Batch</DialogTitle>
            <DialogDescription>
              Jadwalkan wawancara untuk {selectedRegistrations.length} peserta sekaligus
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium mb-2">Peserta yang dipilih:</p>
              <div className="flex flex-wrap gap-1">
                {selectedRegistrations.slice(0, 5).map(regId => {
                  const reg = registrations?.find(r => r.id === regId);
                  return (
                    <Badge key={regId} variant="secondary" className="text-xs">
                      {reg?.full_name}
                    </Badge>
                  );
                })}
                {selectedRegistrations.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedRegistrations.length - 5} lainnya
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={batchForm.scheduled_date}
                  onChange={(e) => setBatchForm(prev => ({ ...prev, scheduled_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Waktu Mulai</Label>
                <Input
                  type="time"
                  value={batchForm.start_time}
                  onChange={(e) => setBatchForm(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Durasi per Wawancara (menit)</Label>
                <Input
                  type="number"
                  value={batchForm.duration_minutes}
                  onChange={(e) => setBatchForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 30 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Interval antar Wawancara (menit)</Label>
                <Input
                  type="number"
                  value={batchForm.interval_minutes}
                  onChange={(e) => setBatchForm(prev => ({ ...prev, interval_minutes: parseInt(e.target.value) || 45 }))}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-950">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Preview Jadwal:</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {(() => {
                  if (!batchForm.scheduled_date || !batchForm.start_time) return "Isi tanggal dan waktu mulai";
                  const [startHour, startMin] = batchForm.start_time.split(":").map(Number);
                  let currentMinutes = startHour * 60 + startMin;
                  const lastIndex = selectedRegistrations.length - 1;
                  const endMinutes = currentMinutes + (lastIndex * batchForm.interval_minutes) + batchForm.duration_minutes;
                  const endHours = Math.floor(endMinutes / 60);
                  const endMins = endMinutes % 60;
                  return `${batchForm.start_time} - ${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")} (${selectedRegistrations.length} sesi)`;
                })()}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Lokasi (opsional)</Label>
              <Input
                value={batchForm.location}
                onChange={(e) => setBatchForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Contoh: Ruang Meeting Lt. 2"
              />
            </div>

            <div className="space-y-2">
              <Label>Link Meeting (opsional)</Label>
              <Input
                value={batchForm.meeting_link}
                onChange={(e) => setBatchForm(prev => ({ ...prev, meeting_link: e.target.value }))}
                placeholder="https://meet.google.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Textarea
                value={batchForm.notes}
                onChange={(e) => setBatchForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan untuk semua wawancara..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBatchDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={() => batchCreateMutation.mutate({
                ...batchForm,
                registration_ids: selectedRegistrations,
              })} 
              disabled={!batchForm.scheduled_date || batchCreateMutation.isPending}
            >
              {batchCreateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Jadwalkan {selectedRegistrations.length} Wawancara
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
