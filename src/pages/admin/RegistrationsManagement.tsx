import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  last_saved_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function RegistrationsManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [reviewerNote, setReviewerNote] = useState("");

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
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const { error } = await supabase
        .from("fim_registrations")
        .update({ registration_status: status })
        .eq("id", id);
      if (error) throw error;

      // Log to audit if needed
      if (note) {
        console.log("Reviewer note:", note);
      }
    },
    onSuccess: (_, variables) => {
      toast.success(`Status diubah menjadi ${variables.status === "approved" ? "Disetujui" : variables.status === "rejected" ? "Ditolak" : variables.status}`);
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      setReviewerNote("");
    },
    onError: () => {
      toast.error("Gagal memperbarui status");
    },
  });

  // Export to Excel
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
          "Alasan Gabung FIM": training?.why_join_fim || "-",
          "Kepedulian Sosial": training?.social_issue_concern || "-",
          "Pengalaman Kontribusi": training?.social_contribution_experience || "-",
          "Rencana Kontribusi": training?.strategic_contribution_plan || "-",
          "Dampak yang Diharapkan": training?.impact_expected || "-",
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
      case "approved":
        return <Badge className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" />Disetujui</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Ditolak</Badge>;
      case "incomplete":
        return <Badge variant="secondary" className="gap-1"><AlertCircle className="h-3 w-3" />Belum Lengkap</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Menunggu</Badge>;
    }
  };

  const stats = {
    total: registrations?.length || 0,
    pending: registrations?.filter(r => r.registration_status === "pending").length || 0,
    completed: registrations?.filter(r => r.registration_status === "completed").length || 0,
    approved: registrations?.filter(r => r.registration_status === "approved").length || 0,
    rejected: registrations?.filter(r => r.registration_status === "rejected").length || 0,
  };

  const handleApprove = () => {
    if (selectedRegistration) {
      updateStatusMutation.mutate({ 
        id: selectedRegistration.id, 
        status: "approved",
        note: reviewerNote 
      });
      setSelectedRegistration({ ...selectedRegistration, registration_status: "approved" });
    }
  };

  const handleReject = () => {
    if (!reviewerNote.trim()) {
      toast.error("Mohon isi catatan alasan penolakan");
      return;
    }
    if (selectedRegistration) {
      updateStatusMutation.mutate({ 
        id: selectedRegistration.id, 
        status: "rejected",
        note: reviewerNote 
      });
      setSelectedRegistration({ ...selectedRegistration, registration_status: "rejected" });
    }
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
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
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
                            setReviewerNote("");
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
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedRegistration.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedRegistration.email}</p>
                </div>
                {getStatusBadge(selectedRegistration.registration_status)}
              </div>

              <Separator />

              {/* Tabs */}
              <Tabs defaultValue="biodata" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="biodata">Biodata</TabsTrigger>
                  <TabsTrigger value="experience">Pengalaman</TabsTrigger>
                  <TabsTrigger value="motivation">Motivasi</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
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
                      {/* Organizational Experience */}
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

                      {/* Achievements */}
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
                  </>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>Pendaftar belum mengisi formulir pelatihan</p>
                  </div>
                )}
              </Tabs>

              <Separator />

              {/* Reviewer Section */}
              <div className="space-y-4">
                <h4 className="font-semibold">Catatan Reviewer</h4>
                <Textarea
                  placeholder="Tulis catatan untuk pendaftar ini (wajib diisi jika menolak)..."
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value)}
                  rows={3}
                />
              </div>

              <SheetFooter className="flex gap-2 sm:justify-start">
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={updateStatusMutation.isPending || selectedRegistration.registration_status === "approved"}
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Setujui
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={updateStatusMutation.isPending || selectedRegistration.registration_status === "rejected"}
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Tolak
                </Button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
