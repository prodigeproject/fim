import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Users,
  Upload,
  Image,
  FileSpreadsheet,
  Download,
  ArrowUpAZ,
  ArrowDownZA,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Club {
  id: string;
  name: string;
  category: string;
  icon: string;
  logo_url: string | null;
  description: string | null;
  activities: string[];
  instagram: string | null;
  email: string | null;
  is_active: boolean;
  sort_order: number;
}

export default function ClubsManagement() {
  const { isSuperAdmin, user } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    icon: "Users",
    logo_url: "",
    description: "",
    activities: "",
    instagram: "",
    email: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      icon: "Users",
      logo_url: "",
      description: "",
      activities: "",
      instagram: "",
      email: "",
      is_active: true,
    });
    setEditingClub(null);
  };

  const { data: clubs, isLoading } = useQuery({
    queryKey: ["admin-fim-clubs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fim_clubs")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Club[];
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "File harus berupa gambar", variant: "destructive" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Ukuran file maksimal 2MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `club-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("article-images")
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, logo_url: urlData.publicUrl }));
      toast({ title: "Logo berhasil diupload" });
    } catch (error: any) {
      toast({ title: "Gagal upload logo", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        name: data.name.trim(),
        category: data.category.trim(),
        icon: data.icon,
        logo_url: data.logo_url.trim() || null,
        description: data.description.trim() || null,
        activities: data.activities.split(",").map((a) => a.trim()).filter(Boolean),
        instagram: data.instagram.trim() || null,
        email: data.email.trim() || null,
        is_active: data.is_active,
      };

      if (data.id) {
        const { error } = await supabase
          .from("fim_clubs")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("fim_clubs").insert(payload);
        if (error) throw error;
      }

      // Audit log
      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: data.id ? "update_club" : "create_club",
        p_resource_type: "fim_club",
        p_resource_id: data.id || null,
        p_details: { name: data.name },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-fim-clubs"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: editingClub ? "Club berhasil diperbarui" : "Club berhasil ditambahkan" });
    },
    onError: (error) => {
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (club: Club) => {
      const { error } = await supabase.from("fim_clubs").delete().eq("id", club.id);
      if (error) throw error;

      // Audit log
      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: "delete_club",
        p_resource_type: "fim_club",
        p_resource_id: club.id,
        p_details: { name: club.name },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-fim-clubs"] });
      toast({ title: "Club berhasil dihapus" });
    },
    onError: (error) => {
      toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
    },
  });

  // CSV Import
  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split("\n").filter(line => line.trim());
    
    if (lines.length < 2) {
      toast({ title: "File CSV kosong atau tidak valid", variant: "destructive" });
      return;
    }

    // Parse header
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const requiredHeaders = ["name", "category"];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      toast({ 
        title: "Kolom wajib tidak ditemukan", 
        description: `Kolom yang dibutuhkan: ${missingHeaders.join(", ")}`, 
        variant: "destructive" 
      });
      return;
    }

    const dataRows = lines.slice(1);
    const clubs = dataRows.map(line => {
      const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || "";
      });
      return {
        name: obj.name || "",
        category: obj.category || "",
        description: obj.description || null,
        activities: obj.activities ? obj.activities.split(";").map((a: string) => a.trim()) : [],
        instagram: obj.instagram || null,
        email: obj.email || null,
        logo_url: obj.logo_url || null,
        is_active: obj.is_active !== "false",
        icon: "Users",
      };
    }).filter(c => c.name && c.category);

    if (clubs.length === 0) {
      toast({ title: "Tidak ada data valid untuk diimport", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("fim_clubs").insert(clubs);
      if (error) throw error;

      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: "import_clubs_csv",
        p_resource_type: "fim_club",
        p_details: { count: clubs.length },
      });

      queryClient.invalidateQueries({ queryKey: ["admin-fim-clubs"] });
      toast({ title: `${clubs.length} club berhasil diimport` });
    } catch (error: any) {
      toast({ title: "Gagal import", description: error.message, variant: "destructive" });
    }

    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  const exportToCSV = () => {
    if (!clubs?.length) return;

    const headers = [
      "id",
      "name",
      "category",
      "description",
      "activities",
      "instagram",
      "email",
      "logo_url",
      "is_active",
      "sort_order",
    ];

    const rows = clubs.map((c) => [
      c.id,
      c.name,
      c.category,
      c.description ?? "",
      (c.activities ?? []).join(";"),
      c.instagram ?? "",
      c.email ?? "",
      c.logo_url ?? "",
      c.is_active ? "true" : "false",
      String(c.sort_order ?? 0),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/\"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fim-clubs-backup-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Export CSV berhasil" });
  };

  const handleEdit = (club: Club) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      category: club.category,
      icon: club.icon,
      logo_url: club.logo_url || "",
      description: club.description || "",
      activities: club.activities.join(", "),
      instagram: club.instagram || "",
      email: club.email || "",
      is_active: club.is_active,
    });
    setIsDialogOpen(true);
  };

  const filteredClubs = clubs?.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const comparison = a.name.localeCompare(b.name, 'id');
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">FIM Club</h1>
          <p className="text-muted-foreground">Kelola data FIM Club</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".csv"
            ref={csvInputRef}
            onChange={handleCSVImport}
            className="hidden"
          />
          <Button variant="outline" onClick={exportToCSV} disabled={!clubs?.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => csvInputRef.current?.click()}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Club
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingClub ? "Edit Club" : "Tambah Club Baru"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Logo Club</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      {formData.logo_url ? (
                        <AvatarImage src={formData.logo_url} alt="Logo" />
                      ) : (
                        <AvatarFallback><Image className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                        Upload Logo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">Max 2MB, format JPG/PNG</p>
                    </div>
                  </div>
                  {formData.logo_url && (
                    <Input
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="URL Logo"
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Club *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Creator Community"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori *</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Kreativitas"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi singkat tentang club..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kegiatan (pisahkan dengan koma)</Label>
                  <Input
                    value={formData.activities}
                    onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                    placeholder="Workshop, Meetup, Sharing session"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Instagram (tanpa @)</Label>
                    <Input
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      placeholder="fimclub_creator"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="club@forumindonesiamuda.org"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Aktif (tampil di website)</Label>
                </div>
                <Button
                  className="w-full"
                  onClick={() =>
                    saveMutation.mutate({
                      ...formData,
                      id: editingClub?.id,
                    })
                  }
                  disabled={saveMutation.isPending || !formData.name.trim() || !formData.category.trim()}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {editingClub ? "Simpan Perubahan" : "Tambah Club"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar FIM Club ({clubs?.length || 0})
          </CardTitle>
          <CardDescription>
            Format CSV: name, category, description, activities (pisah dengan ;), instagram, email, logo_url, is_active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari club..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              title={sortOrder === "asc" ? "Urutkan Z-A" : "Urutkan A-Z"}
            >
              {sortOrder === "asc" ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownZA className="h-4 w-4" />}
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : filteredClubs?.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClubs.map((club) => (
                    <TableRow key={club.id}>
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          {club.logo_url ? (
                            <AvatarImage src={club.logo_url} alt={club.name} />
                          ) : (
                            <AvatarFallback><Users className="h-4 w-4" /></AvatarFallback>
                          )}
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{club.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{club.category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {club.email || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={club.is_active ? "default" : "secondary"}>
                          {club.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(club)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {isSuperAdmin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Club?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Anda yakin ingin menghapus "{club.name}"? Tindakan ini tidak dapat
                                    dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(club)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "Tidak ada club yang cocok" : "Belum ada data club"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
