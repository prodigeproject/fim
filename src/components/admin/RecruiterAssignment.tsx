import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  UserPlus, 
  Trash2, 
  Loader2, 
  Users2,
  ClipboardList,
  MessageSquare,
  UserCheck,
} from "lucide-react";

interface RecruiterAssignmentProps {
  registrationId: string;
  registrantName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Assignment {
  id: string;
  registration_id: string;
  assigned_to: string;
  assignment_type: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  assigned_by: string | null;
}

interface AdminProfile {
  id: string;
  full_name: string | null;
  username: string;
  email: string;
}

export function RecruiterAssignment({ 
  registrationId, 
  registrantName,
  isOpen, 
  onOpenChange 
}: RecruiterAssignmentProps) {
  const queryClient = useQueryClient();
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [assignmentType, setAssignmentType] = useState<"administrasi" | "wawancara" | "both">("administrasi");
  const [notes, setNotes] = useState("");

  // Fetch all admin profiles
  const { data: adminProfiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      // Get all users with admin roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id");
      
      if (rolesError) throw rolesError;
      if (!roles || roles.length === 0) return [];

      const userIds = roles.map(r => r.user_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, username, email")
        .in("id", userIds)
        .eq("is_active", true);
      
      if (profilesError) throw profilesError;
      return profiles as AdminProfile[];
    },
  });

  // Fetch current assignments for this registration
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["recruiter-assignments", registrationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recruiter_assignments")
        .select("*")
        .eq("registration_id", registrationId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Assignment[];
    },
    enabled: isOpen && !!registrationId,
  });

  // Create assignment mutation
  const createMutation = useMutation({
    mutationFn: async (data: { 
      registration_id: string; 
      assigned_to: string; 
      assignment_type: string; 
      notes: string | null 
    }) => {
      const { error } = await supabase
        .from("recruiter_assignments")
        .insert([{
          registration_id: data.registration_id,
          assigned_to: data.assigned_to,
          assignment_type: data.assignment_type,
          notes: data.notes,
          is_active: true,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rekruter berhasil ditugaskan");
      queryClient.invalidateQueries({ queryKey: ["recruiter-assignments", registrationId] });
      setSelectedAdmin("");
      setNotes("");
    },
    onError: (error: any) => {
      toast.error(`Gagal menugaskan: ${error.message}`);
    },
  });

  // Delete assignment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("recruiter_assignments")
        .update({ is_active: false })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Penugasan dihapus");
      queryClient.invalidateQueries({ queryKey: ["recruiter-assignments", registrationId] });
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus: ${error.message}`);
    },
  });

  // Get admin name by ID
  const getAdminName = (adminId: string) => {
    const admin = adminProfiles?.find(a => a.id === adminId);
    return admin?.full_name || admin?.username || "Unknown";
  };

  // Get type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "administrasi":
        return <Badge variant="outline" className="border-blue-500 text-blue-700"><ClipboardList className="h-3 w-3 mr-1" />Administrasi</Badge>;
      case "wawancara":
        return <Badge variant="outline" className="border-purple-500 text-purple-700"><MessageSquare className="h-3 w-3 mr-1" />Wawancara</Badge>;
      case "both":
        return <Badge variant="outline" className="border-green-500 text-green-700"><UserCheck className="h-3 w-3 mr-1" />Keduanya</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleAssign = () => {
    if (!selectedAdmin) {
      toast.error("Pilih admin terlebih dahulu");
      return;
    }

    createMutation.mutate({
      registration_id: registrationId,
      assigned_to: selectedAdmin,
      assignment_type: assignmentType,
      notes: notes || null,
    });
  };

  // Filter out already assigned admins for same type
  const availableAdmins = useMemo(() => {
    if (!adminProfiles) return [];
    const assignedIds = new Set(assignments?.filter(a => 
      a.assignment_type === assignmentType || a.assignment_type === "both"
    ).map(a => a.assigned_to));
    return adminProfiles.filter(a => !assignedIds.has(a.id));
  }, [adminProfiles, assignments, assignmentType]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5" />
            Penugasan Rekruter
          </DialogTitle>
          <DialogDescription>
            Tugaskan admin untuk mengelola seleksi "{registrantName}"
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {/* Current Assignments */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Penugasan Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : assignments && assignments.length > 0 ? (
                <ScrollArea className="max-h-40">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rekruter</TableHead>
                        <TableHead>Tahap</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium text-sm">
                            {getAdminName(assignment.assigned_to)}
                          </TableCell>
                          <TableCell>{getTypeBadge(assignment.assignment_type)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(assignment.created_at), "dd MMM yyyy", { locale: localeId })}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => deleteMutation.mutate(assignment.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Belum ada rekruter yang ditugaskan
                </p>
              )}
            </CardContent>
          </Card>

          {/* Add New Assignment */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tambah Penugasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Pilih Admin</Label>
                  <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih admin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAdmins.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.full_name || admin.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tahap Seleksi</Label>
                  <Select 
                    value={assignmentType} 
                    onValueChange={(v) => setAssignmentType(v as "administrasi" | "wawancara" | "both")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrasi">Administrasi</SelectItem>
                      <SelectItem value="wawancara">Wawancara</SelectItem>
                      <SelectItem value="both">Keduanya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Catatan (opsional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan untuk rekruter..."
                  rows={2}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedAdmin || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Tugaskan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Compact badge view for showing assignments in a list
export function RecruiterAssignmentBadge({ registrationId }: { registrationId: string }) {
  const { data: assignments } = useQuery({
    queryKey: ["recruiter-assignments", registrationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recruiter_assignments")
        .select("assigned_to, assignment_type")
        .eq("registration_id", registrationId)
        .eq("is_active", true);
      
      if (error) throw error;
      return data;
    },
  });

  if (!assignments || assignments.length === 0) return null;

  return (
    <Badge variant="secondary" className="gap-1 text-xs">
      <Users2 className="h-3 w-3" />
      {assignments.length}
    </Badge>
  );
}