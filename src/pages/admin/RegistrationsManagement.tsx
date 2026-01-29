import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id as localeId, id } from "date-fns/locale";
import { toast } from "sonner";
import { exportSingleSheet, getExcelFilename } from "@/lib/excelExport";
import { jsPDF } from "jspdf";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { RecruiterAssignment, RecruiterAssignmentBadge } from "@/components/admin/RecruiterAssignment";
import { InterviewerSelector } from "@/components/admin/InterviewerSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  FileSpreadsheet,
  RefreshCw,
  Loader2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Award,
  Heart,
  Target,
  MessageSquare,
  XCircle,
  CheckCircle2,
  History,
  FileText,
  Download,
  CheckSquare,
  Square,
  ArrowUpAZ,
  ArrowDownZA,
  CalendarArrowUp,
  CalendarArrowDown,
  CalendarPlus,
  Send,
  Trash2,
  AlertTriangle,
  Key,
  CalendarCheck,
  Edit,
  ExternalLink,
  Copy,
  MoreHorizontal,
  Ban,
  UserX,
  ListX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Registration {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  registration_status: string;
  auth_user_id: string;
  created_at: string;
  updated_at: string;
  selection_stage: string;
  selection_passed: boolean | null;
  admin_selection_note: string | null;
  note_visible_to_applicant: boolean | null;
  interview_note: string | null;
  interview_date: string | null;
  final_result: string | null;
  email_verified: boolean;
}

interface TrainingData {
  id: string;
  registration_id: string;
  birth_date: string | null;
  birth_place: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  education: string | null;
  institution: string | null;
  major: string | null;
  graduation_year: string | null;
  occupation: string | null;
  organization: string | null;
  organizational_experience: any;
  achievements: any;
  motivation: string | null;
  how_did_you_know: string | null;
  why_join_fim: string | null;
  social_issue_concern: string | null;
  social_contribution_experience: string | null;
  strategic_contribution_plan: string | null;
  impact_expected: string | null;
  completion_percentage: number;
  is_submitted: boolean;
  submitted_at: string | null;
  last_saved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Batch {
  id: string;
  batch_name: string;
  batch_number: number;
  registration_start_date: string | null;
  registration_end_date: string | null;
}

export default function RegistrationsManagement() {
  const queryClient = useQueryClient();
  const { profile } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"name" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [reviewerNote, setReviewerNote] = useState("");
  const [noteVisibleToApplicant, setNoteVisibleToApplicant] = useState(false);
  const [interviewFeedbackNote, setInterviewFeedbackNote] = useState("");
  const [isInterviewCompletedDialogOpen, setIsInterviewCompletedDialogOpen] = useState(false);
  const [scheduleToComplete, setScheduleToComplete] = useState<{ id: string; registrationId: string } | null>(null);
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"approve" | "reject" | null>(null);
  const [bulkNote, setBulkNote] = useState("");
  const [bulkNoteVisible, setBulkNoteVisible] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isBulkStageDialogOpen, setIsBulkStageDialogOpen] = useState(false);
  const [bulkStageDate, setBulkStageDate] = useState("");
  const [bulkStageTime, setBulkStageTime] = useState("");
  const [bulkStageType, setBulkStageType] = useState<"lolos_administrasi" | "wawancara">("lolos_administrasi");
  
  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState<Registration | null>(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  
  // Email preview state
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [emailPreviewData, setEmailPreviewData] = useState<{
    action: "approve" | "reject";
    registration: Registration;
    note: string;
  } | null>(null);

  // Interview scheduling state
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState<{
    registration: Registration | null;
    date: string;
    time: string;
    note: string;
    location: string;
    meetingLink: string;
  }>({ registration: null, date: "", time: "", note: "", location: "", meetingLink: "" });

  // Password reset state
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false);
  const [passwordResetResult, setPasswordResetResult] = useState<{
    email: string;
    full_name: string;
    temporary_password: string;
  } | null>(null);

  // Block registrant state
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockOptions, setBlockOptions] = useState({
    email: true,
    phone: true,
    nik: true,
    fullName: false,
  });
  const [registrationToBlock, setRegistrationToBlock] = useState<Registration | null>(null);

  // Blocked list state
  const [isBlockedListOpen, setIsBlockedListOpen] = useState(false);

  // Fetch batches for filter
  const { data: batches } = useQuery({
    queryKey: ["registration-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registration_settings")
        .select("id, batch_name, batch_number, registration_start_date, registration_end_date")
        .order("batch_number", { ascending: false });
      
      if (error) throw error;
      return data as Batch[];
    },
  });

  // Real-time updates for registrations
  useEffect(() => {
    const channel = supabase
      .channel("registrations-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fim_registrations",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch all registrations with batch filter
  const { data: registrations, isLoading } = useQuery({
    queryKey: ["fim-registrations", searchQuery, statusFilter, stageFilter, batchFilter, sortField, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from("fim_registrations")
        .select("*");

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("registration_status", statusFilter);
      }

      if (stageFilter !== "all") {
        query = query.eq("selection_stage", stageFilter);
      }

      if (batchFilter !== "all") {
        query = query.eq("batch_id", batchFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Sort client-side for flexibility
      const sorted = (data as Registration[]).sort((a, b) => {
        if (sortField === "name") {
          const comparison = a.full_name.localeCompare(b.full_name, 'id');
          return sortOrder === "asc" ? comparison : -comparison;
        } else {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        }
      });
      
      return sorted;
    },
  });

  // Fetch all interview schedules for list view
  const { data: allInterviewSchedules } = useQuery({
    queryKey: ["all-interview-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interview_schedules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Array<{
        id: string;
        registration_id: string;
        scheduled_date: string;
        scheduled_time: string;
        status: string;
        location: string | null;
        meeting_link: string | null;
      }>;
    },
  });

  // Helper to get interview schedule for a registration
  const getInterviewScheduleForRegistration = (registrationId: string) => {
    return allInterviewSchedules?.find(s => s.registration_id === registrationId);
  };

  // Fetch training data for selected registration
  const { data: trainingData, isLoading: isLoadingTraining } = useQuery({
    queryKey: ["training-data", selectedRegistration?.id],
    queryFn: async () => {
      if (!selectedRegistration?.id) return null;
      
      const { data, error } = await supabase
        .from("fim_training_registrations")
        .select("*")
        .eq("registration_id", selectedRegistration.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as TrainingData | null;
    },
    enabled: !!selectedRegistration?.id,
  });

  // Fetch interview schedule for selected registration
  const { data: interviewSchedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ["interview-schedule", selectedRegistration?.id],
    queryFn: async () => {
      if (!selectedRegistration?.id) return null;
      
      const { data, error } = await supabase
        .from("interview_schedules")
        .select("*")
        .eq("registration_id", selectedRegistration.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!selectedRegistration?.id,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, note, email, name }: { id: string; status: string; note?: string; email: string; name: string }) => {
      const { error } = await supabase
        .from("fim_registrations")
        .update({ registration_status: status })
        .eq("id", id);
      if (error) throw error;

      // Send email notification to registrant
      if (status === "approved" || status === "rejected") {
        try {
          const response = await supabase.functions.invoke("notify-registration-status", {
            body: {
              registrantEmail: email,
              registrantName: name,
              status: status,
              reviewerNote: note || undefined,
            },
          });
          
          if (response.error) {
            console.error("Failed to send email notification:", response.error);
          } else {
            console.log("Email notification sent successfully");
          }
        } catch (emailError) {
          console.error("Error sending email notification:", emailError);
        }
      }
    },
    onSuccess: (_, variables) => {
      const statusText = variables.status === "approved" ? "Disetujui" : variables.status === "rejected" ? "Ditolak" : variables.status;
      toast.success(`Status diubah menjadi ${statusText}. Email notifikasi telah dikirim.`);
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      setReviewerNote("");
    },
    onError: () => {
      toast.error("Gagal memperbarui status");
    },
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, status, note }: { ids: string[]; status: string; note: string }) => {
      // Get registration details for email
      const { data: regs } = await supabase
        .from("fim_registrations")
        .select("id, email, full_name")
        .in("id", ids);

      // Update all statuses
      const { error } = await supabase
        .from("fim_registrations")
        .update({ registration_status: status })
        .in("id", ids);
      
      if (error) throw error;

      // Send emails for each registration
      if (regs) {
        for (const reg of regs) {
          try {
            await supabase.functions.invoke("notify-registration-status", {
              body: {
                registrantEmail: reg.email,
                registrantName: reg.full_name,
                status: status,
                reviewerNote: note || undefined,
              },
            });
          } catch (emailError) {
            console.error(`Failed to send email to ${reg.email}:`, emailError);
          }
        }
      }

      return ids.length;
    },
    onSuccess: (count, variables) => {
      const statusText = variables.status === "approved" ? "disetujui" : "ditolak";
      toast.success(`${count} pendaftaran berhasil ${statusText}`);
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      setSelectedIds(new Set());
      setBulkNote("");
      setIsBulkDialogOpen(false);
    },
    onError: () => {
      toast.error("Gagal memperbarui status");
    },
  });

  // Bulk stage update mutation - for bulk "lolos seleksi" which just marks selection_passed = true
  const bulkStageMutation = useMutation({
    mutationFn: async ({ ids, stage, note, passed, noteVisible = false }: { 
      ids: string[]; 
      stage: string; 
      note?: string;
      passed?: boolean;
      noteVisible?: boolean;
    }) => {
      // Get registration details for email
      const { data: regs } = await supabase
        .from("fim_registrations")
        .select("id, email, full_name, selection_stage, selection_passed")
        .in("id", ids);

      if (!regs || regs.length === 0) {
        throw new Error("No registrations found");
      }

      // Group registrations by their current stage for smart bulk update
      const adminStageRegs = regs.filter(r => r.selection_stage === "administrasi" && !r.selection_passed);
      const adminPassedRegs = regs.filter(r => r.selection_stage === "administrasi" && r.selection_passed === true);
      const interviewStageRegs = regs.filter(r => r.selection_stage === "wawancara");

      let totalUpdated = 0;

      // Process based on stage parameter
      if (stage === "lolos_seleksi") {
        // For "lolos_seleksi", mark current stage as passed based on where they are
        for (const reg of regs) {
          const updates: any = {
            updated_at: new Date().toISOString(),
            selection_passed: true,
            note_visible_to_applicant: noteVisible
          };
          if (note) updates.admin_selection_note = note;

          const { error } = await supabase
            .from("fim_registrations")
            .update(updates)
            .eq("id", reg.id);
          
          if (error) throw error;
          totalUpdated++;

          // Send email
          try {
            await supabase.functions.invoke("notify-selection-stage", {
              body: {
                email: reg.email,
                name: reg.full_name,
                stage: `lolos_${reg.selection_stage}`,
                passed: true,
                note: note || undefined,
              },
            });
          } catch (emailError) {
            console.error(`Failed to send email to ${reg.email}:`, emailError);
          }
        }
      } else if (stage === "tidak_lolos") {
        // For "tidak_lolos", mark as failed
        for (const reg of regs) {
          const updates: any = {
            updated_at: new Date().toISOString(),
            selection_passed: false,
            final_result: "tidak_lolos",
            selection_stage: "pengumuman",
            note_visible_to_applicant: noteVisible
          };
          if (note) updates.admin_selection_note = note;

          const { error } = await supabase
            .from("fim_registrations")
            .update(updates)
            .eq("id", reg.id);
          
          if (error) throw error;
          totalUpdated++;

          // Send email
          try {
            await supabase.functions.invoke("notify-selection-stage", {
              body: {
                email: reg.email,
                name: reg.full_name,
                stage: `tidak_lolos_${reg.selection_stage}`,
                passed: false,
                note: note || undefined,
              },
            });
          } catch (emailError) {
            console.error(`Failed to send email to ${reg.email}:`, emailError);
          }
        }
      }

      return totalUpdated;
    },
    onSuccess: (count, variables) => {
      const stageText = variables.stage === "lolos_seleksi" 
        ? "ditandai Lolos Seleksi" 
        : variables.stage === "tidak_lolos" 
        ? "ditandai Tidak Lolos" 
        : `dipindahkan ke tahap ${variables.stage}`;
      toast.success(`${count} pendaftaran berhasil ${stageText}`);
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      setSelectedIds(new Set());
      setBulkNote("");
      setIsBulkStageDialogOpen(false);
      setBulkStageDate("");
      setBulkStageTime("");
    },
    onError: (error: any) => {
      toast.error(`Gagal memperbarui: ${error.message || "Unknown error"}`);
    },
  });

  // Delete registration mutation - uses edge function to also delete auth user
  const deleteRegistrationMutation = useMutation({
    mutationFn: async (registration: Registration) => {
      // Call edge function to delete auth user and all related data
      const { data, error } = await supabase.functions.invoke("delete-registrant-auth-user", {
        body: {
          auth_user_id: registration.auth_user_id,
          registration_id: registration.id,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return registration;
    },
    onSuccess: (reg) => {
      toast.success(`Data pendaftar ${reg.full_name} berhasil dihapus. Email dapat digunakan untuk pendaftaran baru.`);
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      setIsDeleteDialogOpen(false);
      setRegistrationToDelete(null);
      setIsDetailOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus data: ${error.message}`);
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        // Delete training data first
        await supabase
          .from("fim_training_registrations")
          .delete()
          .eq("registration_id", id);
        
        // Delete interview schedules
        await supabase
          .from("interview_schedules")
          .delete()
          .eq("registration_id", id);
        
        // Delete registration
        const { error } = await supabase
          .from("fim_registrations")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
      }
      return ids.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} data pendaftar berhasil dihapus`);
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      setSelectedIds(new Set());
      setIsBulkDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus data: ${error.message}`);
    },
  });

  // Mark interview as completed mutation with feedback sync and email notification
  const markInterviewCompletedMutation = useMutation({
    mutationFn: async ({ scheduleId, registrationId, feedback }: { scheduleId: string; registrationId: string; feedback: string }) => {
      // Get registration info for email
      const { data: regData } = await supabase
        .from("fim_registrations")
        .select("email, full_name")
        .eq("id", registrationId)
        .single();
      
      // Get interview schedule info
      const { data: schedData } = await supabase
        .from("interview_schedules")
        .select("scheduled_date, scheduled_time, interviewer_name")
        .eq("id", scheduleId)
        .single();
      
      // Update interview schedule with feedback
      const { error: scheduleError } = await supabase
        .from("interview_schedules")
        .update({ status: "completed", interview_feedback: feedback })
        .eq("id", scheduleId);
      
      if (scheduleError) throw scheduleError;

      // Sync to registrant - move to wawancara stage with "belum_ditentukan" status
      const { error: regError } = await supabase
        .from("fim_registrations")
        .update({ 
          selection_stage: "wawancara",
          selection_passed: null, // Awaiting recommendation
          interview_note: feedback
        })
        .eq("id", registrationId);
      
      if (regError) throw regError;

      // Send email notification
      if (regData) {
        try {
          const formattedDate = schedData?.scheduled_date 
            ? new Date(schedData.scheduled_date).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
            : undefined;
          
          await supabase.functions.invoke("notify-interview-completed", {
            body: {
              registrantEmail: regData.email,
              registrantName: regData.full_name,
              interviewDate: formattedDate,
              interviewerName: schedData?.interviewer_name,
            },
          });
        } catch (emailError) {
          console.error("Failed to send interview completed notification:", emailError);
        }
      }
      
      return scheduleId;
    },
    onSuccess: () => {
      toast.success("Wawancara ditandai selesai dan notifikasi email dikirim");
      queryClient.invalidateQueries({ queryKey: ["interview-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["interview-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["all-interview-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      setIsInterviewCompletedDialogOpen(false);
      setScheduleToComplete(null);
      setInterviewFeedbackNote("");
    },
    onError: (error: any) => {
      toast.error(`Gagal memperbarui status: ${error.message}`);
    },
  });

  // Update interview status mutation (for No Show/Cancelled)
  const updateInterviewStatusMutation = useMutation({
    mutationFn: async ({ scheduleId, registrationId, status }: { scheduleId: string; registrationId: string; status: "no_show" | "cancelled" }) => {
      // Update interview schedule status
      const { error: scheduleError } = await supabase
        .from("interview_schedules")
        .update({ status })
        .eq("id", scheduleId);
      
      if (scheduleError) throw scheduleError;

      // Mark registrant as failed wawancara
      const { error: regError } = await supabase
        .from("fim_registrations")
        .update({ 
          selection_stage: "wawancara",
          selection_passed: false,
          final_result: "tidak_lolos",
          admin_selection_note: status === "no_show" ? "Tidak hadir saat wawancara" : "Wawancara dibatalkan"
        })
        .eq("id", registrationId);
      
      if (regError) throw regError;
      
      return { scheduleId, status };
    },
    onSuccess: (result) => {
      const statusText = result.status === "no_show" ? "Tidak Hadir" : "Dibatalkan";
      toast.success(`Status wawancara diubah menjadi ${statusText}`);
      queryClient.invalidateQueries({ queryKey: ["interview-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["interview-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["all-interview-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
    },
    onError: (error: any) => {
      toast.error(`Gagal memperbarui status: ${error.message}`);
    },
  });

  // Block registration mutation
  const blockRegistrationMutation = useMutation({
    mutationFn: async ({ registration, reason, options }: { 
      registration: Registration; 
      reason: string;
      options: { email: boolean; phone: boolean; nik: boolean; fullName: boolean }
    }) => {
      // Get training data for NIK
      const { data: trainingDataRaw } = await supabase
        .from("fim_training_registrations")
        .select("nik")
        .eq("registration_id", registration.id)
        .maybeSingle();

      // Build the blocked_registrations insert data - email is required
      const blockedData: {
        email: string;
        blocked_reason?: string;
        phone?: string;
        nik?: string;
        full_name?: string;
        blocked_by?: string;
      } = {
        email: registration.email, // Email is always required
        blocked_reason: reason || "Diblokir oleh admin",
      };
      
      if (options.phone && registration.phone) {
        blockedData.phone = registration.phone;
      }
      if (options.nik && (trainingDataRaw as any)?.nik) {
        blockedData.nik = (trainingDataRaw as any).nik;
      }
      if (options.fullName && registration.full_name) {
        blockedData.full_name = registration.full_name;
      }
      
      // Only include blocked_by if profile exists
      if (profile?.id) {
        blockedData.blocked_by = profile.id;
      }

      // Insert into blocked_registrations
      const { error: blockError } = await supabase
        .from("blocked_registrations")
        .insert([blockedData]);
      
      if (blockError) {
        console.error("Block insert error:", blockError);
        throw new Error(`Gagal menambah ke daftar blokir: ${blockError.message}`);
      }

      // Delete training data first
      const { error: trainingDeleteError } = await supabase
        .from("fim_training_registrations")
        .delete()
        .eq("registration_id", registration.id);
      
      if (trainingDeleteError) {
        console.error("Training delete error:", trainingDeleteError);
      }
      
      // Delete interview schedules
      const { error: scheduleDeleteError } = await supabase
        .from("interview_schedules")
        .delete()
        .eq("registration_id", registration.id);
      
      if (scheduleDeleteError) {
        console.error("Schedule delete error:", scheduleDeleteError);
      }
      
      // Delete registration
      const { error: deleteError } = await supabase
        .from("fim_registrations")
        .delete()
        .eq("id", registration.id);
      
      if (deleteError) {
        console.error("Registration delete error:", deleteError);
        throw new Error(`Gagal menghapus pendaftaran: ${deleteError.message}`);
      }
      
      return registration;
    },
    onSuccess: (reg) => {
      toast.success(`${reg.full_name} telah diblokir dan dihapus dari sistem`);
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["blocked-registrations"] });
      setIsBlockDialogOpen(false);
      setRegistrationToBlock(null);
      setBlockReason("");
      setBlockOptions({ email: true, phone: true, nik: true, fullName: false });
      setIsDetailOpen(false);
    },
    onError: (error: any) => {
      console.error("Block mutation error:", error);
      toast.error(error.message || "Gagal memblokir");
    },
  });

  // Fetch blocked registrations
  const { data: blockedRegistrations } = useQuery({
    queryKey: ["blocked-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_registrations")
        .select("*")
        .order("blocked_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Unblock registration mutation
  const unblockMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blocked_registrations")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success("Data telah dihapus dari daftar blokir");
      queryClient.invalidateQueries({ queryKey: ["blocked-registrations"] });
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus blokir: ${error.message}`);
    },
  });

  // Manual email verification mutation
  const manualVerifyMutation = useMutation({
    mutationFn: async ({ id, email, name }: { id: string; email: string; name: string }) => {
      const { error } = await supabase
        .from("fim_registrations")
        .update({ 
          email_verified: true,
          email_verified_at: new Date().toISOString()
        })
        .eq("id", id);
      
      if (error) throw error;

      // Log this action
      await supabase.from("registration_activity_logs").insert({
        registration_id: id,
        user_id: profile?.id,
        action: "manual_verify",
        details: { email, name, verified_by: profile?.username || profile?.full_name },
      });

      return { id, email, name };
    },
    onSuccess: (data) => {
      toast.success(`Email ${data.email} berhasil diverifikasi secara manual`);
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      // Update selected registration if open
      if (selectedRegistration && selectedRegistration.id === data.id) {
        setSelectedRegistration(prev => prev ? { ...prev, email_verified: true } : null);
      }
    },
    onError: (error: any) => {
      toast.error(`Gagal memverifikasi: ${error.message}`);
    },
  });

  // Fetch activity logs for selected registration
  const { data: activityLogs } = useQuery({
    queryKey: ["activity-logs", selectedRegistration?.id],
    queryFn: async () => {
      if (!selectedRegistration?.id) return [];
      
      const { data, error } = await supabase
        .from("registration_activity_logs")
        .select("*")
        .eq("registration_id", selectedRegistration.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedRegistration?.id,
  });

  // Export to Excel with interview feedback and recommendation data
  const handleExport = async () => {
    try {
      const { data: allRegs, error: regsError } = await supabase
        .from("fim_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (regsError) throw regsError;

      const { data: allTraining, error: trainingError } = await supabase
        .from("fim_training_registrations")
        .select("*");

      if (trainingError) throw trainingError;

      const { data: allInterviews, error: interviewError } = await supabase
        .from("interview_schedules")
        .select("*");

      if (interviewError) throw interviewError;

      const getDurationLabel = (duration: string) => {
        const labels: Record<string, string> = {
          'kurang_1_tahun': 'Kurang dari 1 tahun',
          '1_2_tahun': '1-2 tahun',
          '2_3_tahun': '2-3 tahun',
          '3_5_tahun': '3-5 tahun',
          'lebih_5_tahun': 'Lebih dari 5 tahun',
        };
        return labels[duration] || duration || '-';
      };

      const exportData = allRegs?.map(reg => {
        const training = allTraining?.find(t => t.registration_id === reg.id);
        const interview = allInterviews?.find(i => i.registration_id === reg.id);
        return {
          "Nama Lengkap": reg.full_name,
          "Email": reg.email,
          "No. Telepon": reg.phone || "-",
          "NIK": (training as any)?.nik || "-",
          "Status": reg.registration_status,
          "Tahap Seleksi": reg.selection_stage,
          "Hasil Seleksi": reg.selection_passed === true ? "Lolos" : reg.selection_passed === false ? "Tidak Lolos" : "Belum Ditentukan",
          "Hasil Akhir": reg.final_result === "lolos" ? "Diterima" : reg.final_result === "tidak_lolos" ? "Tidak Diterima" : "-",
          "Tanggal Daftar": format(new Date(reg.created_at), "dd/MM/yyyy HH:mm"),
          "Progress (%)": training?.completion_percentage || 0,
          "Sudah Submit": training?.is_submitted ? "Ya" : "Belum",
          "Tanggal Submit": training?.submitted_at ? format(new Date(training.submitted_at), "dd/MM/yyyy HH:mm") : "-",
          "Tempat Lahir": training?.birth_place || "-",
          "Tanggal Lahir": training?.birth_date || "-",
          "Gender": training?.gender === "male" ? "Laki-laki" : training?.gender === "female" ? "Perempuan" : "-",
          "Kota": training?.city || "-",
          "Provinsi": training?.province || "-",
          "Pendidikan": training?.education || "-",
          "Institusi": training?.institution || "-",
          "Jurusan": training?.major || "-",
          "Pekerjaan": training?.occupation || "-",
          "Motivasi": training?.motivation || "-",
          "Alasan Gabung FIM": training?.why_join_fim || "-",
          "Kepedulian Sosial": training?.social_issue_concern || "-",
          "Pengalaman Kontribusi": training?.social_contribution_experience || "-",
          "Rencana Kontribusi": training?.strategic_contribution_plan || "-",
          "Dampak yang Diharapkan": training?.impact_expected || "-",
          // Recommendation data
          "Nama Pemberi Rekomendasi": (training as any)?.recommender_name || "-",
          "Jabatan Pemberi Rekomendasi": (training as any)?.recommender_position || "-",
          "Lama Kenal Pemberi Rekomendasi": getDurationLabel((training as any)?.recommender_duration),
          "File Surat Rekomendasi": (training as any)?.recommendation_file_url || "-",
          // Interview data
          "Tanggal Wawancara": interview?.scheduled_date ? format(new Date(interview.scheduled_date), "dd/MM/yyyy") : "-",
          "Waktu Wawancara": interview?.scheduled_time || "-",
          "Lokasi Wawancara": interview?.location || "-",
          "Status Wawancara": interview?.status === "completed" ? "Selesai" : interview?.status === "scheduled" ? "Terjadwal" : interview?.status === "cancelled" ? "Dibatalkan" : interview?.status === "no_show" ? "Tidak Hadir" : "-",
          "Pewawancara": (interview as any)?.interviewer_name || "-",
          "Catatan Wawancara": interview?.interview_feedback || "-",
          "Catatan Admin": reg.admin_selection_note || "-",
        };
      }) || [];

      await exportSingleSheet(exportData, "Registrations", getExcelFilename("FIM-Registrations"));
      
      toast.success("Data berhasil diexport");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengexport data");
    }
  };

  // Get status badge based on registration status and training submission
  const getStatusBadge = (registration: Registration, training?: TrainingData | null) => {
    const isSubmitted = training?.is_submitted;
    const stage = registration.selection_stage;
    const passed = registration.selection_passed;
    const finalResult = registration.final_result;
    
    // If final result exists, show that
    if (finalResult === "lolos") {
      return <Badge className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" />Diterima</Badge>;
    }
    if (finalResult === "tidak_lolos") {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Tidak Diterima</Badge>;
    }
    
    // For administrasi stage
    if (stage === "administrasi") {
      if (passed === true) {
        return <Badge className="gap-1 bg-emerald-600"><CheckCircle2 className="h-3 w-3" />Lolos</Badge>;
      }
      if (passed === false) {
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Tidak Lolos</Badge>;
      }
      // Not yet reviewed - check submission status
      if (!isSubmitted) {
        return <Badge variant="secondary" className="gap-1"><AlertCircle className="h-3 w-3" />Belum Selesai</Badge>;
      }
      // Submitted but not yet reviewed - show "Selesai Submit" 
      return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Selesai Submit</Badge>;
    }
    
    // For wawancara stage
    if (stage === "wawancara") {
      if (passed === true) {
        return <Badge className="gap-1 bg-emerald-600"><CheckCircle2 className="h-3 w-3" />Lolos</Badge>;
      }
      if (passed === false) {
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Tidak Lolos</Badge>;
      }
      // Not yet determined - return null, we'll use getInterviewStatusBadge
      return null;
    }
    
    // Default
    return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Menunggu</Badge>;
  };

  // Get interview status badge for wawancara stage
  const getInterviewStatusBadge = (registration: Registration, interviewSched?: any) => {
    if (registration.selection_stage !== "wawancara") return null;
    if (registration.selection_passed !== null) return null; // Already has result
    
    if (!interviewSched) {
      return <Badge variant="outline" className="gap-1 border-amber-500 text-amber-700"><Clock className="h-3 w-3" />Belum Wawancara</Badge>;
    }
    
    if (interviewSched.status === "completed") {
      return <Badge variant="outline" className="gap-1 border-purple-500 text-purple-700"><CheckCircle className="h-3 w-3" />Belum Ditentukan</Badge>;
    }
    
    // Scheduled but not completed
    return <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700"><CalendarCheck className="h-3 w-3" />Terjadwal</Badge>;
  };

  const getStageBadge = (stage: string, selectionPassed?: boolean | null) => {
    switch (stage) {
      case "administrasi":
        return <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700"><FileText className="h-3 w-3" />Administrasi</Badge>;
      case "wawancara":
        return <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700"><MessageSquare className="h-3 w-3" />Wawancara</Badge>;
      case "pengumuman":
        return <Badge variant="outline" className="gap-1 border-green-500 text-green-700"><CheckCircle2 className="h-3 w-3" />Pengumuman</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />-</Badge>;
    }
  };

  const stats = {
    total: registrations?.length || 0,
    pending: registrations?.filter(r => r.registration_status === "pending").length || 0,
    completed: registrations?.filter(r => r.registration_status === "completed").length || 0,
    approved: registrations?.filter(r => r.registration_status === "approved").length || 0,
    rejected: registrations?.filter(r => r.registration_status === "rejected").length || 0,
    stageAdministrasi: registrations?.filter(r => r.selection_stage === "administrasi").length || 0,
    stageWawancara: registrations?.filter(r => r.selection_stage === "wawancara").length || 0,
    stagePengumuman: registrations?.filter(r => r.selection_stage === "pengumuman").length || 0,
  };

  // Selection stage mutation with email notification
  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage, note, interviewDate, email, name, sendEmail = true, passed, noteVisible = false }: { 
      id: string; 
      stage: string; 
      note?: string; 
      interviewDate?: string;
      email: string;
      name: string;
      sendEmail?: boolean;
      passed?: boolean; // Track if user passed current stage
      noteVisible?: boolean; // Whether note is visible to applicant
    }) => {
      const updates: any = { 
        updated_at: new Date().toISOString()
      };
      
      // Map logical stage names to valid database values
      // Database constraint only allows: 'administrasi', 'wawancara', 'pengumuman'
      if (stage === "lolos_administrasi") {
        // User passed administrasi, still at administrasi stage but marked as passed
        updates.selection_stage = "administrasi";
        updates.selection_passed = true;
        if (note) updates.admin_selection_note = note;
        updates.note_visible_to_applicant = noteVisible;
      } else if (stage === "wawancara") {
        updates.selection_stage = "wawancara";
        updates.selection_passed = null; // Reset for new stage
        if (note) updates.admin_selection_note = note;
        if (interviewDate) updates.interview_date = interviewDate;
        updates.note_visible_to_applicant = noteVisible;
      } else if (stage === "pengumuman") {
        updates.selection_stage = "pengumuman";
        if (note) updates.interview_note = note;
        updates.note_visible_to_applicant = noteVisible;
      } else {
        updates.selection_stage = stage;
        if (note) updates.admin_selection_note = note;
        updates.note_visible_to_applicant = noteVisible;
      }

      console.log("Updating stage:", { id, stage, updates });

      const { data, error } = await supabase
        .from("fim_registrations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("Database error updating stage:", error);
        throw new Error(error.message || "Database error");
      }

      console.log("Stage updated successfully:", data);

      // Send email notification for stage change
      if (sendEmail) {
        try {
          await supabase.functions.invoke("notify-selection-stage", {
            body: {
              registrantEmail: email,
              registrantName: name,
              stage: stage,
              interviewDate: interviewDate || undefined,
              note: note || undefined,
            },
          });
        } catch (emailError) {
          console.error("Failed to send stage notification email:", emailError);
        }
      }

      return data;
    },
    onSuccess: (_, variables) => {
      const stageLabels: Record<string, string> = {
        administrasi: "Administrasi",
        lolos_administrasi: "Lolos Administrasi",
        wawancara: "Wawancara",
        pengumuman: "Pengumuman"
      };
      const stageText = stageLabels[variables.stage] || variables.stage;
      toast.success(`Tahap seleksi berhasil diubah ke ${stageText}`);
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      setReviewerNote("");
      setIsScheduleDialogOpen(false);
      // Update selected registration state with correct stage value
      if (selectedRegistration?.id === variables.id) {
        const actualStage = variables.stage === "lolos_administrasi" ? "administrasi" : variables.stage;
        setSelectedRegistration(prev => prev ? { ...prev, selection_stage: actualStage } : null);
      }
    },
    onError: (error: any) => {
      console.error("Stage mutation error:", error);
      toast.error(`Gagal memperbarui tahap seleksi: ${error.message || "Unknown error"}`);
    },
  });

  // Revert status mutation - for human error correction
  const revertStatusMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { data, error } = await supabase
        .from("fim_registrations")
        .update({
          selection_stage: stage,
          final_result: null,
          selection_passed: null,
          registration_status: "pending",
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Status berhasil dikembalikan ke tahap sebelumnya");
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
    },
    onError: (error: any) => {
      toast.error(`Gagal mengembalikan status: ${error.message}`);
    },
  });

  // Final result mutation - fixed with proper error handling
  const updateFinalResultMutation = useMutation({
    mutationFn: async ({ id, result, note, email, name }: { 
      id: string; 
      result: "lolos" | "tidak_lolos"; 
      note?: string;
      email?: string;
      name?: string;
    }) => {
      console.log("Updating final result:", { id, result, note });
      
      // Build update object step by step to avoid any issues
      const updateData: Record<string, any> = {
        final_result: result,
        selection_stage: "pengumuman",
        registration_status: result === "lolos" ? "approved" : "rejected",
        updated_at: new Date().toISOString()
      };
      
      // Only add interview_note if there's a note
      if (note && note.trim()) {
        updateData.interview_note = note.trim();
      }

      const { data, error } = await supabase
        .from("fim_registrations")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("Database error updating final result:", error);
        throw new Error(error.message || "Database error");
      }

      console.log("Final result updated successfully:", data);

      // Send email notification for final result
      if (email && name) {
        try {
          const emailResponse = await supabase.functions.invoke("notify-selection-stage", {
            body: {
              registrantEmail: email,
              registrantName: name,
              stage: "pengumuman",
              finalResult: result,
              note: note || undefined,
            },
          });
          
          if (emailResponse.error) {
            console.error("Email notification error:", emailResponse.error);
          } else {
            console.log("Email notification sent successfully");
          }
        } catch (emailError) {
          console.error("Failed to send final result notification:", emailError);
          // Don't throw - email failure shouldn't fail the whole operation
        }
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      const resultText = variables.result === "lolos" ? "Lolos (Diterima)" : "Tidak Lolos";
      toast.success(`Hasil akhir berhasil diperbarui: ${resultText}`);
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      setReviewerNote("");
      setIsDetailOpen(false);
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast.error(`Gagal memperbarui hasil akhir: ${error.message || "Unknown error"}`);
    },
  });

  // Password reset mutation for registrants
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ registrationId }: { registrationId: string }) => {
      const { data, error } = await supabase.functions.invoke("reset-registrant-password", {
        body: { registration_id: registrationId },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data as { 
        success: boolean; 
        email: string; 
        full_name: string; 
        temporary_password: string; 
      };
    },
    onSuccess: (data) => {
      setPasswordResetResult({
        email: data.email,
        full_name: data.full_name,
        temporary_password: data.temporary_password,
      });
      setIsPasswordResetDialogOpen(true);
    },
    onError: (error: any) => {
      toast.error(`Gagal reset password: ${error.message || "Unknown error"}`);
    },
  });

  // Create interview schedule mutation with duplicate check and interviewer name
  const createInterviewScheduleMutation = useMutation({
    mutationFn: async ({ 
      registrationId, 
      date, 
      time, 
      note, 
      location, 
      meetingLink,
      interviewerName
    }: { 
      registrationId: string; 
      date: string; 
      time: string; 
      note?: string;
      location?: string;
      meetingLink?: string;
      interviewerName?: string;
    }) => {
      // Validate that scheduled date is not in the past
      const scheduledDateTime = new Date(`${date}T${time}`);
      const now = new Date();
      if (scheduledDateTime < now) {
        throw new Error("Tanggal dan waktu wawancara tidak boleh di masa lalu.");
      }

      // Check for existing active schedule (duplicate prevention)
      const { data: existingSchedule } = await supabase
        .from("interview_schedules")
        .select("id, status")
        .eq("registration_id", registrationId)
        .in("status", ["scheduled", "completed"])
        .maybeSingle();
      
      if (existingSchedule) {
        throw new Error("Pendaftar ini sudah memiliki jadwal wawancara aktif. Batalkan jadwal yang ada terlebih dahulu jika ingin menjadwalkan ulang.");
      }
      
      // Create the interview schedule entry - scheduled_date is type 'date' (YYYY-MM-DD), scheduled_time is type 'time' (HH:MM:SS or HH:MM)
      // Ensure time is in proper format
      const formattedTime = time.includes(":") && time.split(":").length === 2 ? `${time}:00` : time;
      
      const { data: scheduleData, error: scheduleError } = await supabase
        .from("interview_schedules")
        .insert({
          registration_id: registrationId,
          scheduled_date: date, // YYYY-MM-DD format
          scheduled_time: formattedTime, // HH:MM:SS format  
          notes: note || null,
          location: location || null,
          meeting_link: meetingLink || null,
          status: "scheduled",
          interviewer_name: interviewerName || null,
        })
        .select()
        .single();
      
      if (scheduleError) throw scheduleError;
      
      // Also update the registration to move to wawancara stage with "belum_wawancara" status if not already
      const { error: regError } = await supabase
        .from("fim_registrations")
        .update({
          selection_stage: "wawancara",
          selection_passed: null, // Belum ditentukan
        })
        .eq("id", registrationId);
      
      if (regError) {
        console.error("Failed to update registration stage:", regError);
      }
      
      return scheduleData;
    },
    onSuccess: () => {
      toast.success("Jadwal wawancara berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["interview-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["interview-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["all-interview-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      setIsScheduleDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Failed to create interview schedule:", error);
      toast.error(error.message || "Gagal membuat jadwal wawancara");
    },
  });

  // Email preview helper
  const generateEmailPreview = (action: "approve" | "reject", name: string, note: string) => {
    if (action === "approve") {
      return {
        subject: "Selamat! Pendaftaran FIM Anda Disetujui",
        body: `
Halo ${name},

Selamat! Pendaftaran Anda di Forum Indonesia Muda telah DISETUJUI.

${note ? `Catatan dari reviewer:\n${note}\n\n` : ""}Tim kami akan segera menghubungi Anda untuk langkah selanjutnya.

Terima kasih atas antusiasme Anda untuk bergabung dengan Forum Indonesia Muda!

Salam hangat,
Tim Forum Indonesia Muda
        `.trim()
      };
    } else {
      return {
        subject: "Informasi Pendaftaran FIM",
        body: `
Halo ${name},

Terima kasih atas minat Anda untuk bergabung dengan Forum Indonesia Muda.

Setelah kami tinjau, dengan berat hati kami informasikan bahwa pendaftaran Anda belum dapat kami terima saat ini.

${note ? `Catatan dari reviewer:\n${note}\n\n` : ""}Jangan berkecil hati, Anda dapat mencoba mendaftar kembali di periode selanjutnya.

Salam hangat,
Tim Forum Indonesia Muda
        `.trim()
      };
    }
  };

  const handleApproveWithPreview = () => {
    if (selectedRegistration) {
      setEmailPreviewData({
        action: "approve",
        registration: selectedRegistration,
        note: reviewerNote,
      });
      setIsEmailPreviewOpen(true);
    }
  };

  const handleRejectWithPreview = () => {
    if (!reviewerNote.trim()) {
      toast.error("Mohon isi catatan alasan penolakan");
      return;
    }
    if (selectedRegistration) {
      setEmailPreviewData({
        action: "reject",
        registration: selectedRegistration,
        note: reviewerNote,
      });
      setIsEmailPreviewOpen(true);
    }
  };

  const confirmSendEmail = () => {
    if (!emailPreviewData) return;
    
    updateStatusMutation.mutate({
      id: emailPreviewData.registration.id,
      status: emailPreviewData.action === "approve" ? "approved" : "rejected",
      note: emailPreviewData.note,
      email: emailPreviewData.registration.email,
      name: emailPreviewData.registration.full_name,
    });
    
    setSelectedRegistration(prev => prev ? { ...prev, registration_status: emailPreviewData.action === "approve" ? "approved" : "rejected" } : null);
    setIsEmailPreviewOpen(false);
    setEmailPreviewData(null);
  };

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (!registrations) return;
    
    const eligibleRegs = registrations.filter(r => 
      r.registration_status !== "approved" && r.registration_status !== "rejected"
    );
    
    if (selectedIds.size === eligibleRegs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eligibleRegs.map(r => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const openBulkDialog = (action: "approve" | "reject") => {
    if (selectedIds.size === 0) {
      toast.error("Pilih minimal satu pendaftaran");
      return;
    }
    setBulkAction(action);
    setIsBulkDialogOpen(true);
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedIds.size === 0) return;
    
    if (bulkAction === "reject" && !bulkNote.trim()) {
      toast.error("Mohon isi catatan alasan penolakan");
      return;
    }

    bulkUpdateMutation.mutate({
      ids: Array.from(selectedIds),
      status: bulkAction === "approve" ? "approved" : "rejected",
      note: bulkNote,
    });
  };

  // Export individual PDF
  const handleExportPDF = () => {
    if (!selectedRegistration || !trainingData) {
      toast.error("Data pendaftar tidak lengkap");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    const lineHeight = 7;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Helper functions
    const addSection = (title: string) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 64, 175);
      doc.text(title, margin, yPos);
      yPos += lineHeight;
      doc.setTextColor(0, 0, 0);
    };

    const addField = (label: string, value: string | null | undefined) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(label + ":", margin, yPos);
      doc.setFont("helvetica", "normal");
      const textValue = value || "-";
      const splitText = doc.splitTextToSize(textValue, contentWidth - 50);
      doc.text(splitText, margin + 50, yPos);
      yPos += lineHeight * Math.max(1, splitText.length);
    };

    const addLongText = (label: string, value: string | null | undefined) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(label + ":", margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      const textValue = value || "-";
      const splitText = doc.splitTextToSize(textValue, contentWidth);
      
      splitText.forEach((line: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += lineHeight * 0.8;
      });
      yPos += lineHeight * 0.5;
    };

    // Header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FORMULIR PENDAFTARAN FIM", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Forum Indonesia Muda", pageWidth / 2, 30, { align: "center" });
    doc.setTextColor(0, 0, 0);
    yPos = 55;

    // Status
    const statusText = selectedRegistration.registration_status === "approved" ? "DISETUJUI" 
      : selectedRegistration.registration_status === "rejected" ? "DITOLAK" 
      : selectedRegistration.registration_status === "completed" ? "SELESAI" 
      : "MENUNGGU";
    const statusColor = selectedRegistration.registration_status === "approved" ? [34, 197, 94]
      : selectedRegistration.registration_status === "rejected" ? [239, 68, 68]
      : [234, 179, 8];
    
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(pageWidth - margin - 40, 45, 40, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(statusText, pageWidth - margin - 20, 51, { align: "center" });
    doc.setTextColor(0, 0, 0);

    // Data Pribadi
    addSection("DATA PRIBADI");
    addField("Nama Lengkap", selectedRegistration.full_name);
    addField("Email", selectedRegistration.email);
    addField("No. Telepon", selectedRegistration.phone);
    addField("Tempat, Tgl Lahir", `${trainingData.birth_place || "-"}, ${trainingData.birth_date || "-"}`);
    addField("Jenis Kelamin", trainingData.gender === "male" ? "Laki-laki" : trainingData.gender === "female" ? "Perempuan" : "-");
    addField("Alamat", trainingData.address);
    addField("Kota", trainingData.city);
    addField("Provinsi", trainingData.province);
    yPos += lineHeight;

    // Pendidikan & Pekerjaan
    addSection("PENDIDIKAN & PEKERJAAN");
    addField("Pendidikan", trainingData.education?.toUpperCase());
    addField("Institusi", trainingData.institution);
    addField("Jurusan", trainingData.major);
    addField("Tahun Lulus", trainingData.graduation_year);
    addField("Pekerjaan", trainingData.occupation);
    addField("Organisasi", trainingData.organization);
    yPos += lineHeight;

    // Pengalaman Organisasi
    addSection("PENGALAMAN ORGANISASI");
    if (Array.isArray(trainingData.organizational_experience) && trainingData.organizational_experience.length > 0) {
      trainingData.organizational_experience.forEach((exp: any, i: number) => {
        addField(`${i + 1}. ${exp.organization || "-"}`, `${exp.position || "-"} (${exp.year || "-"})`);
        if (exp.description) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          const descText = doc.splitTextToSize(exp.description, contentWidth - 10);
          descText.forEach((line: string) => {
            if (yPos > 280) { doc.addPage(); yPos = 20; }
            doc.text(line, margin + 5, yPos);
            yPos += lineHeight * 0.7;
          });
        }
      });
    } else {
      doc.setFontSize(10);
      doc.text("Tidak ada data", margin, yPos);
      yPos += lineHeight;
    }
    yPos += lineHeight;

    // Prestasi
    addSection("5 PRESTASI TERBAIK");
    if (Array.isArray(trainingData.achievements) && trainingData.achievements.some((a: any) => a.title)) {
      trainingData.achievements.filter((a: any) => a.title).forEach((ach: any, i: number) => {
        addField(`${i + 1}. ${ach.title || "-"}`, ach.year || "-");
        if (ach.description) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          const descText = doc.splitTextToSize(ach.description, contentWidth - 10);
          descText.forEach((line: string) => {
            if (yPos > 280) { doc.addPage(); yPos = 20; }
            doc.text(line, margin + 5, yPos);
            yPos += lineHeight * 0.7;
          });
        }
      });
    } else {
      doc.setFontSize(10);
      doc.text("Tidak ada data", margin, yPos);
      yPos += lineHeight;
    }
    yPos += lineHeight;

    // Motivasi
    addSection("MOTIVASI & RENCANA");
    addLongText("Dari Mana Mengetahui FIM", trainingData.how_did_you_know);
    addLongText("Alasan Bergabung FIM", trainingData.why_join_fim);
    addLongText("Motivasi", trainingData.motivation);
    addLongText("Kepedulian Isu Sosial", trainingData.social_issue_concern);
    addLongText("Pengalaman Kontribusi Sosial", trainingData.social_contribution_experience);
    addLongText("Rencana Kontribusi Strategis", trainingData.strategic_contribution_plan);
    addLongText("Dampak yang Diharapkan", trainingData.impact_expected);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Dicetak pada ${format(new Date(), "dd MMMM yyyy HH:mm", { locale: localeId })}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );

    // Save
    const fileName = `Pendaftaran-FIM-${selectedRegistration.full_name.replace(/\s+/g, "-")}-${format(new Date(), "yyyyMMdd")}.pdf`;
    doc.save(fileName);
    toast.success("PDF berhasil diunduh");
  };

  const eligibleForSelection = registrations?.filter(r => 
    r.registration_status !== "approved" && r.registration_status !== "rejected"
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Manajemen Pendaftaran FIM
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola dan review pendaftaran peserta FIM
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBlockedListOpen(true)}>
            <ListX className="h-4 w-4 mr-2" />
            Daftar Blokir
          </Button>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["fim-registrations"] })}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <span className="font-medium">
                {selectedIds.size} pendaftaran dipilih
              </span>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setIsBulkStageDialogOpen(true)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Lolos Seleksi
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => openBulkDialog("reject")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Tidak Lolos
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus ({selectedIds.size})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Batal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Pendaftaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (sortField === "name") {
                  setSortOrder(prev => prev === "asc" ? "desc" : "asc");
                } else {
                  setSortField("name");
                  setSortOrder("asc");
                }
              }}
              title={sortField === "name" ? (sortOrder === "asc" ? "Urutkan Z-A" : "Urutkan A-Z") : "Urutkan berdasarkan nama"}
              className={sortField === "name" ? "bg-primary/10" : ""}
            >
              {sortOrder === "asc" && sortField === "name" ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownZA className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (sortField === "created_at") {
                  setSortOrder(prev => prev === "asc" ? "desc" : "asc");
                } else {
                  setSortField("created_at");
                  setSortOrder("desc");
                }
              }}
              title={sortField === "created_at" ? (sortOrder === "asc" ? "Terlama" : "Terbaru") : "Urutkan berdasarkan tanggal"}
              className={sortField === "created_at" ? "bg-primary/10" : ""}
            >
              {sortOrder === "asc" ? <CalendarArrowUp className="h-4 w-4" /> : <CalendarArrowDown className="h-4 w-4" />}
            </Button>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter Tahap" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahap</SelectItem>
                <SelectItem value="administrasi">Administrasi</SelectItem>
                <SelectItem value="wawancara">Wawancara</SelectItem>
                <SelectItem value="pengumuman">Pengumuman</SelectItem>
              </SelectContent>
            </Select>
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Batch</SelectItem>
                {batches?.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.batch_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={eligibleForSelection.length > 0 && selectedIds.size === eligibleForSelection.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tahap Seleksi</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : registrations && registrations.length > 0 ? (
                  registrations.map((reg) => {
                    const canSelect = reg.registration_status !== "approved" && reg.registration_status !== "rejected";
                    const schedule = getInterviewScheduleForRegistration(reg.id);
                    return (
                      <TableRow key={reg.id}>
                        <TableCell>
                          {canSelect ? (
                            <Checkbox
                              checked={selectedIds.has(reg.id)}
                              onCheckedChange={() => toggleSelect(reg.id)}
                            />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell 
                          className="font-medium text-foreground hover:text-primary hover:underline cursor-pointer"
                          onClick={() => {
                            setSelectedRegistration(reg);
                            setIsDetailOpen(true);
                            setReviewerNote("");
                          }}
                        >
                          {reg.full_name}
                        </TableCell>
                        <TableCell 
                          className="text-muted-foreground hover:text-primary hover:underline cursor-pointer"
                          onClick={() => {
                            setSelectedRegistration(reg);
                            setIsDetailOpen(true);
                            setReviewerNote("");
                          }}
                        >
                          {reg.email}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(reg) || getInterviewStatusBadge(reg, schedule)}
                          </div>
                        </TableCell>
                        <TableCell>{getStageBadge(reg.selection_stage || 'administrasi', reg.selection_passed)}</TableCell>
                        <TableCell>
                          {format(new Date(reg.created_at), "dd MMM yyyy", { locale: localeId })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRegistration(reg);
                                  setIsDetailOpen(true);
                                  setReviewerNote("");
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  resetPasswordMutation.mutate({ registrationId: reg.id });
                                }}
                                disabled={resetPasswordMutation.isPending}
                              >
                                <Key className="h-4 w-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setRegistrationToDelete(reg);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus Data
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setRegistrationToBlock(reg);
                                  setIsBlockDialogOpen(true);
                                }}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Blokir & Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada data pendaftaran
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Detail Pendaftaran
            </SheetTitle>
            <SheetDescription>
              Informasi lengkap dan review pendaftar
            </SheetDescription>
          </SheetHeader>

          {selectedRegistration && (
            <div className="mt-6 space-y-6">
              {/* Status Badge and Email Verification */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedRegistration.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedRegistration.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedRegistration.email_verified ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Email Terverifikasi
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Belum Verifikasi
                      </Badge>
                    )}
                    {!selectedRegistration.email_verified && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => {
                          manualVerifyMutation.mutate({
                            id: selectedRegistration.id,
                            email: selectedRegistration.email,
                            name: selectedRegistration.full_name,
                          });
                        }}
                        disabled={manualVerifyMutation.isPending}
                      >
                        {manualVerifyMutation.isPending ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        )}
                        Verifikasi Manual
                      </Button>
                    )}
                  </div>
                </div>
                {getStatusBadge(selectedRegistration, trainingData)}
              </div>

              <Separator />

              {/* Tabs */}
              <Tabs defaultValue="biodata" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="biodata">Biodata</TabsTrigger>
                  <TabsTrigger value="experience">Pengalaman</TabsTrigger>
                  <TabsTrigger value="motivation">Motivasi</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="logs">Log Aktivitas</TabsTrigger>
                </TabsList>

                {isLoadingTraining ? (
                  <div className="py-8 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : trainingData ? (
                  <>
                    {/* Biodata Tab */}
                    <TabsContent value="biodata" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Tempat, Tanggal Lahir</Label>
                          <p className="font-medium">{trainingData.birth_place || "-"}, {trainingData.birth_date || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Jenis Kelamin</Label>
                          <p className="font-medium">{trainingData.gender === "male" ? "Laki-laki" : trainingData.gender === "female" ? "Perempuan" : "-"}</p>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-muted-foreground">Alamat</Label>
                          <p className="font-medium">{trainingData.address || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Kota</Label>
                          <p className="font-medium">{trainingData.city || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Provinsi</Label>
                          <p className="font-medium">{trainingData.province || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Pendidikan</Label>
                          <p className="font-medium">{trainingData.education?.toUpperCase() || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Institusi</Label>
                          <p className="font-medium">{trainingData.institution || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Jurusan</Label>
                          <p className="font-medium">{trainingData.major || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Tahun Lulus</Label>
                          <p className="font-medium">{trainingData.graduation_year || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Pekerjaan</Label>
                          <p className="font-medium">{trainingData.occupation || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Organisasi Saat Ini</Label>
                          <p className="font-medium">{trainingData.organization || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">No. Telepon</Label>
                          <p className="font-medium">{selectedRegistration.phone || "-"}</p>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Experience Tab */}
                    <TabsContent value="experience" className="space-y-6 mt-4">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <Briefcase className="h-4 w-4" />
                          Pengalaman Organisasi
                        </h4>
                        {Array.isArray(trainingData.organizational_experience) && trainingData.organizational_experience.length > 0 ? (
                          <div className="space-y-3">
                            {trainingData.organizational_experience.map((exp: any, i: number) => (
                              <div key={i} className="border rounded-lg p-3 text-sm">
                                <p className="font-medium">{exp.organization || "-"}</p>
                                <p className="text-muted-foreground">{exp.position} ({exp.year})</p>
                                {exp.description && <p className="mt-1 text-muted-foreground">{exp.description}</p>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Tidak ada data</p>
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <Award className="h-4 w-4" />
                          5 Prestasi Terbaik
                        </h4>
                        {Array.isArray(trainingData.achievements) && trainingData.achievements.some((a: any) => a.title) ? (
                          <div className="space-y-3">
                            {trainingData.achievements.filter((a: any) => a.title).map((ach: any, i: number) => (
                              <div key={i} className="border rounded-lg p-3 text-sm">
                                <p className="font-medium">{ach.title}</p>
                                <p className="text-muted-foreground">{ach.year}</p>
                                {ach.description && <p className="mt-1 text-muted-foreground">{ach.description}</p>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Tidak ada data</p>
                        )}
                      </div>
                    </TabsContent>

                    {/* Motivation Tab */}
                    <TabsContent value="motivation" className="space-y-6 mt-4">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4" />
                          Dari Mana Mengetahui FIM
                        </h4>
                        <p className="text-sm bg-muted/50 p-3 rounded-lg">{trainingData.how_did_you_know || "-"}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4" />
                          Alasan Bergabung FIM
                        </h4>
                        <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">{trainingData.why_join_fim || "-"}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <Heart className="h-4 w-4" />
                          Motivasi
                        </h4>
                        <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">{trainingData.motivation || "-"}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <Heart className="h-4 w-4" />
                          Kepedulian Sosial
                        </h4>
                        <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">{trainingData.social_issue_concern || "-"}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4" />
                          Pengalaman Kontribusi Sosial
                        </h4>
                        <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">{trainingData.social_contribution_experience || "-"}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4" />
                          Rencana Kontribusi Strategis
                        </h4>
                        <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">{trainingData.strategic_contribution_plan || "-"}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4" />
                          Dampak yang Diharapkan
                        </h4>
                        <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">{trainingData.impact_expected || "-"}</p>
                      </div>
                    </TabsContent>

                    {/* Timeline Tab */}
                    <TabsContent value="timeline" className="space-y-4 mt-4">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <History className="h-4 w-4" />
                          Timeline Autosave
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-3 h-3 bg-primary rounded-full" />
                            <div>
                              <p className="font-medium">Pendaftaran Akun</p>
                              <p className="text-muted-foreground">
                                {format(new Date(selectedRegistration.created_at), "dd MMM yyyy HH:mm:ss", { locale: localeId })}
                              </p>
                            </div>
                          </div>
                          {trainingData.created_at && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-3 h-3 bg-blue-500 rounded-full" />
                              <div>
                                <p className="font-medium">Mulai Isi Formulir</p>
                                <p className="text-muted-foreground">
                                  {format(new Date(trainingData.created_at), "dd MMM yyyy HH:mm:ss", { locale: localeId })}
                                </p>
                              </div>
                            </div>
                          )}
                          {trainingData.last_saved_at && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                              <div>
                                <p className="font-medium">Terakhir Disimpan (Auto-save)</p>
                                <p className="text-muted-foreground">
                                  {format(new Date(trainingData.last_saved_at), "dd MMM yyyy HH:mm:ss", { locale: localeId })}
                                </p>
                              </div>
                            </div>
                          )}
                          {trainingData.is_submitted && trainingData.submitted_at && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-3 h-3 bg-green-500 rounded-full" />
                              <div>
                                <p className="font-medium">Dikirim</p>
                                <p className="text-muted-foreground">
                                  {format(new Date(trainingData.submitted_at), "dd MMM yyyy HH:mm:ss", { locale: localeId })}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Progress Pengisian</Label>
                          <p className="font-medium text-lg">{trainingData.completion_percentage}%</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Status Submit</Label>
                          <p className="font-medium">{trainingData.is_submitted ? "Sudah Dikirim" : "Belum Dikirim"}</p>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Activity Logs Tab */}
                    <TabsContent value="logs" className="space-y-4 mt-4">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <History className="h-4 w-4" />
                          Log Aktivitas Admin
                        </h4>
                        {activityLogs && activityLogs.length > 0 ? (
                          <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {activityLogs.map((log: any) => (
                              <div key={log.id} className="border rounded-lg p-3 text-sm">
                                <div className="flex justify-between items-start">
                                  <span className="font-medium capitalize">{log.action.replace(/_/g, ' ')}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(log.created_at), "dd MMM yyyy HH:mm", { locale: localeId })}
                                  </span>
                                </div>
                                {log.details && Object.keys(log.details).length > 0 && (
                                  <p className="text-muted-foreground mt-1 text-xs">
                                    {JSON.stringify(log.details)}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Belum ada log aktivitas</p>
                        )}
                      </div>
                    </TabsContent>
                  </>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>Pendaftar belum mengisi formulir pelatihan</p>
                  </div>
                )}
              </Tabs>

              <Separator />

              {/* Selection Stage Info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Tahap Seleksi Saat Ini</h4>
                  {getStageBadge(selectedRegistration.selection_stage || 'administrasi', selectedRegistration.selection_passed)}
                </div>
                
                {/* Interview Schedule Status Indicator */}
                {interviewSchedule && (
                  <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Jadwal Wawancara Terdaftar</span>
                      </div>
                      <Badge className={
                        interviewSchedule.status === "completed" ? "bg-green-600" :
                        interviewSchedule.status === "cancelled" ? "bg-red-600" :
                        "bg-blue-600"
                      }>
                        {interviewSchedule.status === "completed" ? "Selesai" :
                         interviewSchedule.status === "cancelled" ? "Dibatalkan" : "Terjadwal"}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                      <p>📅 {new Date(interviewSchedule.scheduled_date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })} pukul {interviewSchedule.scheduled_time}</p>
                      {interviewSchedule.location && <p>📍 {interviewSchedule.location}</p>}
                      {interviewSchedule.meeting_link && (
                        <p className="flex items-center gap-1">
                          🔗 <a href={interviewSchedule.meeting_link} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
                            Link Meeting <ExternalLink className="h-3 w-3 inline" />
                          </a>
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setScheduleData({
                          registration: selectedRegistration,
                          date: interviewSchedule.scheduled_date,
                          time: interviewSchedule.scheduled_time,
                          note: interviewSchedule.notes || "",
                          location: interviewSchedule.location || "",
                          meetingLink: interviewSchedule.meeting_link || ""
                        });
                        setIsScheduleDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Ubah Jadwal
                    </Button>
                    
                    {/* Interviewer Selector */}
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                      <InterviewerSelector
                        registrationId={selectedRegistration.id}
                        currentInterviewerName={interviewSchedule.interviewer_name}
                        scheduleId={interviewSchedule.id}
                        onUpdate={() => {
                          queryClient.invalidateQueries({ queryKey: ["interview-schedule"] });
                        }}
                      />
                    </div>
                  </div>
                )}

                {!interviewSchedule && selectedRegistration.interview_date && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Jadwal Wawancara: </span>
                    <span className="font-medium">{selectedRegistration.interview_date}</span>
                  </div>
                )}
                {selectedRegistration.admin_selection_note && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Catatan Admin: </span>
                    <span>{selectedRegistration.admin_selection_note}</span>
                  </div>
                )}
                {selectedRegistration.final_result && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Hasil Akhir: </span>
                    <span className={`font-semibold ${selectedRegistration.final_result === 'lolos' ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedRegistration.final_result === 'lolos' ? 'LOLOS' : 'TIDAK LOLOS'}
                    </span>
                  </div>
                )}

              </div>

              {/* Reviewer Section */}
              <div className="space-y-4">
                <h4 className="font-semibold">Catatan Reviewer</h4>
                <Textarea
                  placeholder="Tulis catatan untuk pendaftar ini..."
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="note-visibility"
                    checked={noteVisibleToApplicant}
                    onCheckedChange={(checked) => setNoteVisibleToApplicant(checked === true)}
                  />
                  <Label htmlFor="note-visibility" className="text-sm text-muted-foreground">
                    Tampilkan catatan ini ke pendaftar
                  </Label>
                </div>
              </div>

              {/* Action Buttons based on Selection Stage */}
              <SheetFooter className="flex flex-col gap-4 sm:flex-col">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={handleExportPDF}
                    disabled={!trainingData}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>

                {/* Administrasi Stage Actions - Only show if training data is submitted */}
                {selectedRegistration.selection_stage === "administrasi" && selectedRegistration.selection_passed !== true && !selectedRegistration.final_result && (
                  <div className="space-y-2 w-full">
                    {trainingData?.is_submitted ? (
                      <>
                        <Label className="text-sm font-medium">Review Seleksi Administrasi:</Label>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 flex-1"
                            onClick={() => {
                              updateStageMutation.mutate({
                                id: selectedRegistration.id,
                                stage: "lolos_administrasi",
                                note: reviewerNote,
                                email: selectedRegistration.email,
                                name: selectedRegistration.full_name,
                                sendEmail: false, // Don't send email yet - wait for batch announcement
                                noteVisible: noteVisibleToApplicant,
                              });
                            }}
                            disabled={updateStageMutation.isPending}
                          >
                            {updateStageMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                            )}
                            Lolos Administrasi
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => {
                              if (!reviewerNote.trim()) {
                                toast.error("Mohon isi catatan alasan tidak lolos");
                                return;
                              }
                              updateFinalResultMutation.mutate({
                                id: selectedRegistration.id,
                                result: "tidak_lolos",
                                note: reviewerNote,
                                email: selectedRegistration.email,
                                name: selectedRegistration.full_name
                              });
                            }}
                            disabled={updateFinalResultMutation.isPending}
                          >
                            {updateFinalResultMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Tidak Lolos Administrasi
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          <strong>Belum Dapat Direview</strong> - Pendaftar belum submit formulir pendaftaran.
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Completion: {trainingData?.completion_percentage || 0}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Lolos Administrasi - Move to Interview Stage first, then schedule */}
                {selectedRegistration.selection_stage === "administrasi" && selectedRegistration.selection_passed === true && !selectedRegistration.final_result && (
                  <div className="space-y-3 w-full">
                    <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Pendaftar ini <strong>Lolos Administrasi</strong>. Pindahkan ke tahap wawancara untuk kemudian dijadwalkan interviewnya.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          updateStageMutation.mutate({
                            id: selectedRegistration.id,
                            stage: "wawancara",
                            note: reviewerNote,
                            email: selectedRegistration.email,
                            name: selectedRegistration.full_name,
                            sendEmail: false, // Don't send email yet - wait until interview is scheduled
                            noteVisible: noteVisibleToApplicant,
                          });
                        }}
                        disabled={updateStageMutation.isPending}
                      >
                        {updateStageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        Pindah ke Tahap Wawancara
                      </Button>
                    </div>
                  </div>
                )}

                {/* Wawancara Stage Actions */}
                {selectedRegistration.selection_stage === "wawancara" && !selectedRegistration.final_result && (
                  <div className="space-y-3 w-full">
                    {/* Interview Status */}
                    {!interviewSchedule && (
                      <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                        <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <strong>Belum Wawancara</strong> - Pendaftar belum dijadwalkan wawancara.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setScheduleData({
                              registration: selectedRegistration,
                              date: "",
                              time: "",
                              note: reviewerNote,
                              location: "",
                              meetingLink: ""
                            });
                            setIsScheduleDialogOpen(true);
                          }}
                        >
                          <CalendarPlus className="h-4 w-4 mr-2" />
                          Jadwalkan Wawancara
                        </Button>
                      </div>
                    )}
                    
                    {interviewSchedule && interviewSchedule.status === "scheduled" && (
                      <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 space-y-2">
                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <CalendarCheck className="h-4 w-4" />
                          <strong>Terjadwal</strong> - Wawancara belum dilaksanakan.
                        </p>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          <p>Tanggal: {format(new Date(interviewSchedule.scheduled_date), "dd MMMM yyyy", { locale: id })}</p>
                          <p>Waktu: {interviewSchedule.scheduled_time}</p>
                          {interviewSchedule.location && <p>Lokasi: {interviewSchedule.location}</p>}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                            onClick={() => {
                              setScheduleToComplete({ id: interviewSchedule.id, registrationId: selectedRegistration.id });
                              setIsInterviewCompletedDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Selesai
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-600 border-amber-300 hover:bg-amber-50"
                            onClick={() => {
                              if (confirm("Tandai peserta ini sebagai Tidak Hadir? Status akan otomatis menjadi Tidak Lolos.")) {
                                updateInterviewStatusMutation.mutate({
                                  scheduleId: interviewSchedule.id,
                                  registrationId: selectedRegistration.id,
                                  status: "no_show"
                                });
                              }
                            }}
                            disabled={updateInterviewStatusMutation.isPending}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Tidak Hadir
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("Batalkan wawancara ini? Status akan otomatis menjadi Tidak Lolos.")) {
                                updateInterviewStatusMutation.mutate({
                                  scheduleId: interviewSchedule.id,
                                  registrationId: selectedRegistration.id,
                                  status: "cancelled"
                                });
                              }
                            }}
                            disabled={updateInterviewStatusMutation.isPending}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Batalkan
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {interviewSchedule && interviewSchedule.status === "completed" && (
                      <div className="p-3 rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
                        <p className="text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <strong>Belum Ditentukan</strong> - Wawancara selesai, menunggu keputusan.
                        </p>
                      </div>
                    )}

                    {/* Only show review buttons if interview is completed */}
                    {interviewSchedule?.status === "completed" && (
                      <>
                        <Label className="text-sm font-medium">Rekomendasi Setelah Wawancara:</Label>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 flex-1"
                            onClick={() => {
                              updateFinalResultMutation.mutate({
                                id: selectedRegistration.id,
                                result: "lolos",
                                note: reviewerNote,
                                email: selectedRegistration.email,
                                name: selectedRegistration.full_name
                              });
                            }}
                            disabled={updateFinalResultMutation.isPending}
                          >
                            {updateFinalResultMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                            )}
                            Lolos (Diterima)
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => {
                              if (!reviewerNote.trim()) {
                                toast.error("Mohon isi catatan alasan tidak lolos");
                                return;
                              }
                              updateFinalResultMutation.mutate({
                                id: selectedRegistration.id,
                                result: "tidak_lolos",
                                note: reviewerNote,
                                email: selectedRegistration.email,
                                name: selectedRegistration.full_name
                              });
                            }}
                            disabled={updateFinalResultMutation.isPending}
                          >
                            {updateFinalResultMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Tidak Lolos
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Pengumuman Stage - Final Result Already Set */}
                {selectedRegistration.final_result && (
                  <div className="space-y-3 w-full">
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <p className="text-sm text-muted-foreground">
                        Pendaftar ini sudah memiliki hasil akhir: 
                        <span className={`ml-1 font-semibold ${selectedRegistration.final_result === 'lolos' ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedRegistration.final_result === 'lolos' ? 'LOLOS' : 'TIDAK LOLOS'}
                        </span>
                      </p>
                    </div>
                    {/* Option to revert status for human error correction */}
                    <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                      <p className="text-xs text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Koreksi hasil (jika terjadi kesalahan input):
                      </p>
                      <div className="flex gap-2">
                        {selectedRegistration.final_result === 'tidak_lolos' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-300 hover:bg-green-50"
                            onClick={() => {
                              updateFinalResultMutation.mutate({
                                id: selectedRegistration.id,
                                result: "lolos",
                                note: reviewerNote || "Koreksi status: diubah menjadi Lolos",
                                email: selectedRegistration.email,
                                name: selectedRegistration.full_name
                              });
                            }}
                            disabled={updateFinalResultMutation.isPending}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ubah ke Lolos
                          </Button>
                        )}
                        {selectedRegistration.final_result === 'lolos' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => {
                              updateFinalResultMutation.mutate({
                                id: selectedRegistration.id,
                                result: "tidak_lolos",
                                note: reviewerNote || "Koreksi status: diubah menjadi Tidak Lolos",
                                email: selectedRegistration.email,
                                name: selectedRegistration.full_name
                              });
                            }}
                            disabled={updateFinalResultMutation.isPending}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Ubah ke Tidak Lolos
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Revert to previous stage
                            const revertStage = selectedRegistration.selection_stage === 'pengumuman' ? 'wawancara' : 'administrasi';
                            revertStatusMutation.mutate({
                              id: selectedRegistration.id,
                              stage: revertStage,
                            });
                          }}
                          disabled={revertStatusMutation?.isPending}
                        >
                          <History className="h-3 w-3 mr-1" />
                          Kembalikan ke Tahap Sebelumnya
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Email Preview Dialog */}
      <Dialog open={isEmailPreviewOpen} onOpenChange={setIsEmailPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Preview Email Notifikasi
            </DialogTitle>
            <DialogDescription>
              Berikut adalah email yang akan dikirim ke pendaftar
            </DialogDescription>
          </DialogHeader>
          
          {emailPreviewData && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Kepada</Label>
                <p className="font-medium">{emailPreviewData.registration.email}</p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Subjek</Label>
                <p className="font-medium">
                  {generateEmailPreview(emailPreviewData.action, emailPreviewData.registration.full_name, emailPreviewData.note).subject}
                </p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Isi Email</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-sans">
                    {generateEmailPreview(emailPreviewData.action, emailPreviewData.registration.full_name, emailPreviewData.note).body}
                  </pre>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailPreviewOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={confirmSendEmail}
              disabled={updateStatusMutation.isPending}
              className={emailPreviewData?.action === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={emailPreviewData?.action === "reject" ? "destructive" : "default"}
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Kirim Email & {emailPreviewData?.action === "approve" ? "Setujui" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkAction === "approve" ? "Setujui" : "Tolak"} {selectedIds.size} Pendaftaran
            </DialogTitle>
            <DialogDescription>
              {bulkAction === "approve" 
                ? "Semua pendaftaran yang dipilih akan disetujui dan email notifikasi akan dikirim."
                : "Semua pendaftaran yang dipilih akan ditolak dan email notifikasi akan dikirim. Catatan wajib diisi."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Catatan {bulkAction === "reject" && "(Wajib)"}</Label>
              <Textarea
                placeholder="Tulis catatan untuk semua pendaftar..."
                value={bulkNote}
                onChange={(e) => setBulkNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleBulkAction}
              disabled={bulkUpdateMutation.isPending || (bulkAction === "reject" && !bulkNote.trim())}
              className={bulkAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={bulkAction === "reject" ? "destructive" : "default"}
            >
              {bulkUpdateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : bulkAction === "approve" ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {bulkAction === "approve" ? "Setujui Semua" : "Tolak Semua"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interview Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5" />
              Jadwalkan Wawancara
            </DialogTitle>
            <DialogDescription>
              {scheduleData.registration && (
                <>Jadwalkan wawancara untuk <strong>{scheduleData.registration.full_name}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Tanggal</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Waktu</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduleData.time}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schedule-location">Lokasi (opsional)</Label>
              <Input
                id="schedule-location"
                placeholder="Contoh: Ruang Meeting A, Lt. 2"
                value={scheduleData.location}
                onChange={(e) => setScheduleData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule-meeting-link">Link Meeting (opsional)</Label>
              <Input
                id="schedule-meeting-link"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={scheduleData.meetingLink}
                onChange={(e) => setScheduleData(prev => ({ ...prev, meetingLink: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schedule-note">Catatan (opsional)</Label>
              <Textarea
                id="schedule-note"
                placeholder="Catatan tambahan untuk pendaftar..."
                value={scheduleData.note}
                onChange={(e) => setScheduleData(prev => ({ ...prev, note: e.target.value }))}
                rows={2}
              />
            </div>

            {scheduleData.date && scheduleData.time && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Preview jadwal yang akan dikirim:</p>
                <p className="font-medium">
                  {new Date(`${scheduleData.date}T${scheduleData.time}`).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })} pukul {scheduleData.time} WIB
                </p>
                {scheduleData.location && <p className="text-sm text-muted-foreground mt-1">📍 {scheduleData.location}</p>}
                {scheduleData.meetingLink && <p className="text-sm text-muted-foreground">🔗 {scheduleData.meetingLink}</p>}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={async () => {
                if (!scheduleData.registration || !scheduleData.date || !scheduleData.time) {
                  toast.error("Mohon lengkapi tanggal dan waktu wawancara");
                  return;
                }
                
                try {
                  // Create interview schedule in database with interviewer name
                  await createInterviewScheduleMutation.mutateAsync({
                    registrationId: scheduleData.registration.id,
                    date: scheduleData.date,
                    time: scheduleData.time,
                    note: scheduleData.note,
                    location: scheduleData.location,
                    meetingLink: scheduleData.meetingLink,
                    interviewerName: profile?.full_name || profile?.username || undefined,
                  });

                  // The createInterviewScheduleMutation already updates registration stage
                  // No need to call updateStageMutation again - this was causing timestamp errors

                  toast.success("Jadwal wawancara berhasil dibuat dan disinkronkan dengan kalender");
                  setIsScheduleDialogOpen(false);
                } catch (error: any) {
                  toast.error(`Gagal menjadwalkan wawancara: ${error.message}`);
                }
              }}
              disabled={updateStageMutation.isPending || createInterviewScheduleMutation.isPending || !scheduleData.date || !scheduleData.time}
            >
              {(updateStageMutation.isPending || createInterviewScheduleMutation.isPending) ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Kirim Undangan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Stage Update Dialog - Simplified for Lolos Seleksi */}
      <Dialog open={isBulkStageDialogOpen} onOpenChange={setIsBulkStageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Lolos Seleksi
            </DialogTitle>
            <DialogDescription>
              {selectedIds.size} pendaftaran akan ditandai sebagai <strong>lolos seleksi</strong> pada tahap saat ini 
              (administrasi atau wawancara). Untuk penjadwalan wawancara, gunakan menu Kalender Wawancara.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-note">Catatan (opsional)</Label>
              <Textarea
                id="bulk-note"
                placeholder="Catatan untuk pendaftar (misal: alasan lolos)..."
                value={bulkNote}
                onChange={(e) => setBulkNote(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                id="bulk-note-visible"
                checked={bulkNoteVisible}
                onCheckedChange={(checked) => setBulkNoteVisible(checked === true)}
              />
              <Label htmlFor="bulk-note-visible" className="text-sm">
                Tampilkan catatan ini ke pendaftar
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsBulkStageDialogOpen(false);
              setBulkNote("");
              setBulkNoteVisible(false);
            }}>
              Batal
            </Button>
            <Button
              onClick={() => {
                bulkStageMutation.mutate({
                  ids: Array.from(selectedIds),
                  stage: "lolos_seleksi",
                  note: bulkNote,
                  passed: true,
                  noteVisible: bulkNoteVisible,
                });
              }}
              disabled={bulkStageMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {bulkStageMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Tandai {selectedIds.size} Lolos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Data Pendaftar
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data pendaftar <strong>{registrationToDelete?.full_name}</strong>? 
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait termasuk formulir dan jadwal wawancara.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => registrationToDelete && deleteRegistrationMutation.mutate(registrationToDelete)}
              disabled={deleteRegistrationMutation.isPending}
            >
              {deleteRegistrationMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus {selectedIds.size} Data Pendaftar
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{selectedIds.size} data pendaftar</strong> yang dipilih? 
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait termasuk formulir dan jadwal wawancara.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => bulkDeleteMutation.mutate(Array.from(selectedIds))}
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Hapus {selectedIds.size} Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset Result Dialog */}
      <Dialog open={isPasswordResetDialogOpen} onOpenChange={setIsPasswordResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Password Berhasil Direset
            </DialogTitle>
            <DialogDescription>
              Password untuk akun pendaftar telah direset. Berikan password sementara ini kepada pendaftar.
            </DialogDescription>
          </DialogHeader>
          
          {passwordResetResult && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Nama</Label>
                  <p className="font-medium">{passwordResetResult.full_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{passwordResetResult.email}</p>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <Label className="text-xs text-amber-700 dark:text-amber-300">Password Sementara</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 px-3 py-2 bg-white dark:bg-black rounded border font-mono text-lg">
                    {passwordResetResult.temporary_password}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(passwordResetResult.temporary_password);
                      toast.success("Password disalin ke clipboard");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  ⚠️ Pastikan untuk menyampaikan password ini kepada pendaftar secara aman.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => {
              setIsPasswordResetDialogOpen(false);
              setPasswordResetResult(null);
            }}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interview Completed Dialog with Feedback */}
      <Dialog open={isInterviewCompletedDialogOpen} onOpenChange={setIsInterviewCompletedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tandai Wawancara Selesai</DialogTitle>
            <DialogDescription>
              Masukkan catatan hasil wawancara sebelum menandai sebagai selesai.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Catatan Wawancara <span className="text-destructive">*</span></Label>
              <Textarea
                value={interviewFeedbackNote}
                onChange={(e) => setInterviewFeedbackNote(e.target.value)}
                placeholder="Catatan hasil wawancara (wajib diisi)..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Catatan ini akan disimpan sebagai feedback interviewer dan ditampilkan pada data pendaftar.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsInterviewCompletedDialogOpen(false);
              setScheduleToComplete(null);
              setInterviewFeedbackNote("");
            }}>
              Batal
            </Button>
            <Button 
              onClick={() => {
                if (!interviewFeedbackNote.trim()) {
                  toast.error("Catatan wawancara wajib diisi");
                  return;
                }
                if (scheduleToComplete) {
                  markInterviewCompletedMutation.mutate({
                    scheduleId: scheduleToComplete.id,
                    registrationId: scheduleToComplete.registrationId,
                    feedback: interviewFeedbackNote
                  });
                }
              }}
              disabled={markInterviewCompletedMutation.isPending || !interviewFeedbackNote.trim()}
            >
              {markInterviewCompletedMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Tandai Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Registrant Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              Blokir & Hapus Pendaftar
            </DialogTitle>
            <DialogDescription>
              Pendaftar akan dihapus dari sistem dan data berikut akan diblokir untuk mencegah pendaftaran ulang.
            </DialogDescription>
          </DialogHeader>
          
          {registrationToBlock && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{registrationToBlock.full_name}</p>
                <p className="text-sm text-muted-foreground">{registrationToBlock.email}</p>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Pilih data yang akan diblokir:</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="block-email"
                      checked={blockOptions.email}
                      onCheckedChange={(checked) => setBlockOptions(prev => ({ ...prev, email: checked === true }))}
                    />
                    <Label htmlFor="block-email" className="text-sm">Email ({registrationToBlock.email})</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="block-phone"
                      checked={blockOptions.phone}
                      onCheckedChange={(checked) => setBlockOptions(prev => ({ ...prev, phone: checked === true }))}
                      disabled={!registrationToBlock.phone}
                    />
                    <Label htmlFor="block-phone" className="text-sm">
                      No. HP ({registrationToBlock.phone || "Tidak ada"})
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="block-nik"
                      checked={blockOptions.nik}
                      onCheckedChange={(checked) => setBlockOptions(prev => ({ ...prev, nik: checked === true }))}
                    />
                    <Label htmlFor="block-nik" className="text-sm">NIK (jika ada)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="block-name"
                      checked={blockOptions.fullName}
                      onCheckedChange={(checked) => setBlockOptions(prev => ({ ...prev, fullName: checked === true }))}
                    />
                    <Label htmlFor="block-name" className="text-sm">Nama Lengkap ({registrationToBlock.full_name})</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Alasan Blokir <span className="text-destructive">*</span></Label>
                <Textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Tuliskan alasan pemblokiran..."
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsBlockDialogOpen(false);
              setRegistrationToBlock(null);
              setBlockReason("");
            }}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!blockReason.trim()) {
                  toast.error("Alasan blokir wajib diisi");
                  return;
                }
                if (registrationToBlock) {
                  blockRegistrationMutation.mutate({
                    registration: registrationToBlock,
                    reason: blockReason,
                    options: blockOptions,
                  });
                }
              }}
              disabled={blockRegistrationMutation.isPending || !blockReason.trim()}
            >
              {blockRegistrationMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Ban className="h-4 w-4 mr-2" />
              )}
              Blokir & Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blocked List Dialog */}
      <Dialog open={isBlockedListOpen} onOpenChange={setIsBlockedListOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListX className="h-5 w-5" />
              Daftar Akun Terblokir
            </DialogTitle>
            <DialogDescription>
              Akun yang diblokir tidak dapat mendaftar ulang dengan data yang sama.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[50vh]">
            {blockedRegistrations && blockedRegistrations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedRegistrations.map((blocked) => (
                    <TableRow key={blocked.id}>
                      <TableCell className="text-sm">{blocked.email || "-"}</TableCell>
                      <TableCell className="text-sm">{blocked.full_name || "-"}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{blocked.blocked_reason || "-"}</TableCell>
                      <TableCell className="text-sm">
                        {blocked.blocked_at ? format(new Date(blocked.blocked_at), "dd/MM/yy") : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Hapus dari daftar blokir? Data tersebut dapat digunakan untuk mendaftar kembali.")) {
                              unblockMutation.mutate(blocked.id);
                            }
                          }}
                          disabled={unblockMutation.isPending}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Tidak ada akun yang terblokir
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter>
            <Button onClick={() => setIsBlockedListOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
