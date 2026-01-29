import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Video,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowUp,
  ArrowDown,
  Play,
  ExternalLink,
  Eye,
} from "lucide-react";

interface FeaturedVideo {
  id: string;
  title: string;
  youtube_id: string;
  description: string | null;
  thumbnail_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export default function FeaturedVideosManagement() {
  const queryClient = useQueryClient();
  const { canCreate, canEdit, canDelete } = usePermission("featured_videos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<FeaturedVideo | null>(null);
  const [deleteVideo, setDeleteVideo] = useState<FeaturedVideo | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    youtube_id: "",
    description: "",
    thumbnail_url: "",
    is_active: true,
  });

  // Real-time updates for featured videos
  useEffect(() => {
    const channel = supabase
      .channel("admin-featured-videos-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "featured_videos",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-featured-videos"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: videos, isLoading } = useQuery({
    queryKey: ["admin-featured-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_videos")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as FeaturedVideo[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const maxOrder = videos?.length ? Math.max(...videos.map(v => v.sort_order)) + 1 : 0;
      const { error } = await supabase
        .from("featured_videos")
        .insert({ ...data, sort_order: maxOrder });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Video berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["admin-featured-videos"] });
      resetForm();
    },
    onError: () => toast.error("Gagal menambahkan video"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("featured_videos")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Video berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["admin-featured-videos"] });
      resetForm();
    },
    onError: () => toast.error("Gagal memperbarui video"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("featured_videos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Video berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["admin-featured-videos"] });
      setDeleteVideo(null);
    },
    onError: () => toast.error("Gagal menghapus video"),
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      if (!videos) return;
      const index = videos.findIndex(v => v.id === id);
      if (index === -1) return;
      
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= videos.length) return;
      
      const current = videos[index];
      const swapWith = videos[newIndex];
      
      await supabase.from("featured_videos").update({ sort_order: swapWith.sort_order }).eq("id", current.id);
      await supabase.from("featured_videos").update({ sort_order: current.sort_order }).eq("id", swapWith.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-featured-videos"] });
    },
  });

  const resetForm = () => {
    setFormData({ title: "", youtube_id: "", description: "", thumbnail_url: "", is_active: true });
    setEditingVideo(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (video: FeaturedVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      youtube_id: video.youtube_id,
      description: video.description || "",
      thumbnail_url: video.thumbnail_url || "",
      is_active: video.is_active,
    });
    setIsDialogOpen(true);
  };

  const extractYouTubeId = (url: string): string => {
    // If already an ID, return it
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    
    // Extract from various YouTube URL formats
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
    return match ? match[1] : url;
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.youtube_id) {
      toast.error("Judul dan YouTube ID wajib diisi");
      return;
    }

    const submitData = {
      ...formData,
      youtube_id: extractYouTubeId(formData.youtube_id),
    };

    if (editingVideo) {
      updateMutation.mutate({ id: editingVideo.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const getYouTubeThumbnail = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6" />
            Manajemen Video Featured
          </h1>
          <p className="text-muted-foreground">Kelola video pilihan di homepage</p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Video
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Video ({videos?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : videos?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Urutan</TableHead>
                  <TableHead className="w-32">Thumbnail</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>YouTube ID</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-32">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video, index) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === 0}
                          onClick={() => reorderMutation.mutate({ id: video.id, direction: "up" })}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === videos.length - 1}
                          onClick={() => reorderMutation.mutate({ id: video.id, direction: "down" })}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative group">
                        <img
                          src={video.thumbnail_url || getYouTubeThumbnail(video.youtube_id)}
                          alt={video.title}
                          className="h-16 w-28 object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">{video.title}</TableCell>
                    <TableCell>
                      <a
                        href={`https://youtube.com/watch?v=${video.youtube_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-sm"
                      >
                        {video.youtube_id}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${video.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {video.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {canEdit ? (
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(video)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" title="Lihat">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="icon" onClick={() => setDeleteVideo(video)}>
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
            <div className="text-center py-8 text-muted-foreground">
              Belum ada video featured
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVideo ? "Edit Video" : "Tambah Video"}</DialogTitle>
            <DialogDescription>
              {editingVideo ? "Perbarui informasi video" : "Tambahkan video baru ke homepage"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Judul *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Judul video"
              />
            </div>
            
            <div>
              <Label>YouTube URL atau ID *</Label>
              <Input
                value={formData.youtube_id}
                onChange={(e) => setFormData({ ...formData, youtube_id: e.target.value })}
                placeholder="https://youtube.com/watch?v=... atau ID video"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Masukkan URL YouTube atau ID video (11 karakter)
              </p>
            </div>
            
            <div>
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi singkat video"
                rows={3}
              />
            </div>
            
            <div>
              <Label>Custom Thumbnail URL (opsional)</Label>
              <Input
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="https://... (kosongkan untuk thumbnail YouTube default)"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Aktif</Label>
            </div>

            {formData.youtube_id && (
              <div>
                <Label className="mb-2 block">Preview</Label>
                <img
                  src={formData.thumbnail_url || getYouTubeThumbnail(extractYouTubeId(formData.youtube_id))}
                  alt="Preview"
                  className="h-32 w-56 object-cover rounded bg-muted"
                />
              </div>
            )}
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
              {editingVideo ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteVideo} onOpenChange={() => setDeleteVideo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Video?</AlertDialogTitle>
            <AlertDialogDescription>
              Video "{deleteVideo?.title}" akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteVideo && deleteMutation.mutate(deleteVideo.id)}
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