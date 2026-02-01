import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  Handshake,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ExternalLink,
  Loader2,
  ArrowUp,
  ArrowDown,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

// Import static partner logos for seeding
import logo1 from "@/assets/partners/logo-1.png";
import logo2 from "@/assets/partners/logo-2.png";
import logo3 from "@/assets/partners/logo-3.png";
import logo4 from "@/assets/partners/logo-4.png";
import logo5 from "@/assets/partners/logo-5.png";
import logo6 from "@/assets/partners/logo-6.jpg";
import logo7 from "@/assets/partners/logo-7.png";
import logo8 from "@/assets/partners/logo-8.png";
import logo9 from "@/assets/partners/logo-9.png";
import logo10 from "@/assets/partners/logo-10.png";
import logo11 from "@/assets/partners/logo-11.png";
import logo12 from "@/assets/partners/logo-12.png";
import logo13 from "@/assets/partners/logo-13.jpg";
import logo14 from "@/assets/partners/logo-14.jpg";
import logo15 from "@/assets/partners/logo-15.png";
import logo16 from "@/assets/partners/logo-16.png";
import logo17 from "@/assets/partners/logo-17.png";
import logo18 from "@/assets/partners/logo-18.jpg";
import logo19 from "@/assets/partners/logo-19.jpg";
import logo20 from "@/assets/partners/logo-20.jpg";
import logo21 from "@/assets/partners/logo-21.jpg";
import logo22 from "@/assets/partners/logo-22.png";
import logo23 from "@/assets/partners/logo-23.jpg";
import logo24 from "@/assets/partners/logo-24.jpg";
import logo25 from "@/assets/partners/logo-25.jpg";
import logo26 from "@/assets/partners/logo-26.png";
import logo27 from "@/assets/partners/logo-27.png";
import logo28 from "@/assets/partners/logo-28.png";
import logo29 from "@/assets/partners/logo-29.png";

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  sort_order: number;
  is_active: boolean;
}

const staticPartners = [
  { name: "Mitra 1", logo_url: logo1 },
  { name: "Mitra 2", logo_url: logo2 },
  { name: "Mitra 3", logo_url: logo3 },
  { name: "Mitra 4", logo_url: logo4 },
  { name: "Mitra 5", logo_url: logo5 },
  { name: "Mitra 6", logo_url: logo6 },
  { name: "Mitra 7", logo_url: logo7 },
  { name: "Mitra 8", logo_url: logo8 },
  { name: "Mitra 9", logo_url: logo9 },
  { name: "Mitra 10", logo_url: logo10 },
  { name: "Mitra 11", logo_url: logo11 },
  { name: "Mitra 12", logo_url: logo12 },
  { name: "Mitra 13", logo_url: logo13 },
  { name: "Mitra 14", logo_url: logo14 },
  { name: "Mitra 15", logo_url: logo15 },
  { name: "Mitra 16", logo_url: logo16 },
  { name: "Mitra 17", logo_url: logo17 },
  { name: "Mitra 18", logo_url: logo18 },
  { name: "Mitra 19", logo_url: logo19 },
  { name: "Mitra 20", logo_url: logo20 },
  { name: "Mitra 21", logo_url: logo21 },
  { name: "Mitra 22", logo_url: logo22 },
  { name: "Mitra 23", logo_url: logo23 },
  { name: "Mitra 24", logo_url: logo24 },
  { name: "Mitra 25", logo_url: logo25 },
  { name: "Mitra 26", logo_url: logo26 },
  { name: "Mitra 27", logo_url: logo27 },
  { name: "Mitra 28", logo_url: logo28 },
  { name: "Mitra 29", logo_url: logo29 },
];

export default function PartnersManagement() {
  const queryClient = useQueryClient();
  const { canCreate, canEdit, canDelete } = usePermission("partners");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deletePartner, setDeletePartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    website_url: "",
    is_active: true,
  });
  
  // Drag and drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  const { data: partners, isLoading } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_logos")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Partner[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const maxOrder = partners?.length ? Math.max(...partners.map(p => p.sort_order)) + 1 : 0;
      const { error } = await supabase
        .from("partner_logos")
        .insert({ ...data, sort_order: maxOrder });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mitra berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-partners"] });
      resetForm();
    },
    onError: () => toast.error("Gagal menambahkan mitra"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("partner_logos")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mitra berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-partners"] });
      resetForm();
    },
    onError: () => toast.error("Gagal memperbarui mitra"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("partner_logos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mitra berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-partners"] });
      setDeletePartner(null);
    },
    onError: () => toast.error("Gagal menghapus mitra"),
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ fromId, toId }: { fromId: string; toId: string }) => {
      if (!partners) return;
      
      const fromIndex = partners.findIndex(p => p.id === fromId);
      const toIndex = partners.findIndex(p => p.id === toId);
      
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
      
      // Create new order
      const newPartners = [...partners];
      const [removed] = newPartners.splice(fromIndex, 1);
      newPartners.splice(toIndex, 0, removed);
      
      // Update all sort_orders
      const updates = newPartners.map((partner, index) => ({
        id: partner.id,
        sort_order: index,
      }));
      
      for (const update of updates) {
        await supabase.from("partner_logos").update({ sort_order: update.sort_order }).eq("id", update.id);
      }
    },
    onSuccess: () => {
      toast.success("Urutan berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-partners"] });
    },
    onError: () => toast.error("Gagal memperbarui urutan"),
  });

  // Seed mutation to import static logos
  const seedMutation = useMutation({
    mutationFn: async () => {
      const insertData = staticPartners.map((partner, index) => ({
        name: partner.name,
        logo_url: partner.logo_url,
        sort_order: index,
        is_active: true,
      }));
      
      const { error } = await supabase.from("partner_logos").insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${staticPartners.length} mitra berhasil diimpor`);
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-partners"] });
    },
    onError: (error) => {
      console.error("Seed error:", error);
      toast.error("Gagal mengimpor mitra");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", logo_url: "", website_url: "", is_active: true });
    setEditingPartner(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      logo_url: partner.logo_url,
      website_url: partner.website_url || "",
      is_active: partner.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.logo_url) {
      toast.error("Nama dan logo wajib diisi");
      return;
    }

    if (editingPartner) {
      updateMutation.mutate({ id: editingPartner.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, toId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== toId) {
      reorderMutation.mutate({ fromId: draggedId, toId });
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleImageError = (id: string) => {
    setImageLoadErrors(prev => new Set(prev).add(id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Handshake className="h-6 w-6" />
            Manajemen Mitra
          </h1>
          <p className="text-muted-foreground">Kelola logo mitra kerjasama di homepage</p>
        </div>
        <div className="flex gap-2">
          {canCreate && partners?.length === 0 && (
            <Button 
              variant="outline" 
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
            >
              {seedMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Import Logo Statis
            </Button>
          )}
          {canCreate && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Mitra
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Mitra ({partners?.length || 0})</CardTitle>
          <p className="text-sm text-muted-foreground">
            Drag & drop baris untuk mengubah urutan tampilan
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-12 w-16 rounded" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : partners?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-20">Logo</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-32">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow 
                    key={partner.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, partner.id)}
                    onDragOver={(e) => handleDragOver(e, partner.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, partner.id)}
                    onDragEnd={handleDragEnd}
                    className={`cursor-move transition-colors ${
                      draggedId === partner.id ? "opacity-50" : ""
                    } ${dragOverId === partner.id ? "bg-primary/10 border-primary" : ""}`}
                  >
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-12 w-16 bg-muted rounded flex items-center justify-center overflow-hidden">
                        {imageLoadErrors.has(partner.id) ? (
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        ) : (
                          <img
                            src={partner.logo_url}
                            alt={partner.name}
                            loading="lazy"
                            className="max-h-full max-w-full object-contain"
                            onError={() => handleImageError(partner.id)}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell>
                      {partner.website_url ? (
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Link
                        </a>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${partner.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {partner.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {canEdit ? (
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(partner)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" title="Lihat">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="icon" onClick={() => setDeletePartner(partner)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Belum ada data mitra</p>
              <Button 
                variant="outline" 
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
              >
                {seedMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Import Logo Statis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPartner ? "Edit Mitra" : "Tambah Mitra"}</DialogTitle>
            <DialogDescription>
              {editingPartner ? "Perbarui informasi mitra" : "Tambahkan mitra baru ke homepage"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Nama Mitra *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama perusahaan/organisasi"
              />
            </div>
            
            <div>
              <Label>Logo *</Label>
              <ImageUploader
                bucket="partner-logos"
                value={formData.logo_url}
                onChange={(url) => setFormData({ ...formData, logo_url: url })}
              />
            </div>
            
            <div>
              <Label>Website URL</Label>
              <Input
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Aktif</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Batal</Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingPartner ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePartner} onOpenChange={() => setDeletePartner(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Mitra?</AlertDialogTitle>
            <AlertDialogDescription>
              Mitra "{deletePartner?.name}" akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePartner && deleteMutation.mutate(deletePartner.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
