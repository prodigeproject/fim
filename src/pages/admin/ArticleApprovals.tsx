import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  FileText,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Link } from "react-router-dom";

interface PendingArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  created_at: string;
  author_id: string;
  author?: {
    username: string;
    full_name: string | null;
  };
}

const categoryLabels: Record<string, string> = {
  pengumuman: "Pengumuman",
  prestasi: "Prestasi",
  kegiatan: "Kegiatan",
  sosial: "Sosial",
  opini: "Opini",
  tips: "Tips",
};

export default function ArticleApprovals() {
  const { isSuperAdmin, user } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedArticle, setSelectedArticle] = useState<PendingArticle | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Fetch pending articles
  const { data: pendingArticles, isLoading } = useQuery({
    queryKey: ["pending-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, category, excerpt, created_at, author_id")
        .eq("needs_approval", true)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch author profiles
      const authorIds = [...new Set(data?.map(a => a.author_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", authorIds);

      const profileMap = profiles?.reduce((acc, p) => {
        acc[p.id] = { username: p.username, full_name: p.full_name };
        return acc;
      }, {} as Record<string, { username: string; full_name: string | null }>);

      return data?.map(a => ({
        ...a,
        author: profileMap?.[a.author_id],
      })) as PendingArticle[];
    },
    enabled: isSuperAdmin,
  });

  // Approve article mutation
  const approveMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase
        .from("articles")
        .update({
          needs_approval: false,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq("id", articleId);

      if (error) throw error;

      // Log audit
      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: "approve_article",
        p_resource_type: "article",
        p_resource_id: articleId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast({ title: "Artikel disetujui" });
    },
    onError: (error) => {
      toast({ 
        title: "Gagal menyetujui artikel", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Reject article mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ articleId, reason }: { articleId: string; reason: string }) => {
      const { error } = await supabase
        .from("articles")
        .update({
          needs_approval: false,
          rejection_reason: reason,
          status: "draft",
        })
        .eq("id", articleId);

      if (error) throw error;

      // Log audit
      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: "reject_article",
        p_resource_type: "article",
        p_resource_id: articleId,
        p_details: { reason },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      setShowRejectDialog(false);
      setSelectedArticle(null);
      setRejectionReason("");
      toast({ title: "Artikel ditolak" });
    },
    onError: (error) => {
      toast({ 
        title: "Gagal menolak artikel", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleReject = () => {
    if (!selectedArticle || !rejectionReason.trim()) {
      toast({ 
        title: "Alasan penolakan wajib diisi", 
        variant: "destructive" 
      });
      return;
    }
    rejectMutation.mutate({ 
      articleId: selectedArticle.id, 
      reason: rejectionReason 
    });
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
        <p className="text-muted-foreground">Hanya Super Admin yang dapat menyetujui artikel</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Persetujuan Artikel</h1>
        <p className="text-muted-foreground">
          Review dan setujui artikel dari moderator sebelum dipublikasikan
        </p>
      </div>

      {/* Pending Count */}
      {pendingArticles && pendingArticles.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  {pendingArticles.length} artikel menunggu persetujuan
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Review artikel sebelum dapat dipublikasikan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Artikel Pending
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : pendingArticles && pendingArticles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artikel</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Penulis</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{article.title}</p>
                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {categoryLabels[article.category] || article.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{article.author?.full_name || article.author?.username}</p>
                        <p className="text-xs text-muted-foreground">@{article.author?.username}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(article.created_at), "dd MMM yyyy", { locale: id })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link to={`/fim-admin-portal-2024/articles/edit/${article.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => approveMutation.mutate(article.id)}
                          disabled={approveMutation.isPending}
                        >
                          {approveMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                          )}
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedArticle(article);
                            setShowRejectDialog(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Tolak
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Tidak ada artikel yang menunggu persetujuan</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Artikel</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk artikel "{selectedArticle?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Alasan penolakan..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
            >
              {rejectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Tolak Artikel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
