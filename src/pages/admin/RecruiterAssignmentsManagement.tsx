import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, UserPlus, Users, ClipboardList, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Assignment {
  id: string;
  registration_id: string;
  assigned_to: string;
  assigned_by: string | null;
  assignment_type: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  username: string;
  email: string;
}

interface Registration {
  id: string;
  full_name: string;
  email: string;
  selection_stage: string | null;
}

export default function RecruiterAssignmentsManagement() {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAdminAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    registration_id: "",
    assigned_to: "",
    assignment_type: "both",
    notes: "",
  });

  // Fetch assignments with related data
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["recruiter-assignments-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recruiter_assignments")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Assignment[];
    },
  });

  // Fetch all admin profiles
  const { data: admins } = useQuery({
    queryKey: ["admin-profiles-for-assignment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, email")
        .order("full_name");

      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch registrations for assignment
  const { data: registrations } = useQuery({
    queryKey: ["registrations-for-assignment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fim_registrations")
        .select("id, full_name, email, selection_stage")
        .order("full_name");

      if (error) throw error;
      return data as Registration[];
    },
  });

  // Create assignment mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("recruiter_assignments").insert({
        registration_id: data.registration_id,
        assigned_to: data.assigned_to,
        assignment_type: data.assignment_type,
        notes: data.notes || null,
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter-assignments-full"] });
      toast.success("Penugasan berhasil dibuat");
      setIsDialogOpen(false);
      setFormData({
        registration_id: "",
        assigned_to: "",
        assignment_type: "both",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error("Gagal membuat penugasan: " + error.message);
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
      queryClient.invalidateQueries({ queryKey: ["recruiter-assignments-full"] });
      toast.success("Penugasan berhasil dihapus");
    },
    onError: (error) => {
      toast.error("Gagal menghapus penugasan: " + error.message);
    },
  });

  const getAdminName = (userId: string) => {
    const admin = admins?.find((a) => a.id === userId);
    return admin?.full_name || admin?.username || "Unknown";
  };

  const getRegistrationName = (regId: string) => {
    const reg = registrations?.find((r) => r.id === regId);
    return reg?.full_name || "Unknown";
  };

  const getRegistrationEmail = (regId: string) => {
    const reg = registrations?.find((r) => r.id === regId);
    return reg?.email || "";
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "administrasi":
        return { label: "Seleksi Administrasi", variant: "default" as const };
      case "wawancara":
        return { label: "Wawancara", variant: "secondary" as const };
      case "both":
        return { label: "Administrasi & Wawancara", variant: "outline" as const };
      default:
        return { label: type, variant: "default" as const };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Penugasan Rekruter</h1>
          <p className="text-muted-foreground">
            Kelola penugasan admin untuk seleksi administrasi dan wawancara
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Buat Penugasan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Penugasan Baru</DialogTitle>
              <DialogDescription>
                Tugaskan admin untuk mengelola seleksi pendaftar tertentu
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Pilih Pendaftar</Label>
                <Select
                  value={formData.registration_id}
                  onValueChange={(v) => setFormData({ ...formData, registration_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pendaftar..." />
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

              <div className="space-y-2">
                <Label>Pilih Rekruter/Admin</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(v) => setFormData({ ...formData, assigned_to: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih admin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {admins?.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.full_name || admin.username} ({admin.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipe Penugasan</Label>
                <Select
                  value={formData.assignment_type}
                  onValueChange={(v) => setFormData({ ...formData, assignment_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrasi">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Seleksi Administrasi
                      </div>
                    </SelectItem>
                    <SelectItem value="wawancara">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Wawancara
                      </div>
                    </SelectItem>
                    <SelectItem value="both">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Keduanya
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Catatan (Opsional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Tambahkan catatan untuk penugasan ini..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.registration_id || !formData.assigned_to || createMutation.isPending}
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Penugasan Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rekruter Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(assignments?.map((a) => a.assigned_to)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendaftar Ditugaskan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(assignments?.map((a) => a.registration_id)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Penugasan</CardTitle>
          <CardDescription>Semua penugasan rekruter yang aktif</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments && assignments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pendaftar</TableHead>
                  <TableHead>Rekruter</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => {
                  const typeInfo = getTypeLabel(assignment.assignment_type);
                  return (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getRegistrationName(assignment.registration_id)}</div>
                          <div className="text-xs text-muted-foreground">
                            {getRegistrationEmail(assignment.registration_id)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getAdminName(assignment.assigned_to)}</TableCell>
                      <TableCell>
                        <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{assignment.notes || "-"}</TableCell>
                      <TableCell>
                        {format(new Date(assignment.created_at), "d MMM yyyy", { locale: id })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Yakin ingin menghapus penugasan ini?")) {
                              deleteMutation.mutate(assignment.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada penugasan</p>
              <p className="text-sm">Klik "Buat Penugasan" untuk membuat penugasan baru</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
