import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  History,
  RotateCcw,
  Eye,
  Loader2,
  Clock,
  User,
  FileText,
  ChevronRight,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ArticleVersion {
  id: string;
  article_id: string;
  version_number: number;
  title: string;
  content: string;
  excerpt: string | null;
  category: string;
  featured_image_url: string | null;
  tags: string[];
  author_affiliation: string | null;
  related_region: string | null;
  status: string | null;
  created_by: string;
  created_at: string;
  change_summary: string | null;
}

interface ArticleVersionHistoryProps {
  articleId: string;
  currentTitle: string;
  onRestore?: (version: ArticleVersion) => void;
}

export function ArticleVersionHistory({
  articleId,
  currentTitle,
  onRestore,
}: ArticleVersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ArticleVersion | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
  const { isSuperAdmin, user } = useAdminAuth();
  const queryClient = useQueryClient();

  const { data: versions, isLoading } = useQuery({
    queryKey: ["article-versions", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_versions")
        .select("*")
        .eq("article_id", articleId)
        .order("version_number", { ascending: false });

      if (error) throw error;
      return data as ArticleVersion[];
    },
    enabled: isOpen,
  });

  const restoreMutation = useMutation({
    mutationFn: async (version: ArticleVersion) => {
      // First, save current state as a new version
      const { data: currentArticle, error: fetchError } = await supabase
        .from("articles")
        .select("*")
        .eq("id", articleId)
        .single();

      if (fetchError) throw fetchError;

      // Get next version number
      const { data: nextVersionData, error: versionError } = await supabase
        .rpc("get_next_article_version", { p_article_id: articleId });

      if (versionError) throw versionError;

      // Save current as new version before restoring
      const { error: saveError } = await supabase
        .from("article_versions")
        .insert({
          article_id: articleId,
          version_number: nextVersionData,
          title: currentArticle.title,
          content: currentArticle.content,
          excerpt: currentArticle.excerpt,
          category: currentArticle.category,
          featured_image_url: currentArticle.featured_image_url,
          tags: currentArticle.tags,
          author_affiliation: currentArticle.author_affiliation,
          related_region: currentArticle.related_region,
          status: currentArticle.status,
          created_by: user?.id,
          change_summary: `Auto-saved before restoring to v${version.version_number}`,
        });

      if (saveError) throw saveError;

      // Now restore the selected version
      const { error: updateError } = await supabase
        .from("articles")
        .update({
          title: version.title,
          content: version.content,
          excerpt: version.excerpt,
          category: version.category as any,
          featured_image_url: version.featured_image_url,
          tags: version.tags,
          author_affiliation: version.author_affiliation as any,
          related_region: version.related_region,
        })
        .eq("id", articleId);

      if (updateError) throw updateError;

      return version;
    },
    onSuccess: (version) => {
      toast.success(`Artikel dikembalikan ke versi ${version.version_number}`);
      queryClient.invalidateQueries({ queryKey: ["article", articleId] });
      queryClient.invalidateQueries({ queryKey: ["article-versions", articleId] });
      setIsRestoreConfirmOpen(false);
      setIsOpen(false);
      onRestore?.(version);
    },
    onError: (error) => {
      console.error("Restore error:", error);
      toast.error("Gagal mengembalikan versi artikel");
    },
  });

  const handleRestore = (version: ArticleVersion) => {
    setSelectedVersion(version);
    setIsRestoreConfirmOpen(true);
  };

  const handlePreview = (version: ArticleVersion) => {
    setSelectedVersion(version);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <History className="h-4 w-4" />
        Riwayat Versi
      </Button>

      {/* Main History Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Riwayat Versi Artikel
            </DialogTitle>
            <DialogDescription>
              {currentTitle}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : versions && versions.length > 0 ? (
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <Collapsible key={version.id}>
                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={index === 0 ? "default" : "secondary"}>
                              v{version.version_number}
                            </Badge>
                            {index === 0 && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Terbaru
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(version.created_at), "dd MMM yyyy, HH:mm", {
                                locale: localeId,
                              })}
                            </span>
                          </div>
                          <CollapsibleTrigger className="w-full text-left mt-2">
                            <p className="font-medium text-sm truncate flex items-center gap-1 hover:text-primary">
                              <ChevronRight className="h-4 w-4" />
                              {version.title}
                            </p>
                          </CollapsibleTrigger>
                          {version.change_summary && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {version.change_summary}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(version)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isSuperAdmin && index > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(version)}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                          )}
                        </div>
                      </div>
                      <CollapsibleContent>
                        <Separator className="my-3" />
                        <div className="text-xs space-y-2">
                          <div className="flex gap-2">
                            <span className="text-muted-foreground">Kategori:</span>
                            <Badge variant="outline" className="text-xs">
                              {version.category}
                            </Badge>
                          </div>
                          {version.tags && version.tags.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              <span className="text-muted-foreground">Tags:</span>
                              {version.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <span className="text-muted-foreground">Status:</span>
                            <span>{version.status || "draft"}</span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Belum ada riwayat versi</p>
                <p className="text-xs mt-1">
                  Riwayat akan tersimpan setiap kali artikel disimpan
                </p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Preview Versi {selectedVersion?.version_number}
            </DialogTitle>
            <DialogDescription>
              {selectedVersion && format(
                new Date(selectedVersion.created_at),
                "EEEE, dd MMMM yyyy HH:mm",
                { locale: localeId }
              )}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px]">
            {selectedVersion && (
              <div className="space-y-4">
                {selectedVersion.featured_image_url && (
                  <img
                    src={selectedVersion.featured_image_url}
                    alt={selectedVersion.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <h1 className="text-2xl font-bold">{selectedVersion.title}</h1>
                <div className="flex gap-2 flex-wrap">
                  <Badge>{selectedVersion.category}</Badge>
                  {selectedVersion.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                {selectedVersion.excerpt && (
                  <p className="text-muted-foreground italic">
                    {selectedVersion.excerpt}
                  </p>
                )}
                <Separator />
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
                />
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Tutup
            </Button>
            {isSuperAdmin && selectedVersion && (
              <Button onClick={() => {
                setIsPreviewOpen(false);
                handleRestore(selectedVersion);
              }}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore Versi Ini
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={isRestoreConfirmOpen} onOpenChange={setIsRestoreConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Restore</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengembalikan artikel ke versi{" "}
              <strong>{selectedVersion?.version_number}</strong>?
              <br /><br />
              Versi saat ini akan disimpan sebagai backup sebelum restore.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRestoreConfirmOpen(false)}
              disabled={restoreMutation.isPending}
            >
              Batal
            </Button>
            <Button
              onClick={() => selectedVersion && restoreMutation.mutate(selectedVersion)}
              disabled={restoreMutation.isPending}
            >
              {restoreMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Ya, Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
