import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Club {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string | null;
  activities: string[];
  instagram: string | null;
  email: string | null;
  is_active: boolean;
  sort_order: number;
}

export default function ClubsManagement() {
  const { isSuperAdmin } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    icon: "Users",
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

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        name: data.name.trim(),
        category: data.category.trim(),
        icon: data.icon,
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
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fim_clubs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-fim-clubs"] });
      toast({ title: "Club berhasil dihapus" });
    },
    onError: (error) => {
      toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (club: Club) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      category: club.category,
      icon: club.icon,
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
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">FIM Club</h1>
          <p className="text-muted-foreground">Kelola data FIM Club</p>
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
              Tambah Club
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClub ? "Edit Club" : "Tambah Club Baru"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar FIM Club ({clubs?.length || 0})
          </CardTitle>
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
                                    onClick={() => deleteMutation.mutate(club.id)}
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
