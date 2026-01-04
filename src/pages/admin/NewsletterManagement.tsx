import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent as AlertDialogContentUI,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Search,
  Download,
  Trash2,
  Mail,
  Users,
  UserCheck,
  UserX,
  Loader2,
  Send,
  CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Pencil,
  ArrowUpAZ,
  ArrowDownZA,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

// Email validation regex
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

interface CSVImportResult {
  success: number;
  failed: number;
  duplicates: number;
  invalid: number;
  errors: string[];
}

export default function NewsletterManagement() {
  const { isSuperAdmin, user, profile } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isSubscriberDialogOpen, setIsSubscriberDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState("09:00");

  // CSV Import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<{ email: string; name: string }[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);

  // Subscriber form state
  const [subscriberForm, setSubscriberForm] = useState({
    email: "",
    name: "",
    is_active: true,
  });

  const resetSubscriberForm = () => {
    setSubscriberForm({ email: "", name: "", is_active: true });
    setEditingSubscriber(null);
  };

  const resetImportState = () => {
    setCsvFile(null);
    setCsvPreview([]);
    setImportProgress(0);
    setImportResult(null);
  };

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });
      if (error) throw error;
      return data as Subscriber[];
    },
  });

  const { data: scheduledBroadcasts, isLoading: loadingScheduled } = useQuery({
    queryKey: ["scheduled-broadcasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_broadcasts")
        .select("*")
        .order("scheduled_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Add/Edit subscriber mutation
  const saveSubscriberMutation = useMutation({
    mutationFn: async (data: typeof subscriberForm & { id?: string }) => {
      const payload = {
        email: data.email.toLowerCase().trim(),
        name: data.name.trim() || null,
        is_active: data.is_active,
      };

      if (data.id) {
        const { error } = await supabase
          .from("newsletter_subscribers")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("newsletter_subscribers").insert({
          ...payload,
          subscribed_at: new Date().toISOString(),
        });
        if (error) throw error;
      }

      // Audit log
      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: data.id ? "update_subscriber" : "add_subscriber",
        p_resource_type: "newsletter_subscriber",
        p_resource_id: data.id || null,
        p_details: { email: data.email },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      setIsSubscriberDialogOpen(false);
      resetSubscriberForm();
      toast({ title: editingSubscriber ? "Subscriber berhasil diperbarui" : "Subscriber berhasil ditambahkan" });
    },
    onError: (error) => {
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({
          is_active: !isActive,
          unsubscribed_at: isActive ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;

      // Audit log
      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: isActive ? "deactivate_subscriber" : "activate_subscriber",
        p_resource_type: "newsletter_subscriber",
        p_resource_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      toast({ title: "Status berhasil diperbarui" });
    },
    onError: (error) => {
      toast({ title: "Gagal memperbarui status", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (subscriber: Subscriber) => {
      const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", subscriber.id);
      if (error) throw error;

      // Audit log
      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: "delete_subscriber",
        p_resource_type: "newsletter_subscriber",
        p_resource_id: subscriber.id,
        p_details: { email: subscriber.email },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      toast({ title: "Subscriber berhasil dihapus" });
    },
    onError: (error) => {
      toast({ title: "Gagal menghapus subscriber", description: error.message, variant: "destructive" });
    },
  });

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: async (payload: { subject: string; content: string; testEmail: string }) => {
      const { data, error } = await supabase.functions.invoke("newsletter-broadcast", { body: payload });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setTestEmailSent(true);
      toast({ title: "Email test terkirim!", description: `Cek inbox ${profile?.email}` });
    },
    onError: (error) => {
      toast({ title: "Gagal mengirim test", description: error.message, variant: "destructive" });
    },
  });

  // Full broadcast mutation
  const broadcastMutation = useMutation({
    mutationFn: async (payload: { subject: string; content: string }) => {
      const { data, error } = await supabase.functions.invoke("newsletter-broadcast", { body: payload });
      if (error) throw error;
      return data as { success: boolean; total: number; sent: number; failed: number };
    },
    onSuccess: (data) => {
      setIsBroadcastOpen(false);
      resetBroadcastForm();
      toast({
        title: "Broadcast terkirim",
        description: `Target: ${data.total}, Terkirim: ${data.sent}, Gagal: ${data.failed}`,
      });
    },
    onError: (error) => {
      toast({ title: "Gagal mengirim broadcast", description: error.message, variant: "destructive" });
    },
  });

  // Schedule broadcast mutation
  const scheduleMutation = useMutation({
    mutationFn: async (payload: { subject: string; content: string; scheduled_at: string }) => {
      const { error } = await supabase.from("scheduled_broadcasts").insert({
        subject: payload.subject,
        content: payload.content,
        scheduled_at: payload.scheduled_at,
        created_by: user?.id,
        status: "pending",
      });
      if (error) throw error;

      // Audit log
      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: "schedule_broadcast",
        p_resource_type: "scheduled_broadcast",
        p_details: { subject: payload.subject, scheduled_at: payload.scheduled_at },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-broadcasts"] });
      setIsBroadcastOpen(false);
      resetBroadcastForm();
      toast({ title: "Broadcast dijadwalkan" });
    },
    onError: (error) => {
      toast({ title: "Gagal menjadwalkan", description: error.message, variant: "destructive" });
    },
  });

  // Cancel scheduled broadcast
  const cancelScheduledMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scheduled_broadcasts")
        .update({ status: "cancelled" })
        .eq("id", id);
      if (error) throw error;

      // Audit log
      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: "cancel_broadcast",
        p_resource_type: "scheduled_broadcast",
        p_resource_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-broadcasts"] });
      toast({ title: "Broadcast dibatalkan" });
    },
    onError: (error) => {
      toast({ title: "Gagal membatalkan", description: error.message, variant: "destructive" });
    },
  });

  const resetBroadcastForm = () => {
    setBroadcastSubject("");
    setBroadcastContent("");
    setTestEmailSent(false);
    setScheduledDate(undefined);
    setScheduledTime("09:00");
  };

  const handleEditSubscriber = (subscriber: Subscriber) => {
    setEditingSubscriber(subscriber);
    setSubscriberForm({
      email: subscriber.email,
      name: subscriber.name || "",
      is_active: subscriber.is_active,
    });
    setIsSubscriberDialogOpen(true);
  };

  const exportToCSV = () => {
    if (!subscribers?.length) return;
    const activeSubscribers = subscribers.filter((s) => s.is_active);
    const headers = ["Email", "Nama", "Tanggal Berlangganan", "Status"];
    const rows = activeSubscribers.map((s) => [
      s.email,
      s.name || "",
      s.subscribed_at ? format(new Date(s.subscribed_at), "dd MMM yyyy", { locale: id }) : "",
      s.is_active ? "Aktif" : "Tidak Aktif",
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `newsletter-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export berhasil" });
  };

  // Parse CSV file
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({ title: "Format file tidak valid", description: "Hanya file CSV yang diperbolehkan", variant: "destructive" });
      return;
    }

    setCsvFile(file);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header row
      const dataLines = lines.slice(1);
      const parsed: { email: string; name: string }[] = [];

      for (const line of dataLines) {
        // Handle CSV with quotes
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (matches && matches.length >= 1) {
          const email = matches[0].replace(/"/g, '').trim();
          const name = matches[1]?.replace(/"/g, '').trim() || '';
          if (email) {
            parsed.push({ email, name });
          }
        }
      }

      setCsvPreview(parsed.slice(0, 10)); // Preview first 10 rows
      toast({ title: `${parsed.length} data ditemukan`, description: "Preview 10 data pertama ditampilkan" });
    };
    reader.readAsText(file);
  };

  // Import CSV to database
  const handleImportCSV = async () => {
    if (!csvFile) return;

    setIsImporting(true);
    setImportProgress(0);
    
    const result: CSVImportResult = {
      success: 0,
      failed: 0,
      duplicates: 0,
      invalid: 0,
      errors: [],
    };

    try {
      // Read full file
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const dataLines = lines.slice(1);
      
      // Get existing emails
      const existingEmails = new Set(subscribers?.map(s => s.email.toLowerCase()) || []);
      
      const toInsert: { email: string; name: string | null; is_active: boolean; subscribed_at: string }[] = [];
      
      for (const line of dataLines) {
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (matches && matches.length >= 1) {
          const email = matches[0].replace(/"/g, '').trim().toLowerCase();
          const name = matches[1]?.replace(/"/g, '').trim() || null;
          
          if (!email) continue;
          
          if (!isValidEmail(email)) {
            result.invalid++;
            result.errors.push(`Invalid email: ${email}`);
            continue;
          }
          
          if (existingEmails.has(email)) {
            result.duplicates++;
            continue;
          }
          
          existingEmails.add(email);
          toInsert.push({
            email,
            name,
            is_active: true,
            subscribed_at: new Date().toISOString(),
          });
        }
      }

      // Batch insert
      const batchSize = 50;
      for (let i = 0; i < toInsert.length; i += batchSize) {
        const batch = toInsert.slice(i, i + batchSize);
        const { error } = await supabase.from("newsletter_subscribers").insert(batch);
        
        if (error) {
          result.failed += batch.length;
          result.errors.push(error.message);
        } else {
          result.success += batch.length;
        }
        
        setImportProgress(Math.round(((i + batch.length) / toInsert.length) * 100));
      }

      // Audit log
      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: "bulk_import_subscribers",
        p_resource_type: "newsletter_subscriber",
        p_details: { 
          success: result.success, 
          failed: result.failed, 
          duplicates: result.duplicates,
          invalid: result.invalid,
        },
      });

      setImportResult(result);
      queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      
      toast({ 
        title: "Import selesai", 
        description: `${result.success} berhasil, ${result.duplicates} duplikat, ${result.invalid} tidak valid`,
      });
    } catch (error: any) {
      toast({ title: "Import gagal", description: error.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  const filteredSubscribers = subscribers?.filter((s) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return s.email.toLowerCase().includes(search) || (s.name && s.name.toLowerCase().includes(search));
  }).sort((a, b) => {
    const comparison = a.email.localeCompare(b.email, 'id');
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const stats = {
    total: subscribers?.length || 0,
    active: subscribers?.filter((s) => s.is_active).length || 0,
    inactive: subscribers?.filter((s) => !s.is_active).length || 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "sent":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Terkirim</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Gagal</Badge>;
      case "cancelled":
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground">Kelola subscriber newsletter FIM</p>
        </div>
      <div className="flex items-center gap-2 flex-wrap">
          {/* Import CSV Dialog */}
          <Dialog 
            open={isImportDialogOpen} 
            onOpenChange={(open) => { 
              setIsImportDialogOpen(open); 
              if (!open) resetImportState(); 
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Import Subscriber dari CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>File CSV</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      disabled={isImporting}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Format: Email, Nama (header di baris pertama)
                  </p>
                </div>

                {csvPreview.length > 0 && (
                  <div className="space-y-2">
                    <Label>Preview ({csvPreview.length} data pertama)</Label>
                    <div className="max-h-40 overflow-y-auto border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvPreview.map((row, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-sm">{row.email}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{row.name || "—"}</TableCell>
                              <TableCell>
                                {isValidEmail(row.email) ? (
                                  <Badge className="bg-green-100 text-green-800 text-xs">Valid</Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-xs">Invalid</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {isImporting && (
                  <div className="space-y-2">
                    <Label>Progress Import</Label>
                    <Progress value={importProgress} />
                    <p className="text-xs text-center text-muted-foreground">{importProgress}%</p>
                  </div>
                )}

                {importResult && (
                  <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Berhasil:</span>
                      <span className="font-medium text-green-600">{importResult.success}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Duplikat (dilewati):</span>
                      <span className="font-medium text-yellow-600">{importResult.duplicates}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Email tidak valid:</span>
                      <span className="font-medium text-red-600">{importResult.invalid}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Gagal:</span>
                      <span className="font-medium text-red-600">{importResult.failed}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleImportCSV}
                  disabled={!csvFile || isImporting || importResult !== null}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mengimport...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Import Semua Data
                    </>
                  )}
                </Button>

                {importResult && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      resetImportState();
                      setIsImportDialogOpen(false);
                    }}
                  >
                    Selesai
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Subscriber Dialog */}
          <Dialog 
            open={isSubscriberDialogOpen} 
            onOpenChange={(open) => { 
              setIsSubscriberDialogOpen(open); 
              if (!open) resetSubscriberForm(); 
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Subscriber
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSubscriber ? "Edit Subscriber" : "Tambah Subscriber Manual"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={subscriberForm.email}
                    onChange={(e) => setSubscriberForm({ ...subscriberForm, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama</Label>
                  <Input
                    value={subscriberForm.name}
                    onChange={(e) => setSubscriberForm({ ...subscriberForm, name: e.target.value })}
                    placeholder="Nama subscriber"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={subscriberForm.is_active}
                    onChange={(e) => setSubscriberForm({ ...subscriberForm, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <Label>Aktif</Label>
                </div>
                <Button
                  className="w-full"
                  onClick={() => saveSubscriberMutation.mutate({ ...subscriberForm, id: editingSubscriber?.id })}
                  disabled={saveSubscriberMutation.isPending || !subscriberForm.email.includes("@")}
                >
                  {saveSubscriberMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {editingSubscriber ? "Simpan Perubahan" : "Tambah Subscriber"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {isSuperAdmin && (
            <Dialog open={isBroadcastOpen} onOpenChange={(open) => { setIsBroadcastOpen(open); if (!open) resetBroadcastForm(); }}>
              <DialogTrigger asChild>
                <Button variant="outline"><Send className="h-4 w-4 mr-2" />Kirim Broadcast</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Kirim Email Broadcast</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Subjek</Label>
                    <Input value={broadcastSubject} onChange={(e) => setBroadcastSubject(e.target.value)} placeholder="Contoh: Update Program FIM Januari" />
                  </div>
                  <div className="space-y-2">
                    <Label>Konten (teks)</Label>
                    <Textarea value={broadcastContent} onChange={(e) => setBroadcastContent(e.target.value)} placeholder="Tulis isi email..." rows={6} />
                    <p className="text-xs text-muted-foreground">Email akan dikirim ke {stats.active} subscriber aktif.</p>
                  </div>

                  {/* Step 1: Test Email */}
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">1. Test Email Dulu</span>
                      {testEmailSent && <Badge className="bg-green-100 text-green-800">✓ Terkirim</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">Kirim ke email Anda ({profile?.email}) untuk preview.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testEmailMutation.mutate({ subject: broadcastSubject, content: broadcastContent, testEmail: profile?.email || "" })}
                      disabled={testEmailMutation.isPending || !broadcastSubject.trim() || !broadcastContent.trim()}
                    >
                      {testEmailMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                      Kirim Test
                    </Button>
                  </div>

                  {/* Step 2: Send or Schedule */}
                  <Tabs defaultValue="now" className="mt-4">
                    <TabsList className="w-full">
                      <TabsTrigger value="now" className="flex-1">Kirim Sekarang</TabsTrigger>
                      <TabsTrigger value="schedule" className="flex-1">Jadwalkan</TabsTrigger>
                    </TabsList>
                    <TabsContent value="now" className="mt-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="w-full" disabled={!testEmailSent || broadcastMutation.isPending || !broadcastSubject.trim() || !broadcastContent.trim()}>
                            {broadcastMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                            Kirim ke {stats.active} Subscriber
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContentUI>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Kirim Broadcast?</AlertDialogTitle>
                            <AlertDialogDescription>Email akan dikirim ke {stats.active} subscriber aktif. Pastikan Anda sudah memeriksa email test.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => broadcastMutation.mutate({ subject: broadcastSubject, content: broadcastContent })}>
                              Kirim Sekarang
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContentUI>
                      </AlertDialog>
                      {!testEmailSent && <p className="text-xs text-muted-foreground mt-2 text-center">Kirim test email terlebih dahulu</p>}
                    </TabsContent>
                    <TabsContent value="schedule" className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tanggal</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !scheduledDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {scheduledDate ? format(scheduledDate, "PPP", { locale: id }) : "Pilih tanggal"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate} disabled={(date) => date < new Date()} initialFocus className="pointer-events-auto" />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>Waktu</Label>
                          <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => {
                          if (!scheduledDate) return;
                          const [hours, minutes] = scheduledTime.split(":").map(Number);
                          const dt = new Date(scheduledDate);
                          dt.setHours(hours, minutes, 0, 0);
                          scheduleMutation.mutate({ subject: broadcastSubject, content: broadcastContent, scheduled_at: dt.toISOString() });
                        }}
                        disabled={scheduleMutation.isPending || !broadcastSubject.trim() || !broadcastContent.trim() || !scheduledDate}
                      >
                        {scheduleMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Clock className="h-4 w-4 mr-2" />}
                        Jadwalkan Broadcast
                      </Button>
                    </TabsContent>
                  </Tabs>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button onClick={exportToCSV} disabled={!subscribers?.length}>
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Subscriber</p><p className="text-3xl font-bold">{stats.total}</p></div><Users className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Aktif</p><p className="text-3xl font-bold text-green-600">{stats.active}</p></div><UserCheck className="h-8 w-8 text-green-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Tidak Aktif</p><p className="text-3xl font-bold text-gray-400">{stats.inactive}</p></div><UserX className="h-8 w-8 text-gray-400" /></div></CardContent></Card>
      </div>

      {/* Scheduled Broadcasts */}
      {isSuperAdmin && scheduledBroadcasts && scheduledBroadcasts.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Broadcast Terjadwal</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subjek</TableHead>
                  <TableHead>Jadwal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hasil</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledBroadcasts.map((broadcast: any) => (
                  <TableRow key={broadcast.id}>
                    <TableCell className="font-medium max-w-xs truncate">{broadcast.subject}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{format(new Date(broadcast.scheduled_at), "PPP HH:mm", { locale: id })}</TableCell>
                    <TableCell>{getStatusBadge(broadcast.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {broadcast.status === "sent" && `${broadcast.sent_count}/${broadcast.total_recipients} terkirim`}
                      {broadcast.status === "failed" && broadcast.error_message}
                    </TableCell>
                    <TableCell>
                      {broadcast.status === "pending" && (
                        <Button variant="ghost" size="sm" onClick={() => cancelScheduledMutation.mutate(broadcast.id)} disabled={cancelScheduledMutation.isPending}>
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Subscribers Table */}
      <Card>
        <CardHeader><CardTitle>Daftar Subscriber</CardTitle><CardDescription>Daftar email yang berlangganan newsletter</CardDescription></CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari email atau nama..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              title={sortOrder === "asc" ? "Urutkan Z-A" : "Urutkan A-Z"}
            >
              {sortOrder === "asc" ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownZA className="h-4 w-4" />}
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : filteredSubscribers?.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{subscriber.email}</div></TableCell>
                      <TableCell className="text-muted-foreground">{subscriber.name || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={subscriber.is_active ? "default" : "secondary"} className={subscriber.is_active ? "bg-green-100 text-green-800" : ""}>
                          {subscriber.is_active ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{subscriber.subscribed_at ? format(new Date(subscriber.subscribed_at), "dd MMM yyyy", { locale: id }) : "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditSubscriber(subscriber)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate({ id: subscriber.id, isActive: subscriber.is_active })} disabled={toggleMutation.isPending}>
                            {subscriber.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          {isSuperAdmin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild><Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                              <AlertDialogContentUI>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Subscriber?</AlertDialogTitle>
                                  <AlertDialogDescription>Anda yakin ingin menghapus {subscriber.email}? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMutation.mutate(subscriber)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hapus"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContentUI>
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
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{searchTerm ? "Tidak ada subscriber yang cocok" : "Belum ada subscriber"}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
