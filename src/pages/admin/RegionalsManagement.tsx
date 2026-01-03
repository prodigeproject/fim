import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Plus, Pencil, Trash2, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Regional {
  id: string;
  name: string;
  province: string;
  island: string;
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
  const { isSuperAdmin } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [islandFilter, setIslandFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRegional, setEditingRegional] = useState<Regional | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    province: "",
    island: "Jawa",
    instagram: "",
    email: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      province: "",
      island: "Jawa",
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

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        name: data.name.trim(),
        province: data.province.trim(),
        island: data.island,
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
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fim_regionals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-fim-regionals"] });
      toast({ title: "Regional berhasil dihapus" });
    },
    onError: (error) => {
      toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (regional: Regional) => {
    setEditingRegional(regional);
    setFormData({
      name: regional.name,
      province: regional.province,
      island: regional.island,
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
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Regional FIM</h1>
          <p className="text-muted-foreground">Kelola data Regional FIM</p>
        </div>
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingRegional ? "Edit Regional" : "Tambah Regional Baru"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Daftar Regional ({regionals?.length || 0})
          </CardTitle>
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
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(regional)}>
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
                                  <AlertDialogTitle>Hapus Regional?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Anda yakin ingin menghapus "{regional.name}"? Tindakan ini tidak
                                    dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(regional.id)}
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
