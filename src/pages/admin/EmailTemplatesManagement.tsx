import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Mail,
  Edit,
  Eye,
  Save,
  RefreshCw,
  Loader2,
  Code,
  FileText,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  description: string | null;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function EmailTemplatesManagement() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    subject: "",
    html_content: "",
    description: "",
  });

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  // Update template
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmailTemplate> }) => {
      const { error } = await supabase
        .from("email_templates")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast.error("Gagal memperbarui template");
    },
  });

  // Toggle active
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("email_templates")
        .update({ is_active })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.is_active ? "Template diaktifkan" : "Template dinonaktifkan");
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
    onError: () => {
      toast.error("Gagal mengubah status template");
    },
  });

  const openEditDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditData({
      subject: template.subject,
      html_content: template.html_content,
      description: template.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const openPreviewDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedTemplate) return;
    
    updateMutation.mutate({
      id: selectedTemplate.id,
      updates: editData,
    });
  };

  const getTemplateLabel = (name: string) => {
    const labels: Record<string, string> = {
      registration_approved: "Pendaftaran Disetujui",
      registration_rejected: "Pendaftaran Ditolak",
      interview_scheduled: "Jadwal Wawancara",
      interview_reminder: "Reminder Wawancara",
      incomplete_reminder: "Reminder Formulir Belum Lengkap",
    };
    return labels[name] || name;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Manajemen Template Email
          </h1>
          <p className="text-muted-foreground mt-1">
            Edit template email notifikasi tanpa mengubah kode
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["email-templates"] })}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Template Email</CardTitle>
          <CardDescription>
            Template email yang digunakan untuk notifikasi sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Variabel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Diperbarui</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : templates && templates.length > 0 ? (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getTemplateLabel(template.name)}</p>
                        <p className="text-xs text-muted-foreground">{template.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {template.subject}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.variables?.slice(0, 3).map((v, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {`{{${v}}}`}
                          </Badge>
                        ))}
                        {template.variables?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.variables.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={(checked) => 
                          toggleActiveMutation.mutate({ id: template.id, is_active: checked })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(template.updated_at), "dd MMM yyyy", { locale: localeId })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPreviewDialog(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Tidak ada template email
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Edit Template: {selectedTemplate && getTemplateLabel(selectedTemplate.name)}
            </DialogTitle>
            <DialogDescription>
              Edit konten template email. Gunakan variabel dalam format {`{{variabel}}`}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Input
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi template..."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Subject Email</Label>
                <Input
                  value={editData.subject}
                  onChange={(e) => setEditData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Subject email..."
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Konten HTML</Label>
                  {selectedTemplate?.variables && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground mr-2">Variabel:</span>
                      {selectedTemplate.variables.map((v, i) => (
                        <Badge key={i} variant="secondary" className="text-xs cursor-pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(`{{${v}}}`);
                            toast.success(`{{${v}}} disalin ke clipboard`);
                          }}
                        >
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Textarea
                  value={editData.html_content}
                  onChange={(e) => setEditData(prev => ({ ...prev, html_content: e.target.value }))}
                  placeholder="Konten HTML..."
                  className="font-mono text-sm min-h-[400px]"
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview: {selectedTemplate && getTemplateLabel(selectedTemplate.name)}
            </DialogTitle>
            <DialogDescription>
              Subject: {selectedTemplate?.subject}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 border rounded-lg">
            {selectedTemplate && (
              <div 
                className="p-4"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(selectedTemplate.html_content, {
                    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'img', 'br', 'hr', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'style', 'head', 'body', 'html', 'meta', 'title'],
                    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'width', 'height', 'style', 'charset', 'name', 'content'],
                    ALLOW_DATA_ATTR: false
                  })
                }}
              />
            )}
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Tutup
            </Button>
            <Button onClick={() => {
              setIsPreviewDialogOpen(false);
              if (selectedTemplate) openEditDialog(selectedTemplate);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
