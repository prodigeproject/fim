import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Users, 
  Video, 
  GraduationCap,
  Loader2,
  User,
  ArrowUpAZ,
  ArrowDownZA,
  CalendarArrowUp,
  CalendarArrowDown
} from "lucide-react";
import { ImageUploader, uploadImageToStorage } from "@/components/admin/ImageUploader";

const sectors = ["Pendidikan", "Sosial", "Teknologi", "Kesehatan", "Lingkungan", "Bisnis", "Internasional"];

interface AlumniStory {
  id: string;
  name: string;
  batch: string;
  sector: string;
  position: string | null;
  company: string | null;
  photo_url: string | null;
  quote: string | null;
  story: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string | null;
}

interface AlumniOther {
  id: string;
  name: string;
  batch: string;
  track_record: string | null;
  photo_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string | null;
}

interface VideoTestimonial {
  id: string;
  youtube_id: string;
  title: string;
  thumbnail_url: string | null;
  speaker: string | null;
  is_active: boolean;
  sort_order: number;
}

export default function AlumniManagement() {
  const { user, isSuperAdmin } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"name" | "created_at">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Dialog states
  const [storyDialog, setStoryDialog] = useState(false);
  const [otherDialog, setOtherDialog] = useState(false);
  const [videoDialog, setVideoDialog] = useState(false);
  
  const [editingStory, setEditingStory] = useState<AlumniStory | null>(null);
  const [editingOther, setEditingOther] = useState<AlumniOther | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoTestimonial | null>(null);
  
  // Form states
  const [storyForm, setStoryForm] = useState({
    name: "", batch: "", sector: "Pendidikan", position: "", company: "", 
    photo_url: "", quote: "", story: "", is_active: true, sort_order: 0
  });
  
  const [otherForm, setOtherForm] = useState({
    name: "", batch: "", track_record: "", photo_url: "", is_active: true, sort_order: 0
  });
  
  const [videoForm, setVideoForm] = useState({
    youtube_id: "", title: "", thumbnail_url: "", speaker: "", is_active: true, sort_order: 0
  });

  // Fetch alumni stories
  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ["alumni-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alumni_stories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as AlumniStory[];
    },
  });

  // Fetch other alumni
  const { data: otherAlumni, isLoading: otherLoading } = useQuery({
    queryKey: ["alumni-other"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alumni_other")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as AlumniOther[];
    },
  });

  // Fetch video testimonials
  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["video-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_testimonials")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as VideoTestimonial[];
    },
  });

  // Mutations
  const storyMutation = useMutation({
    mutationFn: async (data: typeof storyForm & { id?: string }) => {
      if (editingStory) {
        const { error } = await supabase
          .from("alumni_stories")
          .update(data)
          .eq("id", editingStory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("alumni_stories").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-stories"] });
      setStoryDialog(false);
      setEditingStory(null);
      resetStoryForm();
      toast({ title: `Cerita alumni berhasil ${editingStory ? "diperbarui" : "ditambahkan"}` });
    },
    onError: (error: any) => {
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    },
  });

  const otherMutation = useMutation({
    mutationFn: async (data: typeof otherForm & { id?: string }) => {
      if (editingOther) {
        const { error } = await supabase
          .from("alumni_other")
          .update(data)
          .eq("id", editingOther.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("alumni_other").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-other"] });
      setOtherDialog(false);
      setEditingOther(null);
      resetOtherForm();
      toast({ title: `Alumni berhasil ${editingOther ? "diperbarui" : "ditambahkan"}` });
    },
    onError: (error: any) => {
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    },
  });

  const videoMutation = useMutation({
    mutationFn: async (data: typeof videoForm & { id?: string }) => {
      if (editingVideo) {
        const { error } = await supabase
          .from("video_testimonials")
          .update(data)
          .eq("id", editingVideo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("video_testimonials").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-testimonials"] });
      setVideoDialog(false);
      setEditingVideo(null);
      resetVideoForm();
      toast({ title: `Video berhasil ${editingVideo ? "diperbarui" : "ditambahkan"}` });
    },
    onError: (error: any) => {
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    },
  });

  const deleteStoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alumni_stories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-stories"] });
      toast({ title: "Cerita alumni berhasil dihapus" });
    },
  });

  const deleteOtherMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alumni_other").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-other"] });
      toast({ title: "Alumni berhasil dihapus" });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("video_testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-testimonials"] });
      toast({ title: "Video berhasil dihapus" });
    },
  });

  const resetStoryForm = () => {
    setStoryForm({ name: "", batch: "", sector: "Pendidikan", position: "", company: "", photo_url: "", quote: "", story: "", is_active: true, sort_order: 0 });
  };

  const resetOtherForm = () => {
    setOtherForm({ name: "", batch: "", track_record: "", photo_url: "", is_active: true, sort_order: 0 });
  };

  const resetVideoForm = () => {
    setVideoForm({ youtube_id: "", title: "", thumbnail_url: "", speaker: "", is_active: true, sort_order: 0 });
  };

  const openEditStory = (story: AlumniStory) => {
    setEditingStory(story);
    setStoryForm({
      name: story.name,
      batch: story.batch,
      sector: story.sector,
      position: story.position || "",
      company: story.company || "",
      photo_url: story.photo_url || "",
      quote: story.quote || "",
      story: story.story || "",
      is_active: story.is_active,
      sort_order: story.sort_order,
    });
    setStoryDialog(true);
  };

  const openEditOther = (alumni: AlumniOther) => {
    setEditingOther(alumni);
    setOtherForm({
      name: alumni.name,
      batch: alumni.batch,
      track_record: alumni.track_record || "",
      photo_url: alumni.photo_url || "",
      is_active: alumni.is_active,
      sort_order: alumni.sort_order,
    });
    setOtherDialog(true);
  };

  const openEditVideo = (video: VideoTestimonial) => {
    setEditingVideo(video);
    setVideoForm({
      youtube_id: video.youtube_id,
      title: video.title,
      thumbnail_url: video.thumbnail_url || "",
      speaker: video.speaker || "",
      is_active: video.is_active,
      sort_order: video.sort_order,
    });
    setVideoDialog(true);
  };

  const filteredStories = stories?.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.batch.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortField === "name") {
      const comparison = a.name.localeCompare(b.name, 'id');
      return sortOrder === "asc" ? comparison : -comparison;
    } else {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }
  });

  const filteredOther = otherAlumni?.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.batch.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortField === "name") {
      const comparison = a.name.localeCompare(b.name, 'id');
      return sortOrder === "asc" ? comparison : -comparison;
    } else {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Alumni</h1>
          <p className="text-muted-foreground">Kelola cerita alumni, daftar alumni, dan video testimoni</p>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari alumni..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (sortField === "name") {
              setSortOrder(prev => prev === "asc" ? "desc" : "asc");
            } else {
              setSortField("name");
              setSortOrder("asc");
            }
          }}
          title={sortField === "name" ? (sortOrder === "asc" ? "Urutkan Z-A" : "Urutkan A-Z") : "Urutkan berdasarkan nama"}
          className={sortField === "name" ? "bg-primary/10" : ""}
        >
          {sortOrder === "asc" ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownZA className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (sortField === "created_at") {
              setSortOrder(prev => prev === "asc" ? "desc" : "asc");
            } else {
              setSortField("created_at");
              setSortOrder("desc");
            }
          }}
          title={sortField === "created_at" ? (sortOrder === "asc" ? "Terlama" : "Terbaru") : "Urutkan berdasarkan tanggal"}
          className={sortField === "created_at" ? "bg-primary/10" : ""}
        >
          {sortOrder === "asc" ? <CalendarArrowUp className="h-4 w-4" /> : <CalendarArrowDown className="h-4 w-4" />}
        </Button>
      </div>

      <Tabs defaultValue="stories">
        <TabsList>
          <TabsTrigger value="stories" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Cerita Alumni ({stories?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="other" className="gap-2">
            <Users className="h-4 w-4" />
            Alumni Lainnya ({otherAlumni?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Video className="h-4 w-4" />
            Video Testimoni ({videos?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Cerita Alumni Tab */}
        <TabsContent value="stories" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { resetStoryForm(); setEditingStory(null); setStoryDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Cerita
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              {storiesLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
              ) : filteredStories?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Foto</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Angkatan</TableHead>
                      <TableHead>Sektor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStories.map((story) => (
                      <TableRow key={story.id}>
                        <TableCell>
                          {story.photo_url ? (
                            <img src={story.photo_url} alt={story.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{story.name}</TableCell>
                        <TableCell>{story.batch}</TableCell>
                        <TableCell><Badge variant="secondary">{story.sector}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={story.is_active ? "default" : "outline"}>
                            {story.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditStory(story)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {isSuperAdmin && (
                              <Button variant="ghost" size="sm" onClick={() => deleteStoryMutation.mutate(story.id)}>
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
                <div className="text-center py-12 text-muted-foreground">Belum ada cerita alumni</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alumni Lainnya Tab */}
        <TabsContent value="other" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { resetOtherForm(); setEditingOther(null); setOtherDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Alumni
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              {otherLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
              ) : filteredOther?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Foto</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Angkatan</TableHead>
                      <TableHead>Track Record</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOther.map((alumni) => (
                      <TableRow key={alumni.id}>
                        <TableCell>
                          {alumni.photo_url ? (
                            <img src={alumni.photo_url} alt={alumni.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{alumni.name}</TableCell>
                        <TableCell>{alumni.batch}</TableCell>
                        <TableCell className="max-w-xs truncate">{alumni.track_record}</TableCell>
                        <TableCell>
                          <Badge variant={alumni.is_active ? "default" : "outline"}>
                            {alumni.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditOther(alumni)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {isSuperAdmin && (
                              <Button variant="ghost" size="sm" onClick={() => deleteOtherMutation.mutate(alumni.id)}>
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
                <div className="text-center py-12 text-muted-foreground">Belum ada data alumni</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Testimoni Tab */}
        <TabsContent value="videos" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { resetVideoForm(); setEditingVideo(null); setVideoDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Video
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              {videosLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
              ) : videos?.length ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((video) => (
                    <Card key={video.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted relative">
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                        ) : (
                          <img 
                            src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} 
                            alt={video.title} 
                            className="w-full h-full object-cover" 
                          />
                        )}
                        {!video.is_active && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="secondary">Nonaktif</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                        <p className="text-xs text-muted-foreground">{video.speaker}</p>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditVideo(video)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          {isSuperAdmin && (
                            <Button variant="destructive" size="sm" onClick={() => deleteVideoMutation.mutate(video.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">Belum ada video testimoni</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Story Dialog */}
      <Dialog open={storyDialog} onOpenChange={setStoryDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStory ? "Edit Cerita Alumni" : "Tambah Cerita Alumni"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nama *</Label>
                <Input value={storyForm.name} onChange={(e) => setStoryForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <Label>Angkatan *</Label>
                <Input placeholder="FIM 10" value={storyForm.batch} onChange={(e) => setStoryForm(p => ({ ...p, batch: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sektor *</Label>
                <Select value={storyForm.sector} onValueChange={(v) => setStoryForm(p => ({ ...p, sector: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Posisi</Label>
                <Input value={storyForm.position} onChange={(e) => setStoryForm(p => ({ ...p, position: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Perusahaan/Lokasi</Label>
              <Input value={storyForm.company} onChange={(e) => setStoryForm(p => ({ ...p, company: e.target.value }))} />
            </div>
            <div>
              <Label>URL Foto</Label>
              <Input placeholder="https://..." value={storyForm.photo_url} onChange={(e) => setStoryForm(p => ({ ...p, photo_url: e.target.value }))} />
            </div>
            <div>
              <Label>Quote</Label>
              <Textarea value={storyForm.quote} onChange={(e) => setStoryForm(p => ({ ...p, quote: e.target.value }))} />
            </div>
            <div>
              <Label>Dampak/Story</Label>
              <Input placeholder="500+ siswa terbantu" value={storyForm.story} onChange={(e) => setStoryForm(p => ({ ...p, story: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={storyForm.is_active} onCheckedChange={(c) => setStoryForm(p => ({ ...p, is_active: c }))} />
              <Label>Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStoryDialog(false)}>Batal</Button>
            <Button onClick={() => storyMutation.mutate(storyForm)} disabled={storyMutation.isPending}>
              {storyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Other Alumni Dialog */}
      <Dialog open={otherDialog} onOpenChange={setOtherDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOther ? "Edit Alumni" : "Tambah Alumni"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Nama *</Label>
              <Input value={otherForm.name} onChange={(e) => setOtherForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label>Angkatan *</Label>
              <Input placeholder="FIM 10" value={otherForm.batch} onChange={(e) => setOtherForm(p => ({ ...p, batch: e.target.value }))} />
            </div>
            <div>
              <Label>Track Record</Label>
              <Textarea value={otherForm.track_record} onChange={(e) => setOtherForm(p => ({ ...p, track_record: e.target.value }))} />
            </div>
            <div>
              <Label>URL Foto</Label>
              <Input placeholder="https://..." value={otherForm.photo_url} onChange={(e) => setOtherForm(p => ({ ...p, photo_url: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={otherForm.is_active} onCheckedChange={(c) => setOtherForm(p => ({ ...p, is_active: c }))} />
              <Label>Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOtherDialog(false)}>Batal</Button>
            <Button onClick={() => otherMutation.mutate(otherForm)} disabled={otherMutation.isPending}>
              {otherMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={videoDialog} onOpenChange={setVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVideo ? "Edit Video" : "Tambah Video"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>YouTube Video ID *</Label>
              <Input placeholder="dQw4w9WgXcQ" value={videoForm.youtube_id} onChange={(e) => setVideoForm(p => ({ ...p, youtube_id: e.target.value }))} />
              <p className="text-xs text-muted-foreground mt-1">ID dari URL YouTube (bagian setelah v=)</p>
            </div>
            <div>
              <Label>Judul *</Label>
              <Input value={videoForm.title} onChange={(e) => setVideoForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <Label>Speaker</Label>
              <Input placeholder="Alumni FIM 10" value={videoForm.speaker} onChange={(e) => setVideoForm(p => ({ ...p, speaker: e.target.value }))} />
            </div>
            <div>
              <Label>URL Thumbnail (opsional)</Label>
              <Input placeholder="https://..." value={videoForm.thumbnail_url} onChange={(e) => setVideoForm(p => ({ ...p, thumbnail_url: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={videoForm.is_active} onCheckedChange={(c) => setVideoForm(p => ({ ...p, is_active: c }))} />
              <Label>Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVideoDialog(false)}>Batal</Button>
            <Button onClick={() => videoMutation.mutate(videoForm)} disabled={videoMutation.isPending}>
              {videoMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

