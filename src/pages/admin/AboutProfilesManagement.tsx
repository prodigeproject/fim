import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, User, Loader2, GripVertical } from "lucide-react";
import { usePermission } from "@/hooks/usePermission";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useEffect } from "react";

const SECTIONS = [
  { value: "yayasan", label: "Struktur Yayasan" },
  { value: "bph", label: "BPH (Badan Pengurus Harian)" },
  { value: "biro_internal", label: "Biro Internal" },
  { value: "divisi", label: "Kepala Divisi & Biro" },
];

interface AboutProfile {
  id: string;
  name: string;
  position: string;
  section: string;
  photo_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export default function AboutProfilesManagement() {
  const { role } = useAdminAuth();
  const isSuperAdmin = role === "super_admin";
  const { canCreate, canEdit, canDelete } = usePermission("about_profiles");
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AboutProfile | null>(null);
  const [filterSection, setFilterSection] = useState<string>("all");
  const [form, setForm] = useState({ name: "", position: "", section: "yayasan", photo_url: "", sort_order: 0 });

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["about-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_profiles")
        .select("*")
        .order("section")
        .order("sort_order");
      if (error) throw error;
      return data as AboutProfile[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("about-profiles-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "about_profiles" }, () => {
        queryClient.invalidateQueries({ queryKey: ["about-profiles"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase.from("about_profiles").update({
          name: data.name, position: data.position, section: data.section,
          photo_url: data.photo_url || null, sort_order: data.sort_order,
        }).eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("about_profiles").insert({
          name: data.name, position: data.position, section: data.section,
          photo_url: data.photo_url || null, sort_order: data.sort_order,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingProfile ? "Profil berhasil diperbarui" : "Profil berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["about-profiles"] });
      resetForm();
    },
    onError: (err: any) => toast.error("Gagal menyimpan: " + err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("about_profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profil berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["about-profiles"] });
    },
    onError: (err: any) => toast.error("Gagal menghapus: " + err.message),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("about_profiles").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about-profiles"] });
    },
  });

  const resetForm = () => {
    setForm({ name: "", position: "", section: "yayasan", photo_url: "", sort_order: 0 });
    setEditingProfile(null);
    setIsDialogOpen(false);
  };

  const openEdit = (profile: AboutProfile) => {
    setEditingProfile(profile);
    setForm({
      name: profile.name, position: profile.position, section: profile.section,
      photo_url: profile.photo_url || "", sort_order: profile.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.position) {
      toast.error("Nama dan jabatan wajib diisi");
      return;
    }
    saveMutation.mutate({ ...form, id: editingProfile?.id });
  };

  const filteredProfiles = profiles?.filter(p => filterSection === "all" || p.section === filterSection) || [];

  const getSectionLabel = (section: string) => SECTIONS.find(s => s.value === section)?.label || section;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengurus & Struktur Organisasi</h1>
          <p className="text-muted-foreground">Kelola profil pengurus yang ditampilkan di halaman Tentang</p>
        </div>
        {(isSuperAdmin || canCreate) && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Tambah Profil</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProfile ? "Edit Profil" : "Tambah Profil Baru"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama *</Label>
                  <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Jabatan *</Label>
                  <Input value={form.position} onChange={(e) => setForm(f => ({ ...f, position: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Bagian</Label>
                  <Select value={form.section} onValueChange={(v) => setForm(f => ({ ...f, section: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SECTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>URL Foto (opsional)</Label>
                  <Input value={form.photo_url} onChange={(e) => setForm(f => ({ ...f, photo_url: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Urutan</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingProfile ? "Simpan" : "Tambah"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={filterSection === "all" ? "default" : "outline"} size="sm" onClick={() => setFilterSection("all")}>Semua</Button>
        {SECTIONS.map(s => (
          <Button key={s.value} variant={filterSection === s.value ? "default" : "outline"} size="sm" onClick={() => setFilterSection(s.value)}>{s.label}</Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead>Bagian</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Belum ada data</TableCell></TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="text-muted-foreground">{profile.sort_order}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {profile.photo_url ? (
                            <img src={profile.photo_url} alt={profile.name} className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-4 w-4 text-primary" /></div>
                          )}
                          <span className="font-medium">{profile.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{profile.position}</TableCell>
                      <TableCell><Badge variant="outline">{getSectionLabel(profile.section)}</Badge></TableCell>
                      <TableCell>
                        <Switch
                          checked={profile.is_active}
                          onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: profile.id, is_active: checked })}
                          disabled={!isSuperAdmin && !canEdit}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(isSuperAdmin || canEdit) && (
                            <Button variant="ghost" size="icon" onClick={() => openEdit(profile)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {(isSuperAdmin || canDelete) && (
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                              if (confirm("Hapus profil ini?")) deleteMutation.mutate(profile.id);
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
