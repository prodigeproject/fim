import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Pencil, Trash2, Settings, Calendar, Users, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface RegistrationSettings {
  id: string;
  batch_name: string;
  batch_number: number;
  is_registration_open: boolean;
  registration_start_date: string | null;
  registration_end_date: string | null;
  max_participants: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  // Timeline fields
  admin_review_start_date: string | null;
  admin_review_end_date: string | null;
  admin_result_announcement_date: string | null;
  interview_start_date: string | null;
  interview_end_date: string | null;
  final_result_announcement_date: string | null;
  allow_edit_beyond_timeline: boolean;
}

export default function RegistrationSettingsManagement() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSettings, setEditingSettings] = useState<RegistrationSettings | null>(null);
  const [formData, setFormData] = useState({
    batch_name: "",
    batch_number: 0,
    description: "",
    max_participants: "",
    registration_start_date: "",
    registration_end_date: "",
    // Timeline fields
    admin_review_start_date: "",
    admin_review_end_date: "",
    admin_result_announcement_date: "",
    interview_start_date: "",
    interview_end_date: "",
    final_result_announcement_date: "",
    allow_edit_beyond_timeline: false,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["registration-settings-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registration_settings")
        .select("*")
        .order("batch_number", { ascending: false });
      
      if (error) throw error;
      return data as RegistrationSettings[];
    },
  });

  const { data: registrationCounts } = useQuery({
    queryKey: ["registration-counts-by-batch"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fim_registrations")
        .select("batch_id");
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach((reg) => {
        if (reg.batch_id) {
          counts[reg.batch_id] = (counts[reg.batch_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  const toggleRegistrationMutation = useMutation({
    mutationFn: async ({ id, isOpen }: { id: string; isOpen: boolean }) => {
      // First, close all other registrations if we're opening this one
      if (isOpen) {
        await supabase
          .from("registration_settings")
          .update({ is_registration_open: false })
          .neq("id", id);
      }

      const { error } = await supabase
        .from("registration_settings")
        .update({ is_registration_open: isOpen })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: (_, { isOpen }) => {
      queryClient.invalidateQueries({ queryKey: ["registration-settings-admin"] });
      queryClient.invalidateQueries({ queryKey: ["registration-status"] });
      toast.success(isOpen ? "Pendaftaran dibuka" : "Pendaftaran ditutup");
    },
    onError: (error) => {
      toast.error("Gagal mengubah status: " + error.message);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("registration_settings")
        .insert({
          batch_name: data.batch_name,
          batch_number: data.batch_number,
          description: data.description || null,
          max_participants: data.max_participants ? parseInt(data.max_participants) : null,
          registration_start_date: data.registration_start_date || null,
          registration_end_date: data.registration_end_date || null,
          admin_review_start_date: data.admin_review_start_date || null,
          admin_review_end_date: data.admin_review_end_date || null,
          admin_result_announcement_date: data.admin_result_announcement_date || null,
          interview_start_date: data.interview_start_date || null,
          interview_end_date: data.interview_end_date || null,
          final_result_announcement_date: data.final_result_announcement_date || null,
          allow_edit_beyond_timeline: data.allow_edit_beyond_timeline,
          is_registration_open: false,
          is_active: true,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration-settings-admin"] });
      toast.success("Batch baru berhasil dibuat");
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Gagal membuat batch: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("registration_settings")
        .update({
          batch_name: data.batch_name,
          batch_number: data.batch_number,
          description: data.description || null,
          max_participants: data.max_participants ? parseInt(data.max_participants) : null,
          registration_start_date: data.registration_start_date || null,
          registration_end_date: data.registration_end_date || null,
          admin_review_start_date: data.admin_review_start_date || null,
          admin_review_end_date: data.admin_review_end_date || null,
          admin_result_announcement_date: data.admin_result_announcement_date || null,
          interview_start_date: data.interview_start_date || null,
          interview_end_date: data.interview_end_date || null,
          final_result_announcement_date: data.final_result_announcement_date || null,
          allow_edit_beyond_timeline: data.allow_edit_beyond_timeline,
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration-settings-admin"] });
      toast.success("Batch berhasil diperbarui");
      setEditingSettings(null);
      resetForm();
    },
    onError: (error) => {
      toast.error("Gagal memperbarui batch: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("registration_settings")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration-settings-admin"] });
      toast.success("Batch berhasil dihapus");
    },
    onError: (error) => {
      toast.error("Gagal menghapus batch: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      batch_name: "",
      batch_number: 0,
      description: "",
      max_participants: "",
      registration_start_date: "",
      registration_end_date: "",
      admin_review_start_date: "",
      admin_review_end_date: "",
      admin_result_announcement_date: "",
      interview_start_date: "",
      interview_end_date: "",
      final_result_announcement_date: "",
      allow_edit_beyond_timeline: false,
    });
  };

  const handleEdit = (setting: RegistrationSettings) => {
    setEditingSettings(setting);
    setFormData({
      batch_name: setting.batch_name,
      batch_number: setting.batch_number,
      description: setting.description || "",
      max_participants: setting.max_participants?.toString() || "",
      registration_start_date: setting.registration_start_date?.split("T")[0] || "",
      registration_end_date: setting.registration_end_date?.split("T")[0] || "",
      admin_review_start_date: setting.admin_review_start_date?.split("T")[0] || "",
      admin_review_end_date: setting.admin_review_end_date?.split("T")[0] || "",
      admin_result_announcement_date: setting.admin_result_announcement_date?.split("T")[0] || "",
      interview_start_date: setting.interview_start_date?.split("T")[0] || "",
      interview_end_date: setting.interview_end_date?.split("T")[0] || "",
      final_result_announcement_date: setting.final_result_announcement_date?.split("T")[0] || "",
      allow_edit_beyond_timeline: setting.allow_edit_beyond_timeline || false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.batch_name || !formData.batch_number) {
      toast.error("Nama batch dan nomor batch wajib diisi");
      return;
    }

    if (editingSettings) {
      updateMutation.mutate({ id: editingSettings.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const activeBatch = settings?.find(s => s.is_registration_open);

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
          <h1 className="text-2xl font-bold">Pengaturan Pendaftaran</h1>
          <p className="text-muted-foreground">
            Kelola batch dan status pembukaan pendaftaran FIM
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Batch Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Batch Baru</DialogTitle>
              <DialogDescription>
                Buat batch pendaftaran baru untuk program pelatihan FIM
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batch_name">Nama Batch *</Label>
                <Input
                  id="batch_name"
                  placeholder="FIM 28: Tema Pelatihan"
                  value={formData.batch_name}
                  onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch_number">Nomor Batch *</Label>
                <Input
                  id="batch_number"
                  type="number"
                  placeholder="28"
                  value={formData.batch_number || ""}
                  onChange={(e) => setFormData({ ...formData, batch_number: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  placeholder="Deskripsi singkat tentang batch ini"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registration_start_date">Tanggal Mulai</Label>
                  <Input
                    id="registration_start_date"
                    type="date"
                    value={formData.registration_start_date}
                    onChange={(e) => setFormData({ ...formData, registration_start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_end_date">Tanggal Selesai</Label>
                  <Input
                    id="registration_end_date"
                    type="date"
                    value={formData.registration_end_date}
                    onChange={(e) => setFormData({ ...formData, registration_end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_participants">Maks. Peserta</Label>
                <Input
                  id="max_participants"
                  type="number"
                  placeholder="100"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status Pendaftaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeBatch ? (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Pendaftaran <strong>{activeBatch.batch_name}</strong> sedang DIBUKA
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Saat ini tidak ada pendaftaran yang dibuka. Aktifkan salah satu batch untuk membuka pendaftaran.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Batch List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Batch</CardTitle>
          <CardDescription>
            Kelola batch pendaftaran dan atur status pembukaan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Pendaftar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings?.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{setting.batch_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Angkatan {setting.batch_number}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {setting.registration_start_date && setting.registration_end_date ? (
                      <div className="text-sm">
                        {format(new Date(setting.registration_start_date), "d MMM yyyy", { locale: id })} -{" "}
                        {format(new Date(setting.registration_end_date), "d MMM yyyy", { locale: id })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Belum diatur</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{registrationCounts?.[setting.id] || 0}</span>
                      {setting.max_participants && (
                        <span className="text-muted-foreground">/ {setting.max_participants}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={setting.is_registration_open}
                        onCheckedChange={(checked) => 
                          toggleRegistrationMutation.mutate({ id: setting.id, isOpen: checked })
                        }
                        disabled={toggleRegistrationMutation.isPending}
                      />
                      <Badge variant={setting.is_registration_open ? "default" : "secondary"}>
                        {setting.is_registration_open ? "Dibuka" : "Ditutup"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(setting)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Yakin ingin menghapus batch ini?")) {
                            deleteMutation.mutate(setting.id);
                          }
                        }}
                        disabled={deleteMutation.isPending || (registrationCounts?.[setting.id] || 0) > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingSettings} onOpenChange={(open) => !open && setEditingSettings(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
            <DialogDescription>
              Perbarui informasi batch pendaftaran
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_batch_name">Nama Batch *</Label>
              <Input
                id="edit_batch_name"
                value={formData.batch_name}
                onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_batch_number">Nomor Batch *</Label>
              <Input
                id="edit_batch_number"
                type="number"
                value={formData.batch_number || ""}
                onChange={(e) => setFormData({ ...formData, batch_number: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_description">Deskripsi</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_start_date">Tanggal Mulai</Label>
                <Input
                  id="edit_start_date"
                  type="date"
                  value={formData.registration_start_date}
                  onChange={(e) => setFormData({ ...formData, registration_start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_end_date">Tanggal Selesai</Label>
                <Input
                  id="edit_end_date"
                  type="date"
                  value={formData.registration_end_date}
                  onChange={(e) => setFormData({ ...formData, registration_end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_max_participants">Maks. Peserta</Label>
              <Input
                id="edit_max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingSettings(null)}>
                Batal
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
