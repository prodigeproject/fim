import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users2,
  UserPlus,
  Trash2,
  Loader2,
  RefreshCw,
  Search,
  ClipboardList,
  MessageSquare,
  UserCheck,
  Filter,
} from "lucide-react";

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

interface Registration {
  id: string;
  full_name: string;
  email: string;
  selection_stage: string;
}

export default function RecruiterAssignmentsManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "administrasi" | "wawancara" | "both">("all");
  const [filterRecruiter, setFilterRecruiter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedRegistration, setSelectedRegistration] = useState("");
  const [assignmentType, setAssignmentType] = useState<"administrasi" | "wawancara" | "both">("administrasi");
  const [notes, setNotes] = useState("");

  // Fetch all assignments
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["all-recruiter-assignments"],
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
  const { data: adminProfiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
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

  // Fetch all registrations
  const { data: registrations } = useQuery({
    queryKey: ["all-registrations-for-assignment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fim_registrations")
        .select("id, full_name, email, selection_stage")
        .order("full_name");
      
      if (error) throw error;
      return data as Registration[];
    },
  });

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("recruiter-assignments-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "recruiter_assignments",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-recruiter-assignments"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
      queryClient.invalidateQueries({ queryKey: ["all-recruiter-assignments"] });
      setIsAddDialogOpen(false);
      resetForm();
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
      queryClient.invalidateQueries({ queryKey: ["all-recruiter-assignments"] });
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus: ${error.message}`);
    },
  });

  const resetForm = () => {
    setSelectedAdmin("");
    setSelectedRegistration("");
    setAssignmentType("administrasi");
    setNotes("");
  };

  // Get admin name by ID
  const getAdminName = (adminId: string) => {
    const admin = adminProfiles?.find(a => a.id === adminId);
    return admin?.full_name || admin?.username || "Unknown";
  };

  // Get registration name by ID
  const getRegistrationName = (regId: string) => {
    const reg = registrations?.find(r => r.id === regId);
    return reg?.full_name || "Unknown";
  };

  // Get registration email by ID
  const getRegistrationEmail = (regId: string) => {
    const reg = registrations?.find(r => r.id === regId);
    return reg?.email || "";
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

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];
    
    return assignments.filter(a => {
      // Type filter
      if (filterType !== "all" && a.assignment_type !== filterType) return false;
      
      // Recruiter filter
      if (filterRecruiter !== "all" && a.assigned_to !== filterRecruiter) return false;
      
      // Search filter
      if (searchTerm) {
        const regName = getRegistrationName(a.registration_id).toLowerCase();
        const regEmail = getRegistrationEmail(a.registration_id).toLowerCase();
        const adminName = getAdminName(a.assigned_to).toLowerCase();
        const term = searchTerm.toLowerCase();
        if (!regName.includes(term) && !regEmail.includes(term) && !adminName.includes(term)) {
          return false;
        }
      }
      
      return true;
    });
  }, [assignments, filterType, filterRecruiter, searchTerm, adminProfiles, registrations]);

  // Stats
  const stats = useMemo(() => {
    if (!assignments) return { total: 0, administrasi: 0, wawancara: 0, both: 0 };
    return {
      total: assignments.length,
      administrasi: assignments.filter(a => a.assignment_type === "administrasi").length,
      wawancara: assignments.filter(a => a.assignment_type === "wawancara").length,
      both: assignments.filter(a => a.assignment_type === "both").length,
    };
  }, [assignments]);

  const handleAssign = () => {
    if (!selectedAdmin || !selectedRegistration) {
      toast.error("Pilih pendaftar dan rekruter terlebih dahulu");
      return;
    }

    createMutation.mutate({
      registration_id: selectedRegistration,
      assigned_to: selectedAdmin,
      assignment_type: assignmentType,
      notes: notes || null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users2 className="h-6 w-6" />
            Penugasan Rekruter
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola penugasan rekruter untuk seleksi pendaftaran FIM
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["all-recruiter-assignments"] })}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Tambah Penugasan
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Penugasan</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.administrasi}</div>
              <div className="text-sm text-muted-foreground">Administrasi</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.wawancara}</div>
              <div className="text-sm text-muted-foreground">Wawancara</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.both}</div>
              <div className="text-sm text-muted-foreground">Keduanya</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari pendaftar atau rekruter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipe Penugasan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="administrasi">Administrasi</SelectItem>
                <SelectItem value="wawancara">Wawancara</SelectItem>
                <SelectItem value="both">Keduanya</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRecruiter} onValueChange={setFilterRecruiter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Rekruter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Rekruter</SelectItem>
                {adminProfiles?.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.full_name || admin.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Penugasan</CardTitle>
          <CardDescription>
            {filteredAssignments.length} penugasan ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAssignments.length > 0 ? (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pendaftar</TableHead>
                    <TableHead>Rekruter</TableHead>
                    <TableHead>Tahap</TableHead>
                    <TableHead>Catatan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getRegistrationName(assignment.registration_id)}</p>
                          <p className="text-xs text-muted-foreground">{getRegistrationEmail(assignment.registration_id)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {getAdminName(assignment.assigned_to)}
                      </TableCell>
                      <TableCell>{getTypeBadge(assignment.assignment_type)}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm text-muted-foreground truncate">{assignment.notes || "-"}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(assignment.created_at), "dd MMM yyyy", { locale: localeId })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(assignment.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada penugasan ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Assignment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Tambah Penugasan Rekruter
            </DialogTitle>
            <DialogDescription>
              Tugaskan rekruter untuk mengelola seleksi pendaftar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pilih Pendaftar</Label>
              <Select value={selectedRegistration} onValueChange={setSelectedRegistration}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pendaftar..." />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    {registrations?.map((reg) => (
                      <SelectItem key={reg.id} value={reg.id}>
                        {reg.full_name} - {reg.email}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pilih Rekruter</Label>
              <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih rekruter..." />
                </SelectTrigger>
                <SelectContent>
                  {adminProfiles?.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.full_name || admin.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tahap Seleksi</Label>
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

            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan untuk rekruter..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={!selectedAdmin || !selectedRegistration || createMutation.isPending}
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
    </div>
  );
}
