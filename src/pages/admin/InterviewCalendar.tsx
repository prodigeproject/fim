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
}

interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  selection_stage: string;
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

  // Fetch registrations in wawancara stage
  const { data: registrations } = useQuery({
    queryKey: ["registrations-wawancara"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fim_registrations")
        .select("id, full_name, email, phone, selection_stage")
        .eq("selection_stage", "wawancara")
        .is("final_result", null);
      
      if (error) throw error;
      return data as Registration[];
    },
  });

  // Get registration details for a schedule
  const getRegistrationById = (id: string) => {
    return registrations?.find(r => r.id === id);
  };

  // Create schedule
  const createMutation = useMutation({
    mutationFn: async (data: typeof scheduleForm) => {
      const { data: result, error } = await supabase
        .from("interview_schedules")
        .insert([{
          registration_id: data.registration_id,
          scheduled_date: data.scheduled_date,
          scheduled_time: data.scheduled_time,
          duration_minutes: data.duration_minutes,
          location: data.location || null,
          meeting_link: data.meeting_link || null,
          notes: data.notes || null,
        }])
        .select()
        .single();
      
      if (error) throw error;

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
      setIsScheduleDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Gagal membuat jadwal wawancara");
    },
  });

  // Update schedule
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InterviewSchedule> }) => {
      const { error } = await supabase
        .from("interview_schedules")
        .update(data)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Jadwal wawancara berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["interview-schedules"] });
      setIsEditDialogOpen(false);
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

  // Batch create schedules
  const batchCreateMutation = useMutation({
    mutationFn: async (data: typeof batchForm & { registration_ids: string[] }) => {
      const schedules: Array<{
        registration_id: string;
        scheduled_date: string;
        scheduled_time: string;
        duration_minutes: number;
        location: string | null;
        meeting_link: string | null;
        notes: string | null;
      }> = [];

      // Parse start time
      const [startHour, startMin] = data.start_time.split(":").map(Number);
      let currentMinutes = startHour * 60 + startMin;

      // Create schedule for each selected registration
      for (const regId of data.registration_ids) {
        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        const timeStr = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

        schedules.push({
          registration_id: regId,
          scheduled_date: data.scheduled_date,
          scheduled_time: timeStr,
          duration_minutes: data.duration_minutes,
          location: data.location || null,
          meeting_link: data.meeting_link || null,
          notes: data.notes || null,
        });

        currentMinutes += data.interval_minutes;
      }

      const { data: result, error } = await supabase
        .from("interview_schedules")
        .insert(schedules)
        .select();

      if (error) throw error;

      // Send notification emails
      for (const schedule of schedules) {
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
                  onValueChange={(v) => updateMutation.mutate({ id: selectedSchedule.id, data: { status: v } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Terjadwal</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    <SelectItem value="no_show">Tidak Hadir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
