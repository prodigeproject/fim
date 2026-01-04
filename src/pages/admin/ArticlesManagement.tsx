import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Pin, 
  PinOff,
  Loader2,
  FileText,
  MoreHorizontal,
  Archive,
  Send,
  CheckSquare,
  ArrowUpAZ,
  ArrowDownZA,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
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

const statusColors: Record<string, string> = {
  published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const categoryLabels: Record<string, string> = {
  pengumuman: "Pengumuman",
  prestasi: "Prestasi",
  kegiatan: "Kegiatan",
  sosial: "Sosial",
  opini: "Opini",
  tips: "Tips",
};

export default function ArticlesManagement() {
  const { user, isSuperAdmin } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch articles
  const { data: articles, isLoading } = useQuery({
    queryKey: ["admin-articles", statusFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("articles")
        .select(
          `
          id,
          slug,
          title,
          category,
          status,
          is_pinned,
          view_count,
          created_at,
          published_at,
          author_id
        `
        )
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq(
          "status",
          statusFilter as "draft" | "scheduled" | "published" | "archived"
        );
      }
      if (categoryFilter !== "all") {
        query = query.eq(
          "category",
          categoryFilter as
            | "pengumuman"
            | "prestasi"
            | "kegiatan"
            | "sosial"
            | "opini"
            | "tips"
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch author profiles separately
  const { data: authorProfiles } = useQuery({
    queryKey: ["article-authors", articles?.map(a => a.author_id)],
    queryFn: async () => {
      if (!articles?.length) return {};
      const authorIds = [...new Set(articles.map(a => a.author_id))];
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", authorIds);
      
      const profileMap: Record<string, { username: string; full_name: string | null }> = {};
      data?.forEach(p => {
        profileMap[p.id] = { username: p.username, full_name: p.full_name };
      });
      return profileMap;
    },
    enabled: !!articles?.length,
  });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", articleId);
      
      if (error) throw error;

      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: "delete_article",
        p_resource_type: "article",
        p_resource_id: articleId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast({ title: "Artikel berhasil dihapus" });
    },
    onError: (error) => {
      toast({
        title: "Gagal menghapus artikel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Pin/Unpin article mutation
  const pinMutation = useMutation({
    mutationFn: async ({ articleId, isPinned }: { articleId: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from("articles")
        .update({ 
          is_pinned: !isPinned,
          pinned_at: !isPinned ? new Date().toISOString() : null,
          pinned_by: !isPinned ? user?.id : null,
        })
        .eq("id", articleId);
      
      if (error) throw error;

      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: isPinned ? "unpin_article" : "pin_article",
        p_resource_type: "article",
        p_resource_id: articleId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast({ title: "Status pin artikel diperbarui" });
    },
    onError: (error) => {
      toast({
        title: "Gagal memperbarui status pin",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bulk action mutation
  const bulkMutation = useMutation({
    mutationFn: async ({ action, ids }: { action: string; ids: string[] }) => {
      if (action === "delete") {
        const { error } = await supabase
          .from("articles")
          .delete()
          .in("id", ids);
        if (error) throw error;
      } else if (action === "archive") {
        const { error } = await supabase
          .from("articles")
          .update({ status: "archived" })
          .in("id", ids);
        if (error) throw error;
      } else if (action === "publish") {
        const { error } = await supabase
          .from("articles")
          .update({ 
            status: "published",
            published_at: new Date().toISOString()
          })
          .in("id", ids);
        if (error) throw error;
      }

      // Log audit for bulk action
      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: `bulk_${action}_articles`,
        p_details: { article_ids: ids, count: ids.length },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      setSelectedIds([]);
      setBulkAction("");
      setIsBulkDialogOpen(false);
      
      const actionLabels: Record<string, string> = {
        delete: "dihapus",
        archive: "diarsipkan",
        publish: "dipublikasikan",
      };
      toast({ 
        title: `${variables.ids.length} artikel berhasil ${actionLabels[variables.action]}` 
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal melakukan aksi bulk",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter and sort articles by search term
  const filteredArticles = articles?.filter((article: any) => {
    if (!searchTerm) return true;
    return article.title.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a: any, b: any) => {
    const comparison = a.title.localeCompare(b.title, 'id');
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Check if user can edit article
  const canEdit = (article: any) => {
    return isSuperAdmin || article.author_id === user?.id;
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredArticles) {
      setSelectedIds(filteredArticles.map((a: any) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle individual select
  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  // Execute bulk action
  const executeBulkAction = () => {
    if (bulkAction && selectedIds.length > 0) {
      bulkMutation.mutate({ action: bulkAction, ids: selectedIds });
    }
  };

  const isAllSelected = filteredArticles?.length > 0 && selectedIds.length === filteredArticles?.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < (filteredArticles?.length || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Artikel</h1>
          <p className="text-muted-foreground">
            Kelola artikel blog FIM
          </p>
        </div>
        <Link to="/admin/articles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tulis Artikel
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari artikel..."
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="pengumuman">Pengumuman</SelectItem>
                <SelectItem value="prestasi">Prestasi</SelectItem>
                <SelectItem value="kegiatan">Kegiatan</SelectItem>
                <SelectItem value="sosial">Sosial</SelectItem>
                <SelectItem value="opini">Opini</SelectItem>
                <SelectItem value="tips">Tips</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions Bar */}
          {isSuperAdmin && selectedIds.length > 0 && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {selectedIds.length} artikel dipilih
                </span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Aksi Bulk
                      <MoreHorizontal className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setBulkAction("publish");
                        setIsBulkDialogOpen(true);
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Publikasikan Semua
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setBulkAction("archive");
                        setIsBulkDialogOpen(true);
                      }}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Arsipkan Semua
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        setBulkAction("delete");
                        setIsBulkDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus Semua
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedIds([])}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}

           {/* Table */}
           {isLoading || !user ? (
             <div className="space-y-3">
               {[...Array(5)].map((_, i) => (
                 <Skeleton key={i} className="h-16" />
               ))}
             </div>
           ) : filteredArticles?.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isSuperAdmin && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) (el as any).indeterminate = isSomeSelected;
                          }}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                    )}
                    <TableHead>Judul</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Penulis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article: any) => (
                    <TableRow 
                      key={article.id}
                      className={selectedIds.includes(article.id) ? "bg-muted/50" : ""}
                    >
                      {isSuperAdmin && (
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(article.id)}
                            onCheckedChange={(checked) => handleSelect(article.id, !!checked)}
                          />
                        </TableCell>
                      )}
                       <TableCell className="max-w-xs">
                         <div className="flex items-center gap-2">
                           {article.is_pinned && (
                             <Pin className="h-4 w-4 text-accent flex-shrink-0" />
                           )}
                           <span className="font-medium truncate">{article.title}</span>
                           {!article.slug && (
                             <Badge variant="secondary" className="ml-2">
                               Tanpa slug
                             </Badge>
                           )}
                         </div>
                       </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryLabels[article.category] || article.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {authorProfiles?.[article.author_id]?.full_name || 
                         authorProfiles?.[article.author_id]?.username || 
                         "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[article.status]}>
                          {article.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {article.view_count || 0}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {new Date(article.created_at).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-1">
                           {article.slug ? (
                             <Link to={`/blog/${article.slug}`} target="_blank">
                               <Button variant="ghost" size="icon">
                                 <Eye className="h-4 w-4" />
                               </Button>
                             </Link>
                           ) : (
                             <Button
                               variant="ghost"
                               size="icon"
                               disabled
                               title="Artikel ini belum memiliki slug"
                             >
                               <Eye className="h-4 w-4" />
                             </Button>
                           )}
                          
                          {canEdit(article) && (
                            <Link to={`/admin/articles/edit/${article.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}

                          {isSuperAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => pinMutation.mutate({
                                articleId: article.id,
                                isPinned: article.is_pinned,
                              })}
                              disabled={pinMutation.isPending}
                            >
                              {article.is_pinned ? (
                                <PinOff className="h-4 w-4" />
                              ) : (
                                <Pin className="h-4 w-4" />
                              )}
                            </Button>
                          )}

                          {isSuperAdmin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tindakan ini tidak dapat dibatalkan. Artikel "{article.title}" akan dihapus permanen.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => deleteMutation.mutate(article.id)}
                                  >
                                    {deleteMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Hapus"
                                    )}
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
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Belum ada artikel
              </p>
              <Link to="/admin/articles/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Tulis Artikel Pertama
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === "delete" && "Hapus Artikel Terpilih?"}
              {bulkAction === "archive" && "Arsipkan Artikel Terpilih?"}
              {bulkAction === "publish" && "Publikasikan Artikel Terpilih?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === "delete" && 
                `Tindakan ini tidak dapat dibatalkan. ${selectedIds.length} artikel akan dihapus permanen.`}
              {bulkAction === "archive" && 
                `${selectedIds.length} artikel akan diarsipkan dan tidak ditampilkan di publik.`}
              {bulkAction === "publish" && 
                `${selectedIds.length} artikel akan dipublikasikan dan dapat dilihat publik.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className={bulkAction === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={executeBulkAction}
              disabled={bulkMutation.isPending}
            >
              {bulkMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {bulkAction === "delete" && "Hapus Semua"}
              {bulkAction === "archive" && "Arsipkan Semua"}
              {bulkAction === "publish" && "Publikasikan Semua"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
