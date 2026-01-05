import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import { diffWords } from "diff";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  RotateCcw,
  Eye,
  Loader2,
  Clock,
  FileText,
  ChevronRight,
  GitCompare,
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

// Diff rendering component
function DiffView({ oldText, newText, type }: { oldText: string; newText: string; type: "text" | "html" }) {
  const diff = useMemo(() => {
    const oldClean = type === "html" ? oldText.replace(/<[^>]*>/g, " ") : oldText;
    const newClean = type === "html" ? newText.replace(/<[^>]*>/g, " ") : newText;
    return diffWords(oldClean, newClean);
  }, [oldText, newText, type]);

  return (
    <div className="text-sm leading-relaxed">
      {diff.map((part, index) => (
        <span
          key={index}
          className={
            part.added
              ? "bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100"
              : part.removed
              ? "bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 line-through"
              : ""
          }
        >
          {part.value}
        </span>
      ))}
    </div>
  );
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
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [diffVersion1, setDiffVersion1] = useState<string>("");
  const [diffVersion2, setDiffVersion2] = useState<string>("");
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

  const handleOpenDiff = () => {
    if (versions && versions.length >= 2) {
      setDiffVersion1(versions[0].id);
      setDiffVersion2(versions[1].id);
      setIsDiffOpen(true);
    }
  };

  const version1Data = versions?.find(v => v.id === diffVersion1);
  const version2Data = versions?.find(v => v.id === diffVersion2);

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          Riwayat Versi
        </Button>
      </div>

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
          
          {/* Diff Button */}
          {versions && versions.length >= 2 && (
            <div className="pt-2 border-t">
              <Button variant="outline" size="sm" onClick={handleOpenDiff} className="w-full gap-2">
                <GitCompare className="h-4 w-4" />
                Bandingkan Versi
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diff Dialog */}
      <Dialog open={isDiffOpen} onOpenChange={setIsDiffOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Perbandingan Versi
            </DialogTitle>
            <DialogDescription>
              Lihat perubahan antara dua versi artikel
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Versi Lama</label>
              <Select value={diffVersion2} onValueChange={setDiffVersion2}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih versi" />
                </SelectTrigger>
                <SelectContent>
                  {versions?.map((v) => (
                    <SelectItem key={v.id} value={v.id} disabled={v.id === diffVersion1}>
                      v{v.version_number} - {format(new Date(v.created_at), "dd MMM yyyy HH:mm", { locale: localeId })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Versi Baru</label>
              <Select value={diffVersion1} onValueChange={setDiffVersion1}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih versi" />
                </SelectTrigger>
                <SelectContent>
                  {versions?.map((v) => (
                    <SelectItem key={v.id} value={v.id} disabled={v.id === diffVersion2}>
                      v{v.version_number} - {format(new Date(v.created_at), "dd MMM yyyy HH:mm", { locale: localeId })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {version1Data && version2Data && (
            <ScrollArea className="h-[500px]">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content">Konten</TabsTrigger>
                  <TabsTrigger value="title">Judul</TabsTrigger>
                  <TabsTrigger value="excerpt">Excerpt</TabsTrigger>
                  <TabsTrigger value="meta">Metadata</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="mt-4">
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-2">
                      <span className="inline-block px-2 py-1 bg-green-200 dark:bg-green-900 rounded mr-2">Ditambahkan</span>
                      <span className="inline-block px-2 py-1 bg-red-200 dark:bg-red-900 rounded line-through">Dihapus</span>
                    </div>
                    <Separator className="my-2" />
                    <DiffView oldText={version2Data.content} newText={version1Data.content} type="html" />
                  </div>
                </TabsContent>
                
                <TabsContent value="title" className="mt-4">
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h3 className="font-medium mb-2">Perbandingan Judul</h3>
                    <DiffView oldText={version2Data.title} newText={version1Data.title} type="text" />
                  </div>
                </TabsContent>
                
                <TabsContent value="excerpt" className="mt-4">
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h3 className="font-medium mb-2">Perbandingan Excerpt</h3>
                    <DiffView 
                      oldText={version2Data.excerpt || ""} 
                      newText={version1Data.excerpt || ""} 
                      type="text" 
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="meta" className="mt-4">
                  <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">v{version2Data.version_number} (Lama)</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="text-muted-foreground">Kategori:</span> {version2Data.category}</p>
                          <p><span className="text-muted-foreground">Status:</span> {version2Data.status}</p>
                          <p><span className="text-muted-foreground">Tags:</span> {version2Data.tags?.join(", ") || "-"}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">v{version1Data.version_number} (Baru)</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="text-muted-foreground">Kategori:</span> {version1Data.category}</p>
                          <p><span className="text-muted-foreground">Status:</span> {version1Data.status}</p>
                          <p><span className="text-muted-foreground">Tags:</span> {version1Data.tags?.join(", ") || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDiffOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
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
