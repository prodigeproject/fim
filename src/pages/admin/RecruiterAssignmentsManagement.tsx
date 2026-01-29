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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  CheckCircle2,
  XCircle,
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
  const [filterStage, setFilterStage] = useState<"all" | "administrasi" | "wawancara">("all");
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>("");
  const [assignmentType, setAssignmentType] = useState<"administrasi" | "wawancara" | "both">("administrasi");
  const [selectedRegistrationIds, setSelectedRegistrationIds] = useState<Set<string>>(new Set());

  // Fetch all assignments
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery({
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

  // Bulk create assignment mutation
  const bulkCreateMutation = useMutation({
    mutationFn: async ({ 
      registrationIds, 
      recruiterId, 
      type 
    }: { 
      registrationIds: string[]; 
      recruiterId: string; 
      type: string;
    }) => {
      // Filter out already assigned registrations for this recruiter and type
      const existingAssignments = assignments?.filter(
        a => a.assigned_to === recruiterId && 
             registrationIds.includes(a.registration_id) &&
             (a.assignment_type === type || a.assignment_type === "both" || type === "both")
      ) || [];
      
      const existingRegIds = new Set(existingAssignments.map(a => a.registration_id));
      const newRegistrationIds = registrationIds.filter(id => !existingRegIds.has(id));
      
      if (newRegistrationIds.length === 0) {
        throw new Error("Semua peserta yang dipilih sudah ditugaskan ke rekruter ini untuk tahap tersebut");
      }

      const insertData = newRegistrationIds.map(regId => ({
        registration_id: regId,
        assigned_to: recruiterId,
        assignment_type: type,
        is_active: true,
      }));

      const { error } = await supabase
        .from("recruiter_assignments")
        .insert(insertData);
      
      if (error) throw error;
      return newRegistrationIds.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} peserta berhasil ditugaskan ke rekruter`);
      queryClient.invalidateQueries({ queryKey: ["all-recruiter-assignments"] });
      setSelectedRegistrationIds(new Set());
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menugaskan");
    },
  });

  // Bulk delete assignment mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async ({ registrationIds, recruiterId }: { registrationIds: string[]; recruiterId: string }) => {
      const { error } = await supabase
        .from("recruiter_assignments")
        .update({ is_active: false })
        .eq("assigned_to", recruiterId)
        .in("registration_id", registrationIds);
      
      if (error) throw error;
      return registrationIds.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} penugasan dihapus`);
      queryClient.invalidateQueries({ queryKey: ["all-recruiter-assignments"] });
      setSelectedRegistrationIds(new Set());
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus: ${error.message}`);
    },
  });

  // Delete single assignment mutation
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

  // Get type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "administrasi":
        return <Badge variant="outline" className="border-blue-500 text-blue-700 dark:text-blue-400"><ClipboardList className="h-3 w-3 mr-1" />Administrasi</Badge>;
      case "wawancara":
        return <Badge variant="outline" className="border-purple-500 text-purple-700 dark:text-purple-400"><MessageSquare className="h-3 w-3 mr-1" />Wawancara</Badge>;
      case "both":
        return <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400"><UserCheck className="h-3 w-3 mr-1" />Keduanya</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Get stage badge
  const getStageBadge = (stage: string) => {
    switch (stage) {
      case "administrasi":
        return <Badge variant="secondary">Administrasi</Badge>;
      case "lolos_administrasi":
        return <Badge className="bg-emerald-600">Lolos Admin</Badge>;
      case "wawancara":
        return <Badge className="bg-blue-600">Wawancara</Badge>;
      default:
        return <Badge variant="outline">{stage}</Badge>;
    }
  };

  // Filter registrations based on search and stage filter
  const filteredRegistrations = useMemo(() => {
    if (!registrations) return [];
    
    return registrations.filter(reg => {
      // Stage filter
      if (filterStage !== "all") {
        if (filterStage === "administrasi" && reg.selection_stage !== "administrasi") return false;
        if (filterStage === "wawancara" && !["lolos_administrasi", "wawancara"].includes(reg.selection_stage)) return false;
      }
      
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!reg.full_name.toLowerCase().includes(term) && !reg.email.toLowerCase().includes(term)) {
          return false;
        }
      }
      
      return true;
    });
  }, [registrations, filterStage, searchTerm]);

  // Check if a registration is assigned to the selected recruiter
  const getAssignmentForRegistration = (regId: string) => {
    if (!selectedRecruiter || !assignments) return null;
    return assignments.find(a => a.registration_id === regId && a.assigned_to === selectedRecruiter);
  };

  // Stats
  const stats = useMemo(() => {
    if (!assignments) return { total: 0, administrasi: 0, wawancara: 0, both: 0, recruiters: 0 };
    const uniqueRecruiters = new Set(assignments.map(a => a.assigned_to));
    return {
      total: assignments.length,
      administrasi: assignments.filter(a => a.assignment_type === "administrasi").length,
      wawancara: assignments.filter(a => a.assignment_type === "wawancara").length,
      both: assignments.filter(a => a.assignment_type === "both").length,
      recruiters: uniqueRecruiters.size,
    };
  }, [assignments]);

  // Recruiter stats
  const recruiterStats = useMemo(() => {
    if (!selectedRecruiter || !assignments) return { total: 0, administrasi: 0, wawancara: 0 };
    const recruiterAssignments = assignments.filter(a => a.assigned_to === selectedRecruiter);
    return {
      total: recruiterAssignments.length,
      administrasi: recruiterAssignments.filter(a => a.assignment_type === "administrasi" || a.assignment_type === "both").length,
      wawancara: recruiterAssignments.filter(a => a.assignment_type === "wawancara" || a.assignment_type === "both").length,
    };
  }, [selectedRecruiter, assignments]);

  // Toggle selection
  const toggleRegistration = (regId: string) => {
    setSelectedRegistrationIds(prev => {
      const next = new Set(prev);
      if (next.has(regId)) {
        next.delete(regId);
      } else {
        next.add(regId);
      }
      return next;
    });
  };

  // Select all visible
  const selectAllVisible = () => {
    const visibleIds = filteredRegistrations.map(r => r.id);
    setSelectedRegistrationIds(new Set(visibleIds));
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedRegistrationIds(new Set());
  };

  const handleBulkAssign = () => {
    if (!selectedRecruiter) {
      toast.error("Pilih rekruter terlebih dahulu");
      return;
    }
    if (selectedRegistrationIds.size === 0) {
      toast.error("Pilih minimal satu peserta");
      return;
    }

    bulkCreateMutation.mutate({
      registrationIds: Array.from(selectedRegistrationIds),
      recruiterId: selectedRecruiter,
      type: assignmentType,
    });
  };

  const handleBulkRemove = () => {
    if (!selectedRecruiter) {
      toast.error("Pilih rekruter terlebih dahulu");
      return;
    }
    if (selectedRegistrationIds.size === 0) {
      toast.error("Pilih minimal satu peserta");
      return;
    }

    bulkDeleteMutation.mutate({
      registrationIds: Array.from(selectedRegistrationIds),
      recruiterId: selectedRecruiter,
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
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["all-recruiter-assignments"] })}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
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
              <div className="text-2xl font-bold text-primary">{stats.recruiters}</div>
              <div className="text-sm text-muted-foreground">Rekruter Aktif</div>
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

      {/* Bulk Assignment Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Penugasan Massal
          </CardTitle>
          <CardDescription>
            Pilih rekruter, tahap seleksi, dan peserta yang ingin ditugaskan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recruiter and Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Pilih Rekruter</Label>
              <Select value={selectedRecruiter} onValueChange={setSelectedRecruiter}>
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
              <Label>Tahap Penugasan</Label>
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
              <Label>Filter Tahap Peserta</Label>
              <Select value={filterStage} onValueChange={(v) => setFilterStage(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahap</SelectItem>
                  <SelectItem value="administrasi">Administrasi</SelectItem>
                  <SelectItem value="wawancara">Wawancara</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recruiter Stats */}
          {selectedRecruiter && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <div className="font-medium">{getAdminName(selectedRecruiter)}</div>
                <Separator orientation="vertical" className="h-6" />
                <div className="text-sm text-muted-foreground">
                  Total: <span className="font-semibold">{recruiterStats.total}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Admin: <span className="font-semibold text-blue-600">{recruiterStats.administrasi}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Wawancara: <span className="font-semibold text-purple-600">{recruiterStats.wawancara}</span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Search and Actions Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari peserta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={selectAllVisible}>
                Pilih Semua
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Batal Pilih
              </Button>
              <Separator orientation="vertical" className="h-8 hidden md:block" />
              <span className="text-sm text-muted-foreground">
                {selectedRegistrationIds.size} dipilih
              </span>
              <Button 
                size="sm"
                onClick={handleBulkAssign}
                disabled={!selectedRecruiter || selectedRegistrationIds.size === 0 || bulkCreateMutation.isPending}
              >
                {bulkCreateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Tugaskan
              </Button>
              <Button 
                variant="destructive"
                size="sm"
                onClick={handleBulkRemove}
                disabled={!selectedRecruiter || selectedRegistrationIds.size === 0 || bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Hapus
              </Button>
            </div>
          </div>

          {/* Participants Checklist Table */}
          <ScrollArea className="h-[400px] border rounded-lg">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedRegistrationIds.size === filteredRegistrations.length && filteredRegistrations.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectAllVisible();
                        } else {
                          deselectAll();
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Nama Peserta</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tahap</TableHead>
                  <TableHead>Status Penugasan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.length > 0 ? (
                  filteredRegistrations.map((reg) => {
                    const assignment = getAssignmentForRegistration(reg.id);
                    const isSelected = selectedRegistrationIds.has(reg.id);
                    
                    return (
                      <TableRow 
                        key={reg.id} 
                        className={isSelected ? "bg-primary/5" : ""}
                      >
                        <TableCell>
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => toggleRegistration(reg.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{reg.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{reg.email}</TableCell>
                        <TableCell>{getStageBadge(reg.selection_stage)}</TableCell>
                        <TableCell>
                          {selectedRecruiter ? (
                            assignment ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                {getTypeBadge(assignment.assignment_type)}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Belum ditugaskan</span>
                            )
                          ) : (
                            <span className="text-muted-foreground text-sm italic">Pilih rekruter</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      {registrations?.length === 0 ? "Tidak ada pendaftar" : "Tidak ada hasil yang cocok dengan filter"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Current Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Penugasan Aktif</CardTitle>
          <CardDescription>
            {assignments?.length || 0} penugasan aktif
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAssignments ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : assignments && assignments.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pendaftar</TableHead>
                    <TableHead>Rekruter</TableHead>
                    <TableHead>Tahap</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => {
                    const reg = registrations?.find(r => r.id === assignment.registration_id);
                    return (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{reg?.full_name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{reg?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {getAdminName(assignment.assigned_to)}
                        </TableCell>
                        <TableCell>{getTypeBadge(assignment.assignment_type)}</TableCell>
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
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada penugasan aktif</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
