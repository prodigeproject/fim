import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { usePermission } from "@/hooks/usePermission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Pencil, Trash2, Loader2, MapPin, Upload, Image, FileSpreadsheet, Download, ArrowUpAZ, ArrowDownZA, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Regional {
  id: string;
  name: string;
  province: string;
  island: string;
  logo_url: string | null;
  instagram: string | null;
  email: string | null;
  is_active: boolean;
  sort_order: number;
}

const ISLANDS = [
  "Bali & Nusa Tenggara",
  "Jawa",
  "Kalimantan",
  "Papua",
  "Sulawesi",
  "Sumatra",
];

export default function RegionalsManagement() {
  const { isSuperAdmin, user } = useAdminAuth();
  const { canCreate, canEdit, canDelete } = usePermission("regionals");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [islandFilter, setIslandFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRegional, setEditingRegional] = useState<Regional | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    province: "",
    island: "Jawa",
    logo_url: "",
    instagram: "",
    email: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      province: "",
      island: "Jawa",
      logo_url: "",
      instagram: "",
      email: "",
      is_active: true,
    });
    setEditingRegional(null);
  };

  const { data: regionals, isLoading } = useQuery({
    queryKey: ["admin-fim-regionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fim_regionals")
        .select("*")
        .order("island", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Regional[];
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
      const fileName = `regional-${Date.now()}.${ext}`;
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
        province: data.province.trim(),
        island: data.island,
        logo_url: data.logo_url.trim() || null,
        instagram: data.instagram.trim() || null,
        email: data.email.trim() || null,
        is_active: data.is_active,
      };

      if (data.id) {
        const { error } = await supabase.from("fim_regionals").update(payload).eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("fim_regionals").insert(payload);
        if (error) throw error;
      }

      // Audit log
      await supabase.rpc("log_audit_event", {
        p_action: data.id ? "update_regional" : "create_regional",
        p_resource_type: "fim_regional",
        p_resource_id: data.id || null,
        p_details: { name: data.name },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-fim-regionals"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingRegional ? "Regional berhasil diperbarui" : "Regional berhasil ditambahkan",
      });
    },
    onError: (error) => {
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (regional: Regional) => {
      const { error } = await supabase.from("fim_regionals").delete().eq("id", regional.id);
      if (error) throw error;

      // Audit log
      await supabase.rpc("log_audit_event", {
        p_action: "delete_regional",
        p_resource_type: "fim_regional",
        p_resource_id: regional.id,
        p_details: { name: regional.name },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-fim-regionals"] });
      toast({ title: "Regional berhasil dihapus" });
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
    const requiredHeaders = ["name", "province", "island"];
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
    const regionals = dataRows.map(line => {
      const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || "";
      });
      return {
        name: obj.name || "",
        province: obj.province || "",
        island: obj.island || "Jawa",
        instagram: obj.instagram || null,
        email: obj.email || null,
        logo_url: obj.logo_url || null,
        is_active: obj.is_active !== "false",
      };
    }).filter(r => r.name && r.province && r.island);

    if (regionals.length === 0) {
      toast({ title: "Tidak ada data valid untuk diimport", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("fim_regionals").insert(regionals);
      if (error) throw error;

      await supabase.rpc("log_audit_event", {
        p_action: "import_regionals_csv",
        p_resource_type: "fim_regional",
        p_details: { count: regionals.length },
      });

      queryClient.invalidateQueries({ queryKey: ["admin-fim-regionals"] });
      toast({ title: `${regionals.length} regional berhasil diimport` });
    } catch (error: any) {
      toast({ title: "Gagal import", description: error.message, variant: "destructive" });
    }

    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  const exportToCSV = () => {
    if (!regionals?.length) return;

    const headers = [
      "id",
      "name",
      "province",
      "island",
      "instagram",
      "email",
      "logo_url",
      "is_active",
      "sort_order",
    ];

    const rows = regionals.map((r) => [
      r.id,
      r.name,
      r.province,
      r.island,
      r.instagram ?? "",
      r.email ?? "",
      r.logo_url ?? "",
      r.is_active ? "true" : "false",
      String(r.sort_order ?? 0),
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
    link.download = `fim-regionals-backup-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Export CSV berhasil" });
  };

  const handleEdit = (regional: Regional) => {
    setEditingRegional(regional);
    setFormData({
      name: regional.name,
      province: regional.province,
      island: regional.island,
      logo_url: regional.logo_url || "",
      instagram: regional.instagram || "",
      email: regional.email || "",
      is_active: regional.is_active,
    });
    setIsDialogOpen(true);
  };

  const filteredRegionals = regionals?.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.province.toLowerCase().includes(searchTerm.toLowerCase());
    const matchIsland = islandFilter === "all" || r.island === islandFilter;
    return matchSearch && matchIsland;
  }).sort((a, b) => {
    const comparison = a.name.localeCompare(b.name, 'id');
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Regional FIM</h1>
          <p className="text-muted-foreground">Kelola data Regional FIM</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".csv"
            ref={csvInputRef}
            onChange={handleCSVImport}
            className="hidden"
          />
          {canCreate && (
            <>
              <Button variant="outline" onClick={exportToCSV} disabled={!regionals?.length}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => csvInputRef.current?.click()}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            </>
          )}
          {canCreate && (
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
                  Tambah Regional
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRegional ? "Edit Regional" : "Tambah Regional Baru"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Logo Regional</Label>
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

                <div className="space-y-2">
                  <Label>Nama Regional *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="FIM Jakarta"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provinsi *</Label>
                    <Input
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      placeholder="DKI Jakarta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pulau *</Label>
                    <Select
                      value={formData.island}
                      onValueChange={(v) => setFormData({ ...formData, island: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ISLANDS.map((island) => (
                          <SelectItem key={island} value={island}>
                            {island}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Instagram (tanpa @)</Label>
                    <Input
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      placeholder="fimjakarta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="fimjakarta@fim.org"
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
                  onClick={() => saveMutation.mutate({ ...formData, id: editingRegional?.id })}
                  disabled={
                    saveMutation.isPending || !formData.name.trim() || !formData.province.trim()
                  }
                >
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {editingRegional ? "Simpan Perubahan" : "Tambah Regional"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Daftar Regional ({regionals?.length || 0})
          </CardTitle>
          <CardDescription>
            Format CSV: name, province, island, instagram, email, logo_url, is_active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari regional atau provinsi..."
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
            <Select value={islandFilter} onValueChange={setIslandFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter pulau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Pulau</SelectItem>
                {ISLANDS.map((island) => (
                  <SelectItem key={island} value={island}>
                    {island}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : filteredRegionals?.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Provinsi</TableHead>
                    <TableHead>Pulau</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegionals.map((regional) => (
                    <TableRow key={regional.id}>
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          {regional.logo_url ? (
                            <AvatarImage src={regional.logo_url} alt={regional.name} />
                          ) : (
                            <AvatarFallback><MapPin className="h-4 w-4" /></AvatarFallback>
                          )}
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{regional.name}</TableCell>
                      <TableCell className="text-muted-foreground">{regional.province}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{regional.island}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={regional.is_active ? "default" : "secondary"}>
                          {regional.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {canEdit ? (
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(regional)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" title="Lihat">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Regional?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Anda yakin ingin menghapus "{regional.name}"? Tindakan ini tidak
                                    dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(regional)}
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
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || islandFilter !== "all"
                  ? "Tidak ada regional yang cocok"
                  : "Belum ada data regional"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
