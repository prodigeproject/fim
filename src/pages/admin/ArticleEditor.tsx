import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSupabase as supabase } from '@/integrations/supabase/adminClient';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  EyeOff, 
  Clock, 
  Send, 
  Loader2,
  FileText,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TipTapEditor } from '@/components/admin/TipTapEditor';
import { ImageUploader, uploadImageToStorage } from '@/components/admin/ImageUploader';
import { ArticlePreview } from '@/components/admin/ArticlePreview';
import { ArticleVersionHistory } from '@/components/admin/ArticleVersionHistory';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, XCircle, RotateCcw } from 'lucide-react';

type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived' | 'rejected';
type ArticleCategory = 'pengumuman' | 'prestasi' | 'kegiatan' | 'sosial' | 'opini' | 'tips';
type AuthorAffiliation = 'fim_pusat' | 'fim_club' | 'fim_regional';

interface ArticleFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: ArticleCategory;
  featured_image_url: string | undefined;
  tags: string[];
  author_affiliation: AuthorAffiliation;
  related_region: string;
  status: ArticleStatus;
  scheduled_at: Date | null;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile, isSuperAdmin } = useAdminAuth();
  const isEditing = !!id;

  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [autoSavedAt, setAutoSavedAt] = useState<Date | null>(null);

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'kegiatan',
    featured_image_url: undefined,
    tags: [],
    author_affiliation: 'fim_pusat',
    related_region: '',
    status: 'draft',
    scheduled_at: null,
  });

  // Fetch existing article if editing
  const { data: article, isLoading: isLoadingArticle } = useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  // Populate form with existing article data
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt || '',
        category: article.category as ArticleCategory,
        featured_image_url: article.featured_image_url || undefined,
        tags: article.tags || [],
        author_affiliation: (article.author_affiliation || 'fim_pusat') as AuthorAffiliation,
        related_region: article.related_region || '',
        status: article.status as ArticleStatus,
        scheduled_at: article.scheduled_at ? new Date(article.scheduled_at) : null,
      });
      if (article.scheduled_at) {
        const scheduledDate = new Date(article.scheduled_at);
        setScheduleDate(scheduledDate);
        setScheduleTime(format(scheduledDate, 'HH:mm'));
      }
    }
  }, [article]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && formData.title && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(formData.title) }));
    }
  }, [formData.title, isEditing]);

  // Auto-backup every 5 minutes
  useEffect(() => {
    if (!isEditing || !id || !hasUnsavedChanges) return;

    const autoBackupInterval = setInterval(async () => {
      if (!formData.title.trim()) return;
      
      try {
        // Get next version number
        const { data: nextVersionData } = await supabase
          .rpc("get_next_article_version", { p_article_id: id });

        // Save auto-backup version
        await supabase
          .from("article_versions")
          .insert({
            article_id: id,
            version_number: nextVersionData || 1,
            title: formData.title,
            content: formData.content,
            excerpt: formData.excerpt,
            category: formData.category,
            featured_image_url: formData.featured_image_url,
            tags: formData.tags,
            author_affiliation: formData.author_affiliation,
            related_region: formData.related_region,
            status: formData.status,
            created_by: user?.id,
            change_summary: "Auto-backup (5 min)",
          });

        setAutoSavedAt(new Date());
        console.log("Auto-backup saved at", new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Auto-backup failed:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(autoBackupInterval);
  }, [isEditing, id, hasUnsavedChanges, formData, user?.id]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges || formData.status !== 'draft') return;

    const timer = setTimeout(() => {
      saveDraft();
    }, 30000);

    return () => clearTimeout(timer);
  }, [formData, hasUnsavedChanges]);

  const updateFormField = useCallback(<K extends keyof ArticleFormData>(
    field: K, 
    value: ArticleFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  }, []);

  // Save article mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { formData: ArticleFormData; newStatus?: ArticleStatus; needsApproval?: boolean }) => {
      const { formData: fd, newStatus, needsApproval } = data;
      let status = newStatus || fd.status;
      
      // If moderator is submitting for approval
      if (needsApproval) {
        status = 'draft';
      }

      // If article was rejected, allow resubmitting as draft
      if (article?.status === 'rejected' && needsApproval) {
        status = 'draft';
      }

      const articleData: Record<string, unknown> = {
        title: fd.title,
        slug: fd.slug,
        content: fd.content,
        excerpt: fd.excerpt || fd.content.replace(/<[^>]*>/g, '').substring(0, 160),
        category: fd.category,
        featured_image_url: fd.featured_image_url,
        tags: fd.tags,
        author_affiliation: fd.author_affiliation,
        related_region: fd.related_region || null,
        status,
        scheduled_at: status === 'scheduled' && fd.scheduled_at ? fd.scheduled_at.toISOString() : null,
        needs_approval: needsApproval || false,
        // Clear rejection/revision notes when resubmitting
        rejection_reason: needsApproval ? null : undefined,
        revision_notes: needsApproval ? null : undefined,
      };

      // Handle published_at - only set when first publishing
      if (status === 'published' && (!article?.published_at || article.status !== 'published')) {
        articleData.published_at = new Date().toISOString();
      }

      // If editing, save current version before updating
      if (isEditing && article) {
        try {
          // Get next version number
          const { data: nextVersionData } = await supabase
            .rpc("get_next_article_version", { p_article_id: id });

          // Save current state as a version
          await supabase
            .from("article_versions")
            .insert({
              article_id: id,
              version_number: nextVersionData || 1,
              title: article.title,
              content: article.content,
              excerpt: article.excerpt,
              category: article.category,
              featured_image_url: article.featured_image_url,
              tags: article.tags,
              author_affiliation: article.author_affiliation,
              related_region: article.related_region,
              status: article.status,
              created_by: user?.id,
              change_summary: `Saved before ${newStatus === 'published' ? 'publishing' : 'update'}`,
            });
        } catch (versionError) {
          console.error("Failed to save version:", versionError);
          // Continue with save even if version save fails
        }
      }

      if (isEditing) {
        const { error } = await supabase
          .from('articles')
          .update(articleData as any)
          .eq('id', id);
        if (error) throw error;
        return { id, needsApproval };
      } else {
        // For new articles, ensure author_id is set
        const insertData = {
          ...articleData,
          author_id: user?.id,
        };
        const { data, error } = await supabase
          .from('articles')
          .insert(insertData as any)
          .select('id')
          .single();
        if (error) throw error;
        return { id: data.id, needsApproval };
      }
    },
    onSuccess: async (result, variables) => {
      const newStatus = variables.newStatus || formData.status;
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', result.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-articles'] });
      
      if (result.needsApproval) {
        // Create notification for all super admins
        const { data: superAdmins } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'super_admin');
        
        if (superAdmins?.length) {
          const notifications = superAdmins.map(admin => ({
            user_id: admin.user_id,
            title: 'Artikel Menunggu Persetujuan',
            message: `"${formData.title}" oleh ${profile?.full_name || profile?.username} perlu direview.`,
            type: 'warning',
            link: '/admin/approvals',
          }));
          
          await supabase.from('admin_notifications').insert(notifications);
        }
        
        toast.success('Artikel dikirim untuk persetujuan Super Admin');
        navigate('/admin/articles');
      } else if (newStatus === 'published') {
        toast.success('Artikel berhasil dipublikasikan!');
        navigate('/admin/articles');
      } else if (newStatus === 'scheduled') {
        toast.success('Artikel dijadwalkan untuk dipublikasikan');
        navigate('/admin/articles');
      } else {
        toast.success('Draft tersimpan');
        if (!isEditing) {
          navigate(`/admin/articles/edit/${result.id}`, { replace: true });
        }
      }
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('Gagal menyimpan artikel');
    },
  });

  const saveDraft = useCallback(() => {
    if (!formData.title.trim()) {
      toast.error('Judul artikel harus diisi');
      return;
    }
    setIsSaving(true);
    saveMutation.mutate({ formData, newStatus: 'draft' });
    setIsSaving(false);
  }, [formData, saveMutation]);

  const publishArticle = useCallback(() => {
    if (!formData.title.trim()) {
      toast.error('Judul artikel harus diisi');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Konten artikel harus diisi');
      return;
    }
    if (!formData.featured_image_url) {
      toast.error('Featured image harus diupload');
      return;
    }
    
    // Moderator needs approval, Super Admin can publish directly
    if (!isSuperAdmin) {
      saveMutation.mutate({ formData, needsApproval: true });
    } else {
      saveMutation.mutate({ formData, newStatus: 'published' });
    }
  }, [formData, saveMutation, isSuperAdmin]);

  const scheduleArticle = useCallback(() => {
    if (!scheduleDate) {
      toast.error('Pilih tanggal jadwal publikasi');
      return;
    }
    
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    const scheduledAt = new Date(scheduleDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    if (scheduledAt <= new Date()) {
      toast.error('Waktu jadwal harus di masa depan');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim() || !formData.featured_image_url) {
      toast.error('Lengkapi judul, konten, dan featured image');
      return;
    }

    const updatedFormData = { ...formData, scheduled_at: scheduledAt };
    saveMutation.mutate({ formData: updatedFormData, newStatus: 'scheduled' });
    setIsScheduleDialogOpen(false);
  }, [formData, scheduleDate, scheduleTime, saveMutation]);

  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      updateFormField('tags', [...formData.tags, tag]);
      setTagInput('');
    }
  }, [tagInput, formData.tags, updateFormField]);

  const removeTag = useCallback((tagToRemove: string) => {
    updateFormField('tags', formData.tags.filter(t => t !== tagToRemove));
  }, [formData.tags, updateFormField]);

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    return uploadImageToStorage(file);
  }, []);

  const statusBadge = useMemo(() => {
    const statusConfig: Record<ArticleStatus, { label: string; variant: 'secondary' | 'outline' | 'default' | 'destructive' }> = {
      draft: { label: 'Draft', variant: 'secondary' },
      scheduled: { label: 'Terjadwal', variant: 'outline' },
      published: { label: 'Dipublikasikan', variant: 'default' },
      archived: { label: 'Diarsipkan', variant: 'secondary' },
      rejected: { label: 'Ditolak', variant: 'destructive' },
    };
    const config = statusConfig[formData.status] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }, [formData.status]);

  if (isLoadingArticle) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/articles')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Edit Artikel' : 'Tulis Artikel Baru'}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {statusBadge}
              {autoSavedAt && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Auto-saved {format(autoSavedAt, 'HH:mm')}
                </span>
              )}
              {lastSaved && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Tersimpan {format(lastSaved, 'HH:mm')}
                </span>
              )}
              {hasUnsavedChanges && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Ada perubahan belum tersimpan
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isEditing && id && (
            <ArticleVersionHistory
              articleId={id}
              currentTitle={formData.title}
              onRestore={() => {
                // Refetch article data after restore
                queryClient.invalidateQueries({ queryKey: ['article', id] });
              }}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Edit
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveDraft}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending && isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Simpan Draft
          </Button>
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Jadwalkan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Jadwalkan Publikasi</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Tanggal</Label>
                  <Calendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={setScheduleDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="scheduleTime">Waktu (WIB)</Label>
                  <Input
                    id="scheduleTime"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={scheduleArticle} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4 mr-2" />
                  )}
                  Jadwalkan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button 
            size="sm" 
            onClick={publishArticle}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending && !isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSuperAdmin ? 'Publikasikan' : 'Kirim untuk Persetujuan'}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Show rejection/revision alert if applicable */}
      {article?.status === 'rejected' && article?.rejection_reason && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Artikel Ditolak</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="font-medium">Alasan penolakan:</p>
            <p className="mt-1">{article.rejection_reason}</p>
            <p className="mt-3 text-sm">Silakan edit artikel dan kirim ulang untuk persetujuan.</p>
          </AlertDescription>
        </Alert>
      )}

      {article?.revision_notes && (
        <Alert className="border-yellow-500 bg-yellow-50 text-yellow-900 dark:border-yellow-600 dark:bg-yellow-950 dark:text-yellow-100">
          <RotateCcw className="h-4 w-4" />
          <AlertTitle>Revisi Diminta</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="font-medium">Catatan revisi:</p>
            <p className="mt-1">{article.revision_notes}</p>
            <p className="mt-3 text-sm">Silakan revisi artikel dan kirim ulang untuk persetujuan.</p>
          </AlertDescription>
        </Alert>
      )}

      {isPreview ? (
        <div className="bg-muted/30 rounded-lg p-8">
          <ArticlePreview
            title={formData.title}
            content={formData.content}
            featuredImage={formData.featured_image_url}
            category={formData.category}
            tags={formData.tags}
            authorName={profile?.full_name || profile?.username || 'Penulis'}
            authorAffiliation={formData.author_affiliation}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Judul Artikel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormField('title', e.target.value)}
                placeholder="Masukkan judul artikel"
                className="mt-2 text-lg"
              />
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug">Slug URL</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => updateFormField('slug', generateSlug(e.target.value))}
                placeholder="slug-artikel"
                className="mt-2"
                disabled={!isSuperAdmin && isEditing}
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL: /blog/{formData.slug || 'slug-artikel'}
              </p>
            </div>

            {/* Content Editor */}
            <div>
              <Label>Konten Artikel *</Label>
              <div className="mt-2">
                <TipTapEditor
                  content={formData.content}
                  onChange={(content) => updateFormField('content', content)}
                  onImageUpload={handleImageUpload}
                  placeholder="Mulai menulis artikel..."
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt">Ringkasan (Excerpt)</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => updateFormField('excerpt', e.target.value)}
                placeholder="Ringkasan artikel (opsional, akan auto-generate dari konten)"
                className="mt-2"
                rows={3}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="bg-muted/30 rounded-lg p-4">
              <Label>Featured Image *</Label>
              <div className="mt-2">
                <ImageUploader
                  value={formData.featured_image_url}
                  onChange={(url) => updateFormField('featured_image_url', url)}
                />
              </div>
            </div>

            {/* Category */}
            <div className="bg-muted/30 rounded-lg p-4">
              <Label>Kategori *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormField('category', value as ArticleCategory)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pengumuman">Pengumuman</SelectItem>
                  <SelectItem value="prestasi">Prestasi</SelectItem>
                  <SelectItem value="kegiatan">Kegiatan</SelectItem>
                  <SelectItem value="sosial">Sosial</SelectItem>
                  <SelectItem value="opini">Opini</SelectItem>
                  <SelectItem value="tips">Tips & Trik</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Author Affiliation */}
            <div className="bg-muted/30 rounded-lg p-4">
              <Label>Afiliasi Penulis</Label>
              <Select
                value={formData.author_affiliation}
                onValueChange={(value) => updateFormField('author_affiliation', value as AuthorAffiliation)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Pilih afiliasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fim_pusat">FIM Pusat</SelectItem>
                  <SelectItem value="fim_club">FIM Club</SelectItem>
                  <SelectItem value="fim_regional">FIM Regional</SelectItem>
                </SelectContent>
              </Select>

              {(formData.author_affiliation === 'fim_club' || 
                formData.author_affiliation === 'fim_regional') && (
                <div className="mt-4">
                  <Label htmlFor="relatedRegion">
                    {formData.author_affiliation === 'fim_club' ? 'Nama Club' : 'Nama Regional'}
                  </Label>
                  <Input
                    id="relatedRegion"
                    value={formData.related_region}
                    onChange={(e) => updateFormField('related_region', e.target.value)}
                    placeholder={formData.author_affiliation === 'fim_club' ? 'Contoh: FIM UI' : 'Contoh: Jawa Barat'}
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-muted/30 rounded-lg p-4">
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Tambah tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Tambah
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeTag(tag)}
                    >
                      #{tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
