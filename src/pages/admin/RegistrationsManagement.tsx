import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Download,
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
  Calendar,
  FileText,
  GraduationCap,
  Briefcase,
} from "lucide-react";

interface Registration {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  registration_status: string;
  auth_user_id: string;
  created_at: string;
  updated_at: string;
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
  created_at: string;
}

export default function RegistrationsManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch all registrations
  const { data: registrations, isLoading } = useQuery({
    queryKey: ["fim-registrations", searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("fim_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("registration_status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Registration[];
    },
  });

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

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("fim_registrations")
        .update({ registration_status: status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status pendaftaran diperbarui");
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
    },
    onError: () => {
      toast.error("Gagal memperbarui status");
    },
  });

  // Export to Excel
  const handleExport = async () => {
    try {
      // Fetch all registrations with training data
      const { data: allRegs, error: regsError } = await supabase
        .from("fim_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (regsError) throw regsError;

      const { data: allTraining, error: trainingError } = await supabase
        .from("fim_training_registrations")
        .select("*");

      if (trainingError) throw trainingError;

      // Combine data
      const exportData = allRegs?.map(reg => {
        const training = allTraining?.find(t => t.registration_id === reg.id);
        return {
          "Nama Lengkap": reg.full_name,
          "Email": reg.email,
          "No. Telepon": reg.phone || "-",
          "Status": reg.registration_status,
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
        };
      }) || [];

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
      XLSX.writeFile(workbook, `FIM-Registrations-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      
      toast.success("Data berhasil diexport");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengexport data");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Selesai</Badge>;
      case "incomplete":
        return <Badge variant="secondary" className="gap-1"><AlertCircle className="h-3 w-3" />Belum Lengkap</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Menunggu</Badge>;
    }
  };

  const stats = {
    total: registrations?.length || 0,
    pending: registrations?.filter(r => r.registration_status === "pending").length || 0,
    incomplete: registrations?.filter(r => r.registration_status === "incomplete").length || 0,
    completed: registrations?.filter(r => r.registration_status === "completed").length || 0,
  };

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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Lengkap</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.incomplete}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="incomplete">Belum Lengkap</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : registrations && registrations.length > 0 ? (
                  registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">{reg.full_name}</TableCell>
                      <TableCell>{reg.email}</TableCell>
                      <TableCell>{reg.phone || "-"}</TableCell>
                      <TableCell>{getStatusBadge(reg.registration_status)}</TableCell>
                      <TableCell>
                        {format(new Date(reg.created_at), "dd MMM yyyy", { locale: localeId })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRegistration(reg);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data pendaftaran
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pendaftaran</DialogTitle>
            <DialogDescription>
              Informasi lengkap pendaftar
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Data Dasar
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nama:</span>
                      <span className="font-medium">{selectedRegistration.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedRegistration.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Telepon:</span>
                      <span className="font-medium">{selectedRegistration.phone || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(selectedRegistration.registration_status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tanggal Daftar:</span>
                      <span>{format(new Date(selectedRegistration.created_at), "dd MMM yyyy HH:mm", { locale: localeId })}</span>
                    </div>
                  </div>
                </div>

                {trainingData && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Data Pelatihan
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium">{trainingData.completion_percentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Submit:</span>
                        <span className="font-medium">{trainingData.is_submitted ? "Sudah" : "Belum"}</span>
                      </div>
                      {trainingData.submitted_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Waktu Submit:</span>
                          <span>{format(new Date(trainingData.submitted_at), "dd MMM yyyy HH:mm", { locale: localeId })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {trainingData && (
                <>
                  {/* Biodata */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-4">Biodata</h3>
                    <div className="grid gap-2 md:grid-cols-3 text-sm">
                      <div><span className="text-muted-foreground">TTL:</span> {trainingData.birth_place || "-"}, {trainingData.birth_date || "-"}</div>
                      <div><span className="text-muted-foreground">Gender:</span> {trainingData.gender === "male" ? "Laki-laki" : trainingData.gender === "female" ? "Perempuan" : "-"}</div>
                      <div><span className="text-muted-foreground">Kota:</span> {trainingData.city || "-"}, {trainingData.province || "-"}</div>
                      <div><span className="text-muted-foreground">Pendidikan:</span> {trainingData.education || "-"}</div>
                      <div><span className="text-muted-foreground">Institusi:</span> {trainingData.institution || "-"}</div>
                      <div><span className="text-muted-foreground">Jurusan:</span> {trainingData.major || "-"}</div>
                      <div><span className="text-muted-foreground">Pekerjaan:</span> {trainingData.occupation || "-"}</div>
                    </div>
                  </div>

                  {/* Motivasi */}
                  {trainingData.motivation && (
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-2">Motivasi</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{trainingData.motivation}</p>
                    </div>
                  )}

                  {/* Kepedulian Sosial */}
                  {trainingData.social_issue_concern && (
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-2">Kepedulian Sosial</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{trainingData.social_issue_concern}</p>
                    </div>
                  )}

                  {/* Kontribusi Strategis */}
                  {trainingData.strategic_contribution_plan && (
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-2">Rencana Kontribusi</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{trainingData.strategic_contribution_plan}</p>
                    </div>
                  )}
                </>
              )}

              {/* Actions */}
              <div className="border-t pt-4 flex gap-2">
                <Select
                  value={selectedRegistration.registration_status}
                  onValueChange={(value) => {
                    updateStatusMutation.mutate({ id: selectedRegistration.id, status: value });
                    setSelectedRegistration({ ...selectedRegistration, registration_status: value });
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Ubah Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="incomplete">Belum Lengkap</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
