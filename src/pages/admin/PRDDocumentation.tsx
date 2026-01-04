import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Shield,
  Tag,
  Calendar,
  ArrowUpDown,
  Loader2,
} from "lucide-react";

const statusIcons: Record<string, React.ElementType> = {
  planned: Clock,
  in_progress: AlertCircle,
  completed: CheckCircle2,
  cancelled: XCircle,
};

const statusColors: Record<string, string> = {
  planned: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const categoryLabels: Record<string, string> = {
  feature: "Fitur",
  bug: "Bug Fix",
  enhancement: "Enhancement",
  backlog: "Backlog",
};

interface PRDDocument {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  version: string | null;
  content: string | null;
  created_by: string | null;
  assigned_to: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PRDChangelog {
  id: string;
  version: string;
  title: string;
  description: string | null;
  changes: { type: string; description: string }[];
  release_date: string | null;
  created_by: string | null;
  created_at: string;
}

export default function PRDDocumentation() {
  const { isSuperAdmin, user } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  const [isChangelogDialogOpen, setIsChangelogDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<PRDDocument | null>(null);
  const [editingChangelog, setEditingChangelog] = useState<PRDChangelog | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "feature",
    status: "planned",
    priority: "medium",
    version: "",
    content: "",
    due_date: "",
  });

  const [changelogData, setChangelogData] = useState({
    version: "",
    title: "",
    description: "",
    changes: "",
    release_date: "",
  });

  // Fetch PRD documents
  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ["prd-documents", statusFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("prd_documents")
        .select("*")
        .order("created_at", { ascending: sortOrder === "asc" });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PRDDocument[];
    },
    enabled: isSuperAdmin,
  });

  // Fetch changelog
  const { data: changelog, isLoading: changelogLoading } = useQuery({
    queryKey: ["prd-changelog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prd_changelog")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PRDChangelog[];
    },
    enabled: isSuperAdmin,
  });

  // Save document mutation
  const saveDocMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        due_date: data.due_date || null,
        created_by: user?.id,
      };

      if (editingDoc) {
        const { error } = await supabase
          .from("prd_documents")
          .update(payload)
          .eq("id", editingDoc.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("prd_documents").insert(payload);
        if (error) throw error;
      }

      // Log audit
      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: editingDoc ? "edit_prd_document" : "create_prd_document",
        p_resource_type: "prd_document",
        p_details: { title: data.title },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prd-documents"] });
      setIsDocDialogOpen(false);
      setEditingDoc(null);
      resetForm();
      toast({ title: `Dokumen berhasil ${editingDoc ? "diperbarui" : "dibuat"}` });
    },
    onError: (error) => {
      toast({ title: "Gagal menyimpan dokumen", description: error.message, variant: "destructive" });
    },
  });

  // Save changelog mutation
  const saveChangelogMutation = useMutation({
    mutationFn: async (data: typeof changelogData) => {
      const changes = data.changes.split("\n").filter(Boolean).map((c) => ({
        type: "change",
        description: c.trim(),
      }));

      const payload = {
        version: data.version,
        title: data.title,
        description: data.description || null,
        changes,
        release_date: data.release_date || null,
        created_by: user?.id,
      };

      if (editingChangelog) {
        const { error } = await supabase
          .from("prd_changelog")
          .update(payload)
          .eq("id", editingChangelog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("prd_changelog").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prd-changelog"] });
      setIsChangelogDialogOpen(false);
      setEditingChangelog(null);
      resetChangelogForm();
      toast({ title: `Changelog berhasil ${editingChangelog ? "diperbarui" : "dibuat"}` });
    },
    onError: (error) => {
      toast({ title: "Gagal menyimpan changelog", description: error.message, variant: "destructive" });
    },
  });

  // Delete document mutation
  const deleteDocMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prd_documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prd-documents"] });
      toast({ title: "Dokumen berhasil dihapus" });
    },
  });

  // Delete changelog mutation
  const deleteChangelogMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prd_changelog").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prd-changelog"] });
      toast({ title: "Changelog berhasil dihapus" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "feature",
      status: "planned",
      priority: "medium",
      version: "",
      content: "",
      due_date: "",
    });
  };

  const resetChangelogForm = () => {
    setChangelogData({
      version: "",
      title: "",
      description: "",
      changes: "",
      release_date: "",
    });
  };

  const openEditDoc = (doc: PRDDocument) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      description: doc.description || "",
      category: doc.category,
      status: doc.status,
      priority: doc.priority || "medium",
      version: doc.version || "",
      content: doc.content || "",
      due_date: doc.due_date?.split("T")[0] || "",
    });
    setIsDocDialogOpen(true);
  };

  const openEditChangelog = (log: PRDChangelog) => {
    setEditingChangelog(log);
    setChangelogData({
      version: log.version,
      title: log.title,
      description: log.description || "",
      changes: log.changes?.map((c: any) => c.description).join("\n") || "",
      release_date: log.release_date?.split("T")[0] || "",
    });
    setIsChangelogDialogOpen(true);
  };

  // Filter documents
  const filteredDocs = documents?.filter((doc) => {
    if (!searchTerm) return true;
    return (
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Stats
  const stats = {
    total: documents?.length || 0,
    planned: documents?.filter((d) => d.status === "planned").length || 0,
    in_progress: documents?.filter((d) => d.status === "in_progress").length || 0,
    completed: documents?.filter((d) => d.status === "completed").length || 0,
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
        <p className="text-muted-foreground">
          Halaman ini hanya untuk Developer / Super Admin
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📋 PRD & Dokumentasi</h1>
        <p className="text-muted-foreground">
          Lacak kebutuhan, status fitur, backlog, dan changelog pengembangan
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planned</p>
                <p className="text-2xl font-bold">{stats.planned}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.in_progress}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">Dokumen PRD</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {/* Filters & Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari dokumen..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="feature">Fitur</SelectItem>
                <SelectItem value="bug">Bug Fix</SelectItem>
                <SelectItem value="enhancement">Enhancement</SelectItem>
                <SelectItem value="backlog">Backlog</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <Dialog open={isDocDialogOpen} onOpenChange={(open) => {
              setIsDocDialogOpen(open);
              if (!open) {
                setEditingDoc(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Dokumen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingDoc ? "Edit Dokumen" : "Tambah Dokumen PRD"}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveDocMutation.mutate(formData);
                  }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Judul *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="version">Versi</Label>
                      <Input
                        id="version"
                        placeholder="v1.0.0"
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(v) => setFormData({ ...formData, category: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feature">Fitur</SelectItem>
                          <SelectItem value="bug">Bug Fix</SelectItem>
                          <SelectItem value="enhancement">Enhancement</SelectItem>
                          <SelectItem value="backlog">Backlog</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(v) => setFormData({ ...formData, status: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Prioritas</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(v) => setFormData({ ...formData, priority: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date">Target Selesai</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Konten / Detail</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={6}
                      placeholder="Detail spesifikasi, acceptance criteria, dll..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDocDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={saveDocMutation.isPending}>
                      {saveDocMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Simpan
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Documents Table */}
          <Card>
            <CardContent className="pt-6">
              {docsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : filteredDocs?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioritas</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocs.map((doc) => {
                      const StatusIcon = statusIcons[doc.status] || Clock;
                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              {doc.description && (
                                <p className="text-sm text-muted-foreground truncate max-w-xs">
                                  {doc.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              <Tag className="h-3 w-3 mr-1" />
                              {categoryLabels[doc.category] || doc.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[doc.status]}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={priorityColors[doc.priority || "medium"]}>
                              {doc.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {doc.due_date ? (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(doc.due_date).toLocaleDateString("id-ID")}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openEditDoc(doc)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteDocMutation.mutate(doc.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Belum ada dokumen PRD
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changelog" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isChangelogDialogOpen} onOpenChange={(open) => {
              setIsChangelogDialogOpen(open);
              if (!open) {
                setEditingChangelog(null);
                resetChangelogForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Changelog
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingChangelog ? "Edit Changelog" : "Tambah Changelog"}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveChangelogMutation.mutate(changelogData);
                  }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cl-version">Versi *</Label>
                      <Input
                        id="cl-version"
                        placeholder="v1.0.0"
                        value={changelogData.version}
                        onChange={(e) => setChangelogData({ ...changelogData, version: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cl-date">Tanggal Rilis</Label>
                      <Input
                        id="cl-date"
                        type="date"
                        value={changelogData.release_date}
                        onChange={(e) => setChangelogData({ ...changelogData, release_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cl-title">Judul *</Label>
                    <Input
                      id="cl-title"
                      value={changelogData.title}
                      onChange={(e) => setChangelogData({ ...changelogData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cl-desc">Deskripsi</Label>
                    <Textarea
                      id="cl-desc"
                      value={changelogData.description}
                      onChange={(e) => setChangelogData({ ...changelogData, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cl-changes">Perubahan (satu per baris)</Label>
                    <Textarea
                      id="cl-changes"
                      value={changelogData.changes}
                      onChange={(e) => setChangelogData({ ...changelogData, changes: e.target.value })}
                      rows={5}
                      placeholder="Tambah fitur login&#10;Perbaiki bug pada halaman blog&#10;Peningkatan performa"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsChangelogDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={saveChangelogMutation.isPending}>
                      {saveChangelogMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Simpan
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Changelog List */}
          {changelogLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : changelog?.length ? (
            <div className="space-y-4">
              {changelog.map((log) => (
                <Card key={log.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Badge variant="outline">{log.version}</Badge>
                          {log.title}
                        </CardTitle>
                        {log.description && (
                          <CardDescription className="mt-1">{log.description}</CardDescription>
                        )}
                        {log.release_date && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Rilis: {new Date(log.release_date).toLocaleDateString("id-ID")}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => openEditChangelog(log)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteChangelogMutation.mutate(log.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {log.changes && log.changes.length > 0 && (
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {log.changes.map((change: any, i: number) => (
                          <li key={i}>{change.description}</li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Belum ada changelog
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
