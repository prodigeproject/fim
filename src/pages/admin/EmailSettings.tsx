import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { usePermission } from "@/hooks/usePermission";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { toast } from "sonner";
import {
  Shield,
  Mail,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Save,
  Send,
  Bell,
  Newspaper,
  Database,
  Edit,
  Eye,
  RefreshCw,
  Code,
  Play,
  TestTube,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

// ── Types ───────────────────────────────────────────────

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

// ── Main Component ──────────────────────────────────────

export default function EmailSettings() {
  const { isSuperAdmin } = useAdminAuth();

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
        <p className="text-muted-foreground">
          Hanya Super Admin yang dapat mengakses halaman ini
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="h-6 w-6" />
          Pengaturan Email
        </h1>
        <p className="text-muted-foreground">
          Konfigurasi provider, template, notifikasi, dan queue email
        </p>
      </div>

      <Tabs defaultValue="provider">
        <TabsList className="flex-wrap">
          <TabsTrigger value="provider">Provider</TabsTrigger>
          <TabsTrigger value="templates">Template</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          <TabsTrigger value="queue">Queue & SMTP</TabsTrigger>
        </TabsList>

        <TabsContent value="provider" className="space-y-4">
          <ProviderTab />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplatesTab />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="newsletter" className="space-y-4">
          <NewsletterTab />
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <QueueTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Tab 1: Provider (Gmail SMTP config + test)
// ══════════════════════════════════════════════════════════

function ProviderTab() {
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [gmailEmail, setGmailEmail] = useState("");
  const [gmailAppPassword, setGmailAppPassword] = useState("");
  const [replyToAddress, setReplyToAddress] = useState("");
  const [fromName, setFromName] = useState("Forum Indonesia Muda");
  const [isSaving, setIsSaving] = useState(false);

  const [hasDbPassword, setHasDbPassword] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from("email_settings")
        .select("mail_from_name, mail_from_address, mail_username, mail_password_encrypted, reply_to_address")
        .limit(1)
        .maybeSingle();
      if (data) {
        setFromName(data.mail_from_name || "Forum Indonesia Muda");
        setGmailEmail((data as any).mail_username || data.mail_from_address || "");
        setReplyToAddress((data as any).reply_to_address || "");
        setHasDbPassword(!!(data as any).mail_password_encrypted);
      }
    };
    loadSettings();
  }, []);

  const handleTestEmail = async () => {
    if (!testEmail) { toast.error("Masukkan email untuk test"); return; }
    setIsTesting(true);
    try {
      const { error } = await supabase.functions.invoke("newsletter-subscribe", {
        body: { email: testEmail, name: "Test User", testMode: true },
      });
      if (error) throw error;
      toast.success("Email test berhasil dikirim! Cek inbox Anda.");
    } catch (error: any) {
      toast.error(`Gagal mengirim email: ${error.message || "Unknown error"}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const updates: Record<string, any> = {
        mail_from_name: fromName,
        mail_from_address: gmailEmail || null,
        mail_username: gmailEmail || null,
        reply_to_address: replyToAddress || null,
      };
      // Only update password if user entered a new one
      if (gmailAppPassword) {
        updates.mail_password_encrypted = gmailAppPassword;
      }
      const { error } = await supabase
        .from("email_settings")
        .update(updates)
        .not("id", "is", null);
      if (error) throw error;
      setGmailAppPassword(""); // Clear password field after save
      toast.success("Pengaturan berhasil disimpan");
    } catch (error: any) {
      toast.error("Gagal menyimpan: " + (error.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Provider Email Aktif</CardTitle>
          <CardDescription>Sistem menggunakan Gmail SMTP untuk mengirim semua email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg border-primary bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Gmail SMTP</h4>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Aktif
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Semua email dikirim melalui Gmail SMTP (newsletter, notifikasi, broadcast)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Konfigurasi Gmail SMTP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Gmail memiliki batas pengiriman 500 email/hari untuk akun personal.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-name">Nama Pengirim</Label>
              <Input id="from-name" value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Forum Indonesia Muda" />
              <p className="text-xs text-muted-foreground">Nama yang muncul sebagai pengirim email</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gmail-email">Email Pengirim (From)</Label>
              <Input id="gmail-email" type="email" value={gmailEmail} onChange={(e) => setGmailEmail(e.target.value)} placeholder="yourname@gmail.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply-to">Reply-To Address</Label>
              <Input id="reply-to" type="email" value={replyToAddress} onChange={(e) => setReplyToAddress(e.target.value)} placeholder="info@forumindonesiamuda.org" />
              <p className="text-xs text-muted-foreground">Alamat email tujuan balasan. Kosongkan jika sama dengan email pengirim.</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="gmail-password">App Password</Label>
              <Input id="gmail-password" type="password" value={gmailAppPassword} onChange={(e) => setGmailAppPassword(e.target.value)} placeholder={hasDbPassword ? "••••••••••••••••" : "xxxx xxxx xxxx xxxx"} />
              <p className="text-xs text-muted-foreground">
                {hasDbPassword ? "App Password sudah tersimpan. Isi ulang hanya jika ingin mengubah." : "Masukkan App Password Gmail untuk akun pengirim."}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <p className="text-sm font-medium">Langkah Setup:</p>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Aktifkan 2-Step Verification di akun Google</li>
              <li>Buat App Password di Google Account Settings</li>
              <li>Masukkan email dan App Password di form di atas</li>
              <li>Simpan pengaturan</li>
            </ol>
            <Button variant="outline" asChild className="mt-2">
              <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Buat App Password
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Email</CardTitle>
          <CardDescription>Kirim email test untuk memverifikasi konfigurasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input type="email" placeholder="test@example.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
            <Button onClick={handleTestEmail} disabled={isTesting}>
              {isTesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Kirim Test
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Simpan Pengaturan Provider
        </Button>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════
// Tab 2: Email Templates (from EmailTemplatesManagement)
// ══════════════════════════════════════════════════════════

function TemplatesTab() {
  const queryClient = useQueryClient();
  const { canEdit } = usePermission("email_templates");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<"preview" | "variables">("preview");
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const [editData, setEditData] = useState({ subject: "", html_content: "", description: "" });

  const { data: templates, isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_templates").select("*").order("name");
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmailTemplate> }) => {
      const { error } = await supabase.from("email_templates").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      setIsEditDialogOpen(false);
    },
    onError: () => toast.error("Gagal memperbarui template"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("email_templates").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.is_active ? "Template diaktifkan" : "Template dinonaktifkan");
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
    onError: () => toast.error("Gagal mengubah status template"),
  });

  const openEditDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditData({ subject: template.subject, html_content: template.html_content, description: template.description || "" });
    setIsEditDialogOpen(true);
  };

  const openPreviewDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    const initialVars: Record<string, string> = {};
    template.variables?.forEach(v => { initialVars[v] = getDefaultTestValue(v); });
    setTestVariables(initialVars);
    setPreviewTab("preview");
    setIsPreviewDialogOpen(true);
  };

  const getDefaultTestValue = (varName: string): string => {
    const defaults: Record<string, string> = {
      name: "Ahmad Fauzi",
      full_name: "Ahmad Fauzi",
      email: "ahmad@example.com",
      date: format(new Date(), "dd MMMM yyyy", { locale: localeId }),
      time: "10:00 WIB",
      interview_date: format(new Date(), "dd MMMM yyyy", { locale: localeId }),
      interview_time: "10:00 WIB",
      location: "Zoom Meeting",
      meeting_link: "https://zoom.us/j/123456789",
      batch_name: "FIM 28: Leadership & Innovation",
      note: "Harap datang tepat waktu",
      reason: "Dokumen yang dilampirkan tidak lengkap",
      verification_link: "https://fim.or.id/verify/abc123",
      reset_link: "https://fim.or.id/reset/abc123",
    };
    return defaults[varName] || `[${varName}]`;
  };

  const replaceVariables = (content: string, variables: Record<string, string>): string => {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    });
    return result;
  };

  const getTemplateLabel = (name: string) => {
    const labels: Record<string, string> = {
      registration_approved: "Pendaftaran Disetujui",
      registration_rejected: "Pendaftaran Ditolak",
      interview_scheduled: "Jadwal Wawancara",
      interview_reminder: "Reminder Wawancara",
      incomplete_reminder: "Reminder Formulir Belum Lengkap",
      email_verification: "Verifikasi Email",
      password_reset: "Reset Password",
      admin_selection_passed: "Lolos Seleksi Administrasi",
      admin_selection_failed: "Tidak Lolos Seleksi Administrasi",
      interview_completed: "Wawancara Selesai",
      final_result_passed: "Lolos Seleksi Akhir",
      final_result_failed: "Tidak Lolos Seleksi Akhir",
      selection_stage_change: "Perubahan Tahap Seleksi",
      new_registration: "Pendaftaran Baru (Admin)",
      article_status: "Status Artikel",
      revision_request: "Permintaan Revisi",
      login_notification: "Notifikasi Login",
      unauthorized_access: "Akses Tidak Sah",
      newsletter_welcome: "Selamat Datang Newsletter",
      registration_status: "Status Registrasi",
    };
    return labels[name] || name;
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold">Template Email Notifikasi</h2>
          <p className="text-sm text-muted-foreground">Edit template email notifikasi dengan preview dinamis</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["email-templates"] })}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
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
                    <TableCell className="max-w-[200px] truncate">{template.subject}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.variables?.slice(0, 3).map((v, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{`{{${v}}}`}</Badge>
                        ))}
                        {template.variables?.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{template.variables.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: template.id, is_active: checked })}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(template.updated_at), "dd MMM yyyy", { locale: localeId })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openPreviewDialog(template)} title="Preview">
                          <TestTube className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(template)} title="Edit">
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
                <Input value={editData.description} onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))} placeholder="Deskripsi template..." />
              </div>
              <div className="space-y-2">
                <Label>Subject Email</Label>
                <Input value={editData.subject} onChange={(e) => setEditData(prev => ({ ...prev, subject: e.target.value }))} placeholder="Subject email..." />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Konten HTML</Label>
                  {selectedTemplate?.variables && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground mr-2">Variabel:</span>
                      {selectedTemplate.variables.map((v, i) => (
                        <Badge key={i} variant="secondary" className="text-xs cursor-pointer"
                          onClick={() => { navigator.clipboard.writeText(`{{${v}}}`); toast.success(`{{${v}}} disalin ke clipboard`); }}
                        >{`{{${v}}}`}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Textarea value={editData.html_content} onChange={(e) => setEditData(prev => ({ ...prev, html_content: e.target.value }))} placeholder="Konten HTML..." className="font-mono text-sm min-h-[400px]" />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
            <Button onClick={() => { if (selectedTemplate) updateMutation.mutate({ id: selectedTemplate.id, updates: editData }); }} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Preview: {selectedTemplate && getTemplateLabel(selectedTemplate.name)}
            </DialogTitle>
            <DialogDescription>Uji tampilan email dengan data test</DialogDescription>
          </DialogHeader>
          <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as "preview" | "variables")} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="variables"><Play className="h-4 w-4 mr-2" />Edit Data Test</TabsTrigger>
              <TabsTrigger value="preview"><Eye className="h-4 w-4 mr-2" />Preview Email</TabsTrigger>
            </TabsList>
            <TabsContent value="variables" className="flex-1 overflow-auto mt-4">
              <div className="space-y-4 p-1">
                <p className="text-sm text-muted-foreground">Ubah nilai variabel untuk melihat tampilan email yang berbeda</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {selectedTemplate?.variables?.map((varName) => (
                    <div key={varName} className="space-y-2">
                      <Label className="text-xs font-medium">{`{{${varName}}}`}</Label>
                      <Input value={testVariables[varName] || ""} onChange={(e) => setTestVariables(prev => ({ ...prev, [varName]: e.target.value }))} placeholder={`Nilai untuk ${varName}`} />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="flex-1 overflow-hidden mt-4 flex flex-col">
              <div className="border rounded-lg p-3 bg-muted/50 mb-3">
                <p className="text-sm"><span className="font-medium">Subject: </span>{selectedTemplate ? replaceVariables(selectedTemplate.subject, testVariables) : ""}</p>
              </div>
              <ScrollArea className="flex-1 border rounded-lg">
                <div className="p-4"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      selectedTemplate ? replaceVariables(selectedTemplate.html_content, testVariables) : "",
                      {
                        // 'style','head','body','html','meta','title' dihapus — potensi CSS injection & meta refresh redirect
                        ALLOWED_TAGS: ['p','b','i','em','strong','a','ul','ol','li','h1','h2','h3','h4','h5','h6','blockquote','code','pre','img','br','hr','span','div','table','thead','tbody','tr','td','th','center'],
                        ALLOWED_ATTR: ['href','src','alt','title','class','target','rel','width','height','style','align','valign','bgcolor','border','cellpadding','cellspacing'],
                        ALLOW_DATA_ATTR: false,
                        FORBID_ATTR: ['onerror','onload','onmouseover','onclick','oninput','onfocus'],
                      }
                    ),
                  }}
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>Tutup</Button>
            <Button onClick={() => { setIsPreviewDialogOpen(false); if (selectedTemplate) openEditDialog(selectedTemplate); }}>
              <Edit className="h-4 w-4 mr-2" />Edit Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ══════════════════════════════════════════════════════════
// Tab 3: Notifications
// ══════════════════════════════════════════════════════════

function NotificationsTab() {
  const [settings, setSettings] = useState({
    registrationStatus: true,
    selectionStage: true,
    interviewSchedule: true,
    interviewReminder: true,
    finalResult: true,
  });

  const items = [
    { key: "registrationStatus", label: "Status Pendaftaran", description: "Email saat pendaftaran disetujui atau ditolak" },
    { key: "selectionStage", label: "Tahap Seleksi", description: "Email saat tahap seleksi berubah (lolos/tidak lolos)" },
    { key: "interviewSchedule", label: "Jadwal Wawancara", description: "Email undangan wawancara dengan jadwal" },
    { key: "interviewReminder", label: "Reminder Wawancara", description: "Email pengingat H-1 sebelum wawancara" },
    { key: "finalResult", label: "Hasil Akhir", description: "Email pengumuman hasil akhir seleksi" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifikasi Email Pendaftaran
        </CardTitle>
        <CardDescription>Konfigurasi email otomatis yang dikirim ke pendaftar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <Switch
              checked={settings[item.key as keyof typeof settings]}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, [item.key]: checked }))}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════
// Tab 4: Newsletter
// ══════════════════════════════════════════════════════════

function NewsletterTab() {
  const [settings, setSettings] = useState({
    welcomeEmail: true,
    confirmationEmail: true,
    broadcastEnabled: true,
  });

  const items = [
    { key: "welcomeEmail", label: "Email Selamat Datang", description: "Kirim email selamat datang ke subscriber baru" },
    { key: "confirmationEmail", label: "Email Konfirmasi", description: "Kirim email konfirmasi langganan (double opt-in)" },
    { key: "broadcastEnabled", label: "Broadcast Email", description: "Aktifkan fitur broadcast email ke semua subscriber" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Pengaturan Newsletter
        </CardTitle>
        <CardDescription>Konfigurasi email newsletter dan broadcast</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <Switch
              checked={settings[item.key as keyof typeof settings]}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, [item.key]: checked }))}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════
// Tab 5: Queue & SMTP (from ToolsSettings EmailQueueSettings)
// ══════════════════════════════════════════════════════════

function QueueTab() {
  const queryClient = useQueryClient();
  const [mailHost, setMailHost] = useState("smtp.gmail.com");
  const [mailPort, setMailPort] = useState(587);
  const [mailUsername, setMailUsername] = useState("");
  const [mailPassword, setMailPassword] = useState("");
  const [mailEncryption, setMailEncryption] = useState("TLS");
  const [mailFromAddress, setMailFromAddress] = useState("");
  const [mailFromName, setMailFromName] = useState("Forum Indonesia Muda");
  const [dailyRateLimit, setDailyRateLimit] = useState(2000);
  const [retryMaxAttempts, setRetryMaxAttempts] = useState(3);
  const [retryDelaySeconds, setRetryDelaySeconds] = useState(60);
  const [queueEnabled, setQueueEnabled] = useState(true);

  const { data: emailSettings, isLoading } = useQuery({
    queryKey: ["email-settings-queue"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      if (data) {
        setMailHost(data.mail_host || "smtp.gmail.com");
        setMailPort(data.mail_port || 587);
        setMailUsername(data.mail_username || "");
        setMailEncryption(data.mail_encryption || "TLS");
        setMailFromAddress(data.mail_from_address || "");
        setMailFromName(data.mail_from_name || "Forum Indonesia Muda");
        setDailyRateLimit(data.daily_rate_limit || 2000);
        setRetryMaxAttempts(data.retry_max_attempts || 3);
        setRetryDelaySeconds(data.retry_delay_seconds || 60);
        setQueueEnabled(data.queue_enabled ?? true);
      }
      return data;
    },
  });

  const { data: queueStats } = useQuery({
    queryKey: ["queue-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notification_queue").select("status");
      if (error) throw error;
      const stats = { pending: 0, processing: 0, sent: 0, failed: 0 };
      data?.forEach((n: any) => {
        if (stats[n.status as keyof typeof stats] !== undefined) stats[n.status as keyof typeof stats]++;
      });
      return stats;
    },
    refetchInterval: 10000,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updateData: any = {
        mail_host: mailHost, mail_port: mailPort, mail_username: mailUsername || null,
        mail_encryption: mailEncryption, mail_from_address: mailFromAddress || null, mail_from_name: mailFromName,
        daily_rate_limit: dailyRateLimit, retry_max_attempts: retryMaxAttempts, retry_delay_seconds: retryDelaySeconds,
        queue_enabled: queueEnabled, updated_at: new Date().toISOString(),
      };
      if (mailPassword && mailPassword !== "••••••••") updateData.mail_password_encrypted = mailPassword;
      if (emailSettings?.id) {
        const { error } = await supabase.from("email_settings").update(updateData).eq("id", emailSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("email_settings").insert(updateData);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["email-settings-queue"] }); toast.success("Pengaturan email berhasil disimpan"); },
    onError: (error: any) => toast.error(`Gagal menyimpan: ${error.message}`),
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />Status Queue Email</CardTitle>
          <CardDescription>Monitor antrian pengiriman email real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Pending", value: queueStats?.pending || 0, color: "text-yellow-600" },
              { label: "Processing", value: queueStats?.processing || 0, color: "text-blue-600" },
              { label: "Sent", value: queueStats?.sent || 0, color: "text-green-600" },
              { label: "Failed", value: queueStats?.failed || 0, color: "text-red-600" },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-lg bg-muted/50">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi SMTP Lanjutan</CardTitle>
          <CardDescription>Pengaturan teknis Gmail SMTP</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>SMTP Host</Label><Input value={mailHost} onChange={e => setMailHost(e.target.value)} /></div>
            <div className="space-y-2"><Label>Port</Label><Input type="number" value={mailPort} onChange={e => setMailPort(Number(e.target.value))} /></div>
            <div className="space-y-2"><Label>Username (Email)</Label><Input value={mailUsername} onChange={e => setMailUsername(e.target.value)} placeholder="noreply@domain.com" /></div>
            <div className="space-y-2"><Label>App Password</Label><Input type="password" value={mailPassword} onChange={e => setMailPassword(e.target.value)} placeholder={emailSettings?.mail_password_encrypted ? "••••••••" : "App Password"} /></div>
            <div className="space-y-2"><Label>Encryption</Label><Input value={mailEncryption} onChange={e => setMailEncryption(e.target.value)} /></div>
            <div className="space-y-2"><Label>From Address</Label><Input value={mailFromAddress} onChange={e => setMailFromAddress(e.target.value)} placeholder="noreply@domain.com" /></div>
            <div className="space-y-2 md:col-span-2"><Label>From Name</Label><Input value={mailFromName} onChange={e => setMailFromName(e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Queue</CardTitle>
          <CardDescription>Pengaturan antrian dan rate limiting email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium">Queue Aktif</p>
              <p className="text-sm text-muted-foreground">Aktifkan sistem antrian email</p>
            </div>
            <Switch checked={queueEnabled} onCheckedChange={setQueueEnabled} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2"><Label>Rate Limit (email/hari)</Label><Input type="number" value={dailyRateLimit} onChange={e => setDailyRateLimit(Number(e.target.value))} /></div>
            <div className="space-y-2"><Label>Max Retry Attempts</Label><Input type="number" value={retryMaxAttempts} onChange={e => setRetryMaxAttempts(Number(e.target.value))} /></div>
            <div className="space-y-2"><Label>Retry Delay (detik)</Label><Input type="number" value={retryDelaySeconds} onChange={e => setRetryDelaySeconds(Number(e.target.value))} /></div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Email Flow & Delay</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Jenis Email</th>
                    <th className="text-center py-2">Queue</th>
                    <th className="text-center py-2">Delay</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: "Verifikasi Email", delay: "0–10 detik" },
                    { type: "Reset Password", delay: "0 detik" },
                    { type: "Notifikasi Status", delay: "5–30 detik" },
                    { type: "Reminder", delay: "Scheduled" },
                    { type: "Login Notifikasi", delay: "0–5 detik" },
                  ].map(item => (
                    <tr key={item.type} className="border-b last:border-0">
                      <td className="py-2">{item.type}</td>
                      <td className="text-center py-2">✅</td>
                      <td className="text-center py-2 text-muted-foreground">{item.delay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Simpan Pengaturan SMTP & Queue
        </Button>
      </div>
    </>
  );
}
